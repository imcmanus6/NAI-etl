const fs = require('fs');
const DIR = __dirname;

// --- per-schema config: which TSVs, label, lateral-specific domain map + FK hints ---
const LATERAL_FK = {
  debtorid:'rdebt_debtor', case_id:'rdebt_cases', caseid:'rdebt_cases', operatorid:'rdebt_users',
  bailiffid:'rdebt_users', userid:'rdebt_users', user_id:'rdebt_users', created_by:'rdebt_users',
  updated_by:'rdebt_users', manager_id:'rdebt_users', client_id:'rdebt_clients', clientid:'rdebt_clients',
  scheme_id:'rdebt_schemes', current_stage_id:'rdebt_stages', stage_id:'rdebt_stages',
  arrangement_id:'rdebt_arrangements', payment_id:'rdebt_payment', financial_transaction_id:'financial_transaction',
  financial_scheme_instance_id:'financial_scheme_instance', financial_bucket_instance_id:'financial_bucket_instance',
  financial_transaction_split_id:'financial_transaction_split', branch_id:'rdebt_branches', court_id:'rdebt_courts',
  scheme_manager_id:'scheme_manager', participant_id:'participants',
};
const LATERAL_DOMAINS = {
  'Case & People':['rdebt_cases','rdebt_debtor','rdebt_debtor_employers','addresses','debtor_telephones','emails','rdebt_case_groups','rdebt_case_group_links','case_participants','participants','rdebt_case_variables','custom_fields'],
  'Financial — Payments':['rdebt_payment','rdebt_payments_out','rdebt_payment_type','rdebt_payment_actions','rdebt_payment_source','financial_transaction','financial_transaction_split','financial_bucket_instance','financial_scheme_instance','transaction_adjustment'],
  'Financial — Fees & Arrangements':['rdebt_case_fees','rdebt_fees','rdebt_case_costs','rdebt_arrangements','rdebt_remittances','remittance_schedule'],
  'Clients, Schemes & Officers':['rdebt_clients','client_schemes','rdebt_schemes','scheme_manager','rdebt_stages','rdebt_users','officer_types','rdebt_branches','rdebt_courts'],
  'Activity & Contact':['rdebt_alerts_calendar','call_history','call_conversations','complaints'],
};

// coarse domain buckets for the full Lateral schema (tables not in the curated core map)
function coarseDomain(name) {
  if (name.startsWith('financial_')) return 'Financial engine';
  if (/^rdebt_(payment|arrangement|remittance|fee|invoice)/.test(name)) return 'Financial — other';
  if (/^(rdebt_)?(case|debtor|address|participant|relationship)/.test(name)) return 'Case & People — other';
  if (/^(rdebt_)?(user|role|permission|access|auth|officer|bailiff|team|group)/.test(name)) return 'Users, roles & access';
  if (/^(rdebt_)?(letter|template|email|sms|communication|call|document|mpdf)/.test(name)) return 'Communication & documents';
  if (/^(rdebt_)?(workflow|stage|alert|activity|event|signal|timer|magic)/.test(name)) return 'Workflow & alerts';
  if (/^(rdebt_)?(scheme|client|branch|court|contractor)/.test(name)) return 'Clients, schemes & orgs';
  if (/^(rdebt_)?(import|export|batch|data_warehouse|migration|allocation)/.test(name)) return 'Import, export & batch';
  if (/^(rdebt_)?(compliance|complaint|breathing|dpa)/.test(name)) return 'Compliance';
  return 'Config, lookups & system';
}

