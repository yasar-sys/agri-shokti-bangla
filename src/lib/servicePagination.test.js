import { describe, expect, test } from 'bun:test';
import { serviceSwipePage } from './servicePagination';

describe('all services remain reachable by swipe', () => {
  test('26 services in groups of six include the fifth page', () => {
    expect(serviceSwipePage(3, 250, 100, Math.ceil(26 / 6))).toBe(4);
  });
  test('a swipe starting at the left edge is not discarded', () => {
    expect(serviceSwipePage(0, 0, 100, 5)).toBe(4);
  });
  test('short and incomplete swipes leave the selected page unchanged', () => {
    expect(serviceSwipePage(2, 100, 80, 5)).toBe(2);
    expect(serviceSwipePage(2, 100, null, 5)).toBe(2);
  });
});