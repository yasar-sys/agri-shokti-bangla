import { test, expect } from 'bun:test';
import { parseFieldZones } from './fieldZones.ts';
test('VRF never synthesizes missing measured zone values', () => {
  expect(parseFieldZones('', 2, 1)).toBeNull();
  expect(parseFieldZones('0.4 0.5', 2, 1)).toBeNull();
});
test('VRF preserves measured NDVI and actual field area', () => {
  const zones = parseFieldZones('0.1, 0.2, 0.3, 0.4', 2, 2);
  expect(zones?.map(zone => zone.ndvi)).toEqual([0.1, 0.2, 0.3, 0.4]);
  expect(zones?.reduce((sum, zone) => sum + zone.areaHa, 0)).toBe(2);
  expect(parseFieldZones('0.1, 0.2, 0.3, 2', 2, 2)).toBeNull();
});