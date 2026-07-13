/**
 * HL7 v2 connector (MEDENT Collection Interface and similar batch feeds).
 *
 * HL7 is segmented and hierarchical: a file is a stream of messages, each a set
 * of segments (MSH, PID, PV1, GT1, FT1, …); fields are `|`-separated and
 * components `^`-separated. MEDENT emits an ADT^A08 (demographics) followed by a
 * DFT^P03 (financials) per patient, so ONE file yields TWO related entities:
 *
 *   patient      — one row per MRN (demographics, guarantor, ledger totals)
 *   transaction  — one row per FT1 (charge/payment/adjustment), keyed by MRN
 *
 * Field positions follow the MEDENT HL7 Collection Interface Export Spec. The
 * layout is data, not code — other HL7 feeds can override via config.fieldMap.
 */
import type {
  Connector,
  ConnectionRuntime,
  ConnectorCapabilities,
  ReadOptions,
  RecordBatch,
  SourceRecord,
  TestConnectionResult,
} from '@etl/connector-sdk';
import type { CanonicalSchema, CanonicalType, Entity, Field, Relationship } from '@etl/schema-model';

const CAPS: ConnectorCapabilities = {
  canTestConnection: true,
  canDiscoverSchema: true,
  canReadData: true,
  canWriteData: false,
  supportsPagination: false,
  supportsIncrementalExtraction: false,
  supportsChangeTracking: false,
  supportsStreaming: true,
  supportsBatchWrites: false,
  supportsTransactions: false,
  supportsSchemaInference: true,
};

// --- Parsing ----------------------------------------------------------------

export interface Hl7Segment {
  id: string;
  fields: string[]; // fields[0] === id; fields[n] === segment field n (non-MSH)
}
export interface Hl7Message {
  type: string; // e.g. "ADT^A08" | "DFT^P03"
  segments: Hl7Segment[];
}

/** Split a batch HL7 payload into messages (each begins with an MSH segment). */
export function parseHl7(content: string): Hl7Message[] {
  const messages: Hl7Message[] = [];
  let current: Hl7Message | null = null;
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.replace(/\r$/, '');
    if (!/^[A-Z][A-Z0-9]{2}\|/.test(line)) continue; // not a segment line
    const fields = line.split('|');
    const id = fields[0]!;
    if (id === 'MSH') {
      if (current) messages.push(current);
      // For MSH the separator counts as MSH-1, so MSH-9 (type) is fields[8].
      current = { type: fields[8] ?? '', segments: [{ id, fields }] };
    } else if (current) {
      current.segments.push({ id, fields });
    }
  }
  if (current) messages.push(current);
  return messages;
}

const field = (seg: Hl7Segment | undefined, n: number): string => (seg?.fields[n] ?? '').trim();
const comp = (value: string, i: number): string => (value.split('^')[i] ?? '').trim();
const first = (msg: Hl7Message, id: string) => msg.segments.find((s) => s.id === id);
const all = (msg: Hl7Message, id: string) => msg.segments.filter((s) => s.id === id);

const TXN_TYPE_DESC: Record<string, string> = {
  CG: 'Charge',
  FC: 'Finance Charge',
  PY: 'Payment',
  AJ: 'Adjustment',
};

export interface MedentRecords {
  patients: SourceRecord[];
  transactions: SourceRecord[];
}

/**
 * Flatten HL7 messages into patient + transaction records per the MEDENT spec.
 * ADT and DFT messages for the same MRN are merged (demographics from ADT/PID +
 * GT1, ledger totals from DFT/PV1, transactions from DFT/FT1).
 */
