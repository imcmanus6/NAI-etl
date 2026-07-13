/**
 * Documentation glossary extraction.
 *
 * Turns free-text reference documentation (field specs, data dictionaries,
 * business glossaries) into term → definition pairs so the mapping engine can
 * understand cryptic field names ("ACCT_NO" → "Account Number") and cite the
 * documentation as evidence.
 *
 * Handles the common shapes:
 *   ACCT_NO = Account Number
 *   ACCT_NO: Account Number
 *   ACCT_NO - Account number for the party
 *   | ACCT_NO | Account Number | ... |
 */
export interface GlossaryEntry {
  term: string; // normalised (lowercased)
  definition: string;
}

export function parseDocGlossary(text: string): GlossaryEntry[] {
  const out: GlossaryEntry[] = [];
  const seen = new Set<string>();
  const push = (term: string, definition: string) => {
    const t = term.trim().toLowerCase();
    const d = definition.trim();
    if (!t || !d || t.length > 60 || seen.has(t)) return;
    // term must look like a field identifier (letters/digits/underscores).
    if (!/^[a-z0-9_]+$/.test(t)) return;
    seen.add(t);
    out.push({ term: t, definition: d });
  };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    // Markdown / pipe table row: | ACCT_NO | Account Number | ...
    const pipe = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (line.includes('|') && pipe.length >= 2 && /^[A-Za-z0-9_]+$/.test(pipe[0]!)) {
      push(pipe[0]!, pipe[1]!);
      continue;
    }

    // key = value / key : value / key - value
    const kv = /^([A-Za-z0-9_]+)\s*[:=]\s*(.+)$/.exec(line) || /^([A-Za-z0-9_]+)\s+[-–]\s+(.+)$/.exec(line);
    if (kv) push(kv[1]!, kv[2]!);
  }

  return out;
}

/** Build a field-name → definition lookup from glossary entries. */
export function glossaryMap(entries: GlossaryEntry[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const e of entries) map[e.term] = e.definition;
  return map;
}
