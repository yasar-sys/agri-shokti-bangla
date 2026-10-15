import { test, expect } from 'bun:test';
import { cropMonitoring } from './cropMonitoring.ts';
test('crop monitoring covers each selected crop duration', () => {
  expect(cropMonitoring(45).at(-1)?.day).toBe('৪৫');
  expect(cropMonitoring(365).at(-1)?.day).toBe('৩৬৫');
  expect(cropMonitoring(365).length).toBeGreaterThan(cropMonitoring(45).length);
});