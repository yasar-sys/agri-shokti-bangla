export function fertilizerVerdict(isAuthentic: boolean | null, confidence: number): boolean | null {
  return Number.isFinite(confidence) && confidence > 0 ? isAuthentic : null;
}