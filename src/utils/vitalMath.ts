export function calculateMAP(sbp: number, dbp: number): number {
  return Math.round((dbp + (sbp - dbp) / 3) * 10) / 10;
}

export function isStale(timestamp: string, thresholdMs: number): boolean {
  return Date.now() - new Date(timestamp).getTime() > thresholdMs;
}
