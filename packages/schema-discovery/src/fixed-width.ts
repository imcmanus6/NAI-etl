/**
 * Fixed-width layout inference from documentation.
 *
 * This is the "no more plugins" piece: instead of hand-writing a parser for
 * every fixed-width feed, the user pastes the record-layout documentation and
 * we derive the field positions. Supports the shapes real specs come in:
 *   1. Tabular:      Name  Start  Length  Type
 *   2. Position:     Customer ID   1-10   N
 *   3. COBOL copybook: 05 CUSTOMER-ID PIC X(20).
 *   4. Width-only:   CUSTOMER_ID 10   (offsets computed cumulatively)
 *
 * Returns 1-based {name, start, width, type}. An LLM can refine when configured,
 * but this deterministic parser covers the common cases offline.
 */
import type { FixedWidthField } from '@etl/shared-types';

type FwType = FixedWidthField['type'];

function inferType(token: string | undefined): FwType {
  if (!token) return 'string';
  const t = token.toLowerCase();
  if (/date|dt|yyyy|mm|dd/.test(t)) return 'date';
  if (/^(n|num|number|numeric|9|decimal|int|integer|amount|amt)$/.test(t) || /9/.test(t)) return 'number';
  if (/^(b|bool|boolean|flag|y\/n)$/.test(t)) return 'boolean';
  return 'string';
}

function splitCols(line: string): string[] {
  return line
    .split(/\s{2,}|\t|\s*\|\s*/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

/** Parse the result of `parseFixedWidthLayout` for a specific line of data. */
export function readFixedWidthLine(line: string, fields: FixedWidthField[]): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const f of fields) {
    record[f.name] = line.slice(f.start - 1, f.start - 1 + f.width).trim();
  }
  return record;
}

export function parseFixedWidthLayout(doc: string): FixedWidthField[] {
  const lines = doc
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/, ''))
    .filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  if (lines.some((l) => /\bpic\b/i.test(l))) return parseCobol(lines);

  const headerIdx = lines.findIndex(
    (l) => /\b(start|pos(ition)?|from|offset|length|width|len|size)\b/i.test(l) && /\b(name|field|column|element)\b/i.test(l),
  );
  if (headerIdx >= 0) return parseTabular(lines, headerIdx);

  if (lines.some((l) => /\b\d+\s*[-–]\s*\d+\b/.test(l))) return parseRanges(lines);

  return parseWidthOnly(lines);
}

function parseCobol(lines: string[]): FixedWidthField[] {
  const fields: FixedWidthField[] = [];
  let start = 1;
  for (const line of lines) {
    const m = /^(?:\d+\s+)?([A-Za-z][\w-]*)\s+pic\s+(.+?)\.?$/i.exec(line.trim());
    if (!m) continue;
    const name = m[1]!.toLowerCase().replace(/-/g, '_');
    const pic = m[2]!.toUpperCase();
    // Expand X(n)/9(n)/A(n); drop V (implied decimal point, no byte).
    const expanded = pic
      .replace(/([X9A])\((\d+)\)/g, (_, c: string, n: string) => c.repeat(Number(n)))
      .replace(/V/g, '');
    const width = (expanded.match(/[X9A]/g) ?? []).length;
    if (width <= 0) continue;
    fields.push({ name, start, width, type: /9/.test(pic) ? 'number' : 'string' });
    start += width;
  }
  return fields;
}

function parseTabular(lines: string[], headerIdx: number): FixedWidthField[] {
  const header = splitCols(lines[headerIdx]!).map((h) => h.toLowerCase());
  const find = (...keys: string[]) => header.findIndex((h) => keys.some((k) => h.includes(k)));
  const iName = find('name', 'field', 'column', 'element');
  const iStart = find('start', 'pos', 'from', 'offset');
  const iLen = find('length', 'width', 'len', 'size');
  const iType = find('type', 'format', 'pic');

  const fields: FixedWidthField[] = [];
  let cursor = 1;
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = splitCols(lines[i]!);
    if (cols.length < 2) continue;
    const name = (cols[iName] ?? cols[0] ?? '').replace(/\s+/g, '_').toLowerCase();
    if (!name) continue;
    const width = iLen >= 0 ? parseInt(cols[iLen] ?? '', 10) : NaN;
    const start = iStart >= 0 ? parseInt(cols[iStart] ?? '', 10) : cursor;
    if (Number.isNaN(width)) continue;
    const s = Number.isNaN(start) ? cursor : start;
    fields.push({ name, start: s, width, type: inferType(iType >= 0 ? cols[iType] : undefined) });
    cursor = s + width;
  }
  return fields;
}

function parseRanges(lines: string[]): FixedWidthField[] {
  const fields: FixedWidthField[] = [];
  const rangeRe = /(\d+)\s*[-–]\s*(\d+)/;
  for (const line of lines) {
    const m = rangeRe.exec(line);
    if (!m) continue;
    const start = Number(m[1]);
    const end = Number(m[2]);
    if (end < start) continue;
    // Remaining text = the field name (+ maybe a type token at the end).
    const rest = line.replace(m[0], ' ').trim();
    const tokens = rest.split(/\s{2,}|\t|\s*\|\s*/).map((t) => t.trim()).filter(Boolean);
    const name = (tokens[0] ?? `field_${start}`).replace(/\s+/g, '_').toLowerCase();
    fields.push({ name, start, width: end - start + 1, type: inferType(tokens[tokens.length - 1]) });
  }
  return fields.sort((a, b) => a.start - b.start);
}

function parseWidthOnly(lines: string[]): FixedWidthField[] {
  const fields: FixedWidthField[] = [];
  let start = 1;
  for (const line of lines) {
    const m = /^(.+?)[\s|]+(\d+)\s*([A-Za-z/]+)?\s*$/.exec(line.trim());
    if (!m) continue;
    const name = m[1]!.replace(/\s+/g, '_').toLowerCase();
    const width = Number(m[2]);
    if (!width) continue;
    fields.push({ name, start, width, type: inferType(m[3]) });
    start += width;
  }
  return fields;
}
