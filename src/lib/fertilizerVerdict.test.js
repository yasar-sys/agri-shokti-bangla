import { test, expect } from 'bun:test';
import { fertilizerVerdict } from './fertilizerVerdict.ts';
test('zero-confidence scanner result never labels an unrecognized image counterfeit', () => {
  expect(fertilizerVerdict(false, 0)).toBeNull();
  expect(fertilizerVerdict(true, 0)).toBeNull();
  expect(fertilizerVerdict(false, 80)).toBe(false);
});