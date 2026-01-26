// trending.utils.ts
export function logNormalize(value: number, cap = 3): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(Math.log10(value + 1), cap);
}

export function safeDivide(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max);
}

export function exponentialDecay(
  createdAt: Date,
  now: Date,
  halfLifeDays: number
): number {
  const ageDays =
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  return Math.exp(-ageDays / halfLifeDays);
}
