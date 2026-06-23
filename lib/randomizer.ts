export type SpinResult = {
  winners: string[];
  remaining: string[];
};

export function normalizeNames(input: string[]): string[] {
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const raw of input) {
    const name = String(raw ?? "").trim().replace(/\s+/g, " ");
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(name);
  }

  return cleaned.slice(0, 1000);
}

export function pickWinners(names: string[], count: number): SpinResult {
  const safeCount = Math.max(1, Math.min(10, count, names.length));
  const pool = [...names];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const winners = pool.slice(0, safeCount);
  const winnerSet = new Set(winners.map((name) => name.toLowerCase()));
  const remaining = names.filter((name) => !winnerSet.has(name.toLowerCase()));

  return { winners, remaining };
}
