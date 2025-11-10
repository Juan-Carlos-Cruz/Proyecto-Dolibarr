export type Factors = Record<string, string[]>;
export type Row = Record<string, string>;
export type Constraint = (row: Row) => boolean;

/** Genera casos pairwise (t=2) con un greedy simple (suficiente para UI). */
export function pairwise(factors: Factors, isValid?: Constraint): Row[] {
  const keys = Object.keys(factors);
  const domains = keys.map(k => factors[k]);

  const all: Row[] = [];
  (function rec(i: number, acc: Row) {
    if (i === keys.length) { if (!isValid || isValid(acc)) all.push({ ...acc }); return; }
    const k = keys[i];
    for (const v of domains[i]) { acc[k] = v; rec(i + 1, acc); }
  })(0, {});

  type PairKey = string;
  const pairs = new Set<PairKey>();
  for (let a = 0; a < keys.length; a++) for (let b = a + 1; b < keys.length; b++) {
    for (const va of domains[a]) for (const vb of domains[b]) {
      const proto: Row = { [keys[a]]: va, [keys[b]]: vb };
      if (!isValid || existsCompletion(proto)) pairs.add(pk(keys[a], va, keys[b], vb));
    }
  }

  const out: Row[] = [];
  while (pairs.size) {
    let best: Row | null = null, gainBest = -1;
    for (const r of all) {
      const g = gain(r);
      if (g > gainBest) { best = r; gainBest = g; if (g === pairs.size) break; }
    }
    if (!best) break;
    out.push(best);
    cover(best);
  }
  if (pairs.size) for (const r of all) { const g = gain(r); if (g) { out.push(r); cover(r); if (!pairs.size) break; } }
  return dedupe(out);

  function pk(ak: string, av: string, bk: string, bv: string) { return `${ak}=${av}||${bk}=${bv}`; }
  function gain(r: Row) {
    let g = 0;
    for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
      if (pairs.has(pk(keys[i], r[keys[i]], keys[j], r[keys[j]]))) g++;
    }
    return g;
  }
  function cover(r: Row) {
    for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
      pairs.delete(pk(keys[i], r[keys[i]], keys[j], r[keys[j]]));
    }
  }
  function existsCompletion(seed: Row) {
    const row = { ...seed };
    function bt(idx: number): boolean {
      if (idx === keys.length) return !isValid || isValid(row);
      const k = keys[idx];
      if (k in row) return bt(idx + 1);
      for (const v of factors[k]) { row[k] = v; if (bt(idx + 1)) return true; }
      delete row[k]; return false;
    }
    return bt(0);
  }
  function dedupe(rows: Row[]) {
    const s = new Set<string>(), res: Row[] = [];
    for (const r of rows) { const k = JSON.stringify(r); if (!s.has(k)) { s.add(k); res.push(r); } }
    return res;
  }
}