function buildSchema({ id, label, source, colFile, rowFile, explicitFk = {}, domains = null, prefixes = [], coarse = false }) {
  const cols = fs.readFileSync(`${DIR}/${colFile}`, 'utf8').trim().split('\n').map(l => l.split('\t'));
  const rowc = Object.fromEntries(fs.readFileSync(`${DIR}/${rowFile}`, 'utf8').trim().split('\n')
    .map(l => { const [t, r] = l.split('\t'); return [t, Number(r) || 0]; }));
  const tables = {};
  for (const [t, c, type, nullable, key, comment] of cols)
    (tables[t] ??= { name: t, approxRows: rowc[t] ?? null, columns: [] })
      .columns.push({ name: c, type, nullable: nullable === 'YES', key: key || null, comment: comment || null });
  const known = new Set(Object.keys(tables));

  const resolveFk = (col) => {
    const c = col.toLowerCase();
    if (c === 'id') return null;
    if (explicitFk[c] && known.has(explicitFk[c])) return explicitFk[c];
    const m = c.match(/^(.*?)_?id$/); if (!m || !m[1]) return null;
    const base = m[1];
    const cands = [base, `${base}s`, base.replace(/s$/, '')];
    for (const p of prefixes) cands.push(`${p}${base}`, `${p}${base}s`);
    for (const cand of cands) if (known.has(cand) && cand !== col) return cand;
    return null;
  };
  const domainOf = {};
  if (domains) for (const [d, ts] of Object.entries(domains)) for (const t of ts) domainOf[t] = d;

  for (const t of Object.values(tables)) {
    t.relationships = [];
    for (const col of t.columns) {
      const target = resolveFk(col.name);
      if (target && target !== t.name) { col.fk = target; t.relationships.push({ column: col.name, references: target }); }
    }
    t.domain = domainOf[t.name] || (coarse ? coarseDomain(t.name) : (domains ? 'Other' : 'All tables'));
  }
  const seen = []; for (const t of Object.values(tables)) if (!seen.includes(t.domain)) seen.push(t.domain);
  const domainList = coarse ? seen.sort() : (domains ? Object.keys(domains).concat('Other') : ['All tables']);
  return {
    id, label, source,
    tableCount: Object.keys(tables).length,
    columnCount: cols.length,
    joinCount: Object.values(tables).reduce((n, t) => n + t.relationships.length, 0),
    domains: domainList,
    tables: Object.values(tables).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

const schemas = [
  buildSchema({ id:'lateral', label:'Lateral (uscollect)', source:'Lateral tenant DB — reportable core',
    colFile:'nai-columns.tsv', rowFile:'nai-rowcounts.tsv', explicitFk:LATERAL_FK, domains:LATERAL_DOMAINS, prefixes:['rdebt_'] }),
  buildSchema({ id:'lateral-full', label:'Lateral (full)', source:'Lateral tenant DB — all tables',
    colFile:'lateral-full-columns.tsv', rowFile:'lateral-full-rowcounts.tsv', explicitFk:LATERAL_FK, domains:LATERAL_DOMAINS, prefixes:['rdebt_'], coarse:true }),
  buildSchema({ id:'cashmere', label:'Cashmere', source:'Cashmere DB — all tables',
    colFile:'cashmere-columns.tsv', rowFile:'cashmere-rowcounts.tsv', prefixes:['cx_','auth_'] }),
];

const NOTE = 'Relationships are INFERRED from column-naming conventions; these schemas have no foreign-key constraints. Treat inferred joins as a starting map to verify, not a contract.';

// combined JSON (source of truth for the explorer)
fs.writeFileSync(`${DIR}/lateral-schema.json`, JSON.stringify({ note: NOTE, schemas }, null, 2));

// per-schema markdown dictionaries
for (const s of schemas) {
  let md = [`# ${s.label} — Schema Data Dictionary\n`, `Source: ${s.source}. **${s.tableCount} tables, ${s.columnCount} columns, ${s.joinCount} inferred joins.**\n`, `> ${NOTE}\n`];
  for (const d of s.domains) {
    const dt = s.tables.filter(t => t.domain === d); if (!dt.length) continue;
    md.push(`\n## ${d}\n`);
    for (const t of dt) {
      md.push(`\n### \`${t.name}\`${t.approxRows != null ? `  — ~${t.approxRows.toLocaleString()} rows` : ''}`);
      if (t.relationships.length) md.push(`_Joins:_ ${t.relationships.map(r => `\`${r.column}\`→\`${r.references}\``).join(', ')}`);
      md.push(`\n| Column | Type | Null | Key | → |\n|---|---|---|---|---|`);
      for (const c of t.columns) md.push(`| ${c.name} | ${c.type} | ${c.nullable ? 'Y' : ''} | ${c.key || ''} | ${c.fk ? `\`${c.fk}\`` : ''} |`);
    }
  }
  fs.writeFileSync(`${DIR}/dict-${s.id}.md`, md.join('\n'));
}

console.log('Built:', schemas.map(s => `${s.label} (${s.tableCount}t/${s.columnCount}c/${s.joinCount}j)`).join(', '));
