export function parseFieldZones(input: string, gridSize: number, areaHa: number) {
  const values = input.trim().split(/[\s,;]+/).map(Number);
  if (!input.trim() || values.length !== gridSize * gridSize || !Number.isFinite(areaHa) || areaHa <= 0 || values.some(value => !Number.isFinite(value) || value < -1 || value > 1)) {
    return null;
  }
  return values.map((ndvi, index) => ({ id: `z${index + 1}`, ndvi, areaHa: areaHa / values.length }));
}