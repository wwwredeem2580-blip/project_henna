// recency.model.ts
export function getRecencyBoost(lastViewedAt?: Date, now = new Date()): number {
  if (!lastViewedAt) return 0;

  const hours =
    (now.getTime() - lastViewedAt.getTime()) / (1000 * 60 * 60);

  if (hours < 6) return 1.0;
  if (hours < 24) return 0.7;
  if (hours < 72) return 0.4;
  return 0.2;
}