export function extractMedent(messages: Hl7Message[]): MedentRecords {
  const patients = new Map<string, SourceRecord>();
  const transactions: SourceRecord[] = [];

  const patientFor = (mrn: string): SourceRecord => {
    let p = patients.get(mrn);
    if (!p) {
      p = { mrn };
      patients.set(mrn, p);
    }
    return p;
  };

  for (const msg of messages) {
    const pid = first(msg, 'PID');
    const mrn = field(pid, 3) || field(pid, 2);
    if (!mrn) continue;
    const p = patientFor(mrn);

    // Demographics (PID) — first non-empty wins (the ADT PID carries them).
    if (pid) {
      const name = field(pid, 5);
      if (name && !p.last_name) {
        p.last_name = comp(name, 0);
        p.first_name = comp(name, 1);
        p.middle_initial = comp(name, 2);
      }
      if (!p.dob) p.dob = field(pid, 7);
      const addr = field(pid, 11);
      if (addr && !p.address_line) {
        p.address_line = comp(addr, 0);
        p.city = comp(addr, 2);
        p.state = comp(addr, 3);
        p.zip = comp(addr, 4);
      }
      const phone = field(pid, 13);
      if (phone && !p.home_phone) {
        p.home_phone = comp(phone, 0);
        p.cell_phone = comp(phone, 1);
        p.email = comp(phone, 3);
      }
    }

    // Guarantor (GT1)
    const gt1 = first(msg, 'GT1');
    if (gt1 && !p.guarantor_number) {
      p.guarantor_number = field(gt1, 2);
      const gname = field(gt1, 3);
      p.guarantor_last_name = comp(gname, 0);
      p.guarantor_first_name = comp(gname, 1);
      const gaddr = field(gt1, 5);
      p.guarantor_address_line = comp(gaddr, 0);
      p.guarantor_city = comp(gaddr, 2);
      p.guarantor_state = comp(gaddr, 3);
      p.guarantor_zip = comp(gaddr, 4);
      p.guarantor_home_phone = comp(field(gt1, 6), 0);
      p.guarantor_dob = field(gt1, 8);
    }

    // Ledger totals (DFT PV1-41,46..50) + location
    const pv1 = first(msg, 'PV1');
    if (pv1 && field(pv1, 46)) {
      p.last_statement_date = field(pv1, 41);
      p.current_balance = field(pv1, 46);
      p.total_charges = field(pv1, 47);
      p.total_adjustments = field(pv1, 48);
      p.total_payments = field(pv1, 49);
      p.total_finance_charges = field(pv1, 50);
      const loc = field(pv1, 3);
      p.location_code = comp(loc, 0);
      p.location_name = comp(loc, 8);
    }

    // Transactions (FT1, one per billable item)
    for (const ft1 of all(msg, 'FT1')) {
      const type = field(ft1, 6);
      const performed = field(ft1, 20);
      const loc = field(ft1, 16);
      transactions.push({
        patient_mrn: mrn,
        set_id: field(ft1, 1),
        transaction_id: field(ft1, 2),
        transaction_date: field(ft1, 4),
        transaction_type: type,
        transaction_type_desc: TXN_TYPE_DESC[type] ?? type,
        amount: field(ft1, 11),
        location_code: comp(loc, 0),
        location_name: comp(loc, 8),
        performed_by_npi: comp(performed, 0),
        performed_by_last_name: comp(performed, 1),
        performed_by_first_name: comp(performed, 2),
        supervising_npi: comp(field(ft1, 21), 0),
      });
    }
  }

  return { patients: [...patients.values()], transactions };
}

// --- Canonical schema (two entities + relationship) -------------------------

type FieldDef = [name: string, type: CanonicalType, pk?: boolean, fk?: boolean];

const PATIENT_FIELDS: FieldDef[] = [
  ['mrn', 'string', true],
  ['last_name', 'string'],
  ['first_name', 'string'],
  ['middle_initial', 'string'],
  ['dob', 'date'],
  ['address_line', 'string'],
  ['city', 'string'],
  ['state', 'string'],
  ['zip', 'string'],
  ['home_phone', 'string'],
  ['cell_phone', 'string'],
  ['email', 'string'],
  ['guarantor_number', 'string'],
  ['guarantor_last_name', 'string'],
  ['guarantor_first_name', 'string'],
  ['guarantor_dob', 'date'],
  ['guarantor_address_line', 'string'],
  ['guarantor_city', 'string'],
  ['guarantor_state', 'string'],
  ['guarantor_zip', 'string'],
  ['guarantor_home_phone', 'string'],
  ['current_balance', 'decimal'],
  ['total_charges', 'decimal'],
  ['total_adjustments', 'decimal'],
  ['total_payments', 'decimal'],
  ['total_finance_charges', 'decimal'],
  ['last_statement_date', 'string'],
  ['location_code', 'string'],
  ['location_name', 'string'],
];

