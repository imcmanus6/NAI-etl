/**
 * @nai/core — action orchestration contract.
 *
 * The AI/UI prepares an action; LATERAL executes and validates it. The core
 * defines the interface; the edition adapter (Lateral) implements it. The stub
 * below stands in for Lateral in the demo — it enforces the exclusion rules
 * (compliance hold / active arrangement / locked) that Lateral would own.
 */

export interface ActionRequest {
  type: 'create_worklist';
  params: Record<string, unknown>; // e.g. { worklistName, team }
}

export interface AccountRow {
  account_id: number;
  current_balance: number;
  has_compliance_hold?: boolean;
  has_active_arrangement?: boolean;
  is_locked?: boolean;
}

export interface EligibilityResult {
  account_id: number;
  eligible: boolean;
  reason?: string;
}

export interface ExecResult {
  ok: boolean;
  ref: string;
  added: number;
  failed: number;
  deepLink: string;
  failures: { account_id: number; reason: string }[];
}

/** Implemented by each edition adapter (Lateral first; Cashmere later). */
export interface LateralActionClient {
  /** Lateral-owned eligibility check (compliance/arrangement/lock/workflow). */
  validateEligibility(accounts: AccountRow[], action: ActionRequest): Promise<EligibilityResult[]>;
  /** Execute the approved action via Lateral APIs. Never called before confirm. */
  execute(eligible: AccountRow[], action: ActionRequest): Promise<ExecResult>;
}

/** Demo stand-in for Lateral. Deterministic; no network. */
export class StubLateralActionClient implements LateralActionClient {
  async validateEligibility(accounts: AccountRow[], _action: ActionRequest): Promise<EligibilityResult[]> {
    return accounts.map((a) => {
      if (a.has_compliance_hold) return { account_id: a.account_id, eligible: false, reason: 'compliance hold' };
      if (a.has_active_arrangement) return { account_id: a.account_id, eligible: false, reason: 'active arrangement' };
      if (a.is_locked) return { account_id: a.account_id, eligible: false, reason: 'account locked' };
      return { account_id: a.account_id, eligible: true };
    });
  }

  async execute(eligible: AccountRow[], action: ActionRequest): Promise<ExecResult> {
    // Deterministic worklist ref (no Date/random in core).
    const ref = `wl_${eligible.length}_${eligible[0]?.account_id ?? 0}`;
    void action;
    return {
      ok: true,
      ref,
      added: eligible.length,
      failed: 0,
      deepLink: `https://demo.lateral.example/b/worklists/${ref}`,
      failures: [],
    };
  }
}

/** Preview summary the UI shows before confirmation. */
export function summarizeEligibility(accounts: AccountRow[], results: EligibilityResult[]) {
  const byId = new Map(results.map((r) => [r.account_id, r]));
  const eligible = accounts.filter((a) => byId.get(a.account_id)?.eligible);
  const excluded = results.filter((r) => !r.eligible);
  const excludedReasons = excluded.reduce<Record<string, number>>((acc, r) => {
    const k = r.reason ?? 'ineligible';
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const eligibleBalance = eligible.reduce((s, a) => s + Number(a.current_balance || 0), 0);
  return { selected: accounts.length, eligible: eligible.length, excluded: excluded.length, excludedReasons, eligibleBalance, eligibleAccounts: eligible };
}