const TRANSACTION_FIELDS: FieldDef[] = [
  ['patient_mrn', 'string', false, true],
  ['set_id', 'integer'],
  ['transaction_id', 'string'],
  ['transaction_date', 'date'],
  ['transaction_type', 'string'],
  ['transaction_type_desc', 'string'],
  ['amount', 'decimal'],
  ['location_code', 'string'],
  ['location_name', 'string'],
  ['performed_by_npi', 'string'],
  ['performed_by_last_name', 'string'],
  ['performed_by_first_name', 'string'],
  ['supervising_npi', 'string'],
];

function toFields(entity: string, defs: FieldDef[]): Field[] {
  return defs.map(([name, dataType, pk, fk], i) => ({
    id: `${entity}.${name}`,
    name,
    ordinal: i,
    dataType,
    nullable: !pk,
    isPrimaryKey: Boolean(pk),
    isForeignKey: Boolean(fk),
  }));
}

/** The canonical schema an HL7 MEDENT feed maps to: patient + transaction. */
export function buildHl7Schema(name: string): CanonicalSchema {
  const patient: Entity = {
    id: 'patient',
    name: 'patient',
    kind: 'file',
    classification: 'core',
    inferredPurpose: 'One row per patient (MRN) with demographics, guarantor and ledger totals.',
    fields: toFields('patient', PATIENT_FIELDS),
    primaryKey: ['mrn'],
  };
  const transaction: Entity = {
    id: 'transaction',
    name: 'transaction',
    kind: 'file',
    classification: 'transaction',
    inferredPurpose: 'One row per FT1 financial transaction (charge/payment/adjustment).',
    fields: toFields('transaction', TRANSACTION_FIELDS),
  };
  const relationship: Relationship = {
    id: 'transaction_patient_fk',
    name: 'transaction.patient_mrn → patient.mrn',
    fromEntityId: 'transaction',
    fromFields: ['patient_mrn'],
    toEntityId: 'patient',
    toFields: ['mrn'],
    cardinality: 'one_to_many',
    declared: true,
    certainty: 'confirmed',
    evidence: [{ kind: 'foreign_key', detail: 'FT1 transactions share the message PID MRN' }],
  };
  return {
    id: `${name}-hl7`,
    name,
    intakeMethod: 'hl7',
    entities: [patient, transaction],
    relationships: [relationship],
    provenance: { source: 'hl7', standard: 'HL7 v2 (MEDENT Collection Interface)' },
    createdAt: new Date().toISOString(),
  };
}

// --- Connector --------------------------------------------------------------

export class Hl7Connector implements Connector {
  readonly type = 'hl7' as const;
  readonly capabilities = CAPS;

  private async load(conn: ConnectionRuntime): Promise<MedentRecords> {
    const { readFile } = await import('node:fs/promises');
    const content = await readFile(conn.config.filePath as string, 'utf8');
    return extractMedent(parseHl7(content));
  }

  async testConnection(conn: ConnectionRuntime): Promise<TestConnectionResult> {
    try {
      const { patients, transactions } = await this.load(conn);
      return { ok: true, message: `Parsed ${patients.length} patients, ${transactions.length} transactions` };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  }

  async discoverSchema(conn: ConnectionRuntime): Promise<CanonicalSchema> {
    return buildHl7Schema((conn.config.name as string) ?? 'hl7-feed');
  }

  async *read(conn: ConnectionRuntime, opts: ReadOptions): AsyncIterable<RecordBatch> {
    const { patients, transactions } = await this.load(conn);
    const rows = opts.entity === 'patient' ? patients : transactions;
    const limited = opts.limit ? rows.slice(0, opts.limit) : rows;
    const batchSize = opts.batchSize ?? 1000;
    for (let i = 0; i < limited.length; i += batchSize) {
      yield { records: limited.slice(i, i + batchSize), nextCursor: null, done: i + batchSize >= limited.length };
    }
  }
}
