import { test, expect } from 'bun:test';
import { pestReportSummary } from './pestReportSummary.ts';

test('empty districts never fabricate farmer reports or pests', () => {
  expect(pestReportSummary([])).toEqual({ reports: 0, highRisk: 0, mainPest: 'রিপোর্ট নেই' });
});

test('district counts and main pest come from submitted reports only', () => {
  expect(pestReportSummary([
    { pest_name_bn: 'মাজরা পোকা', severity: 'high' },
    { pest_name_bn: 'মাজরা পোকা', severity: 'low' },
    { pest_name_bn: 'জাব পোকা', severity: 'low' },
  ])).toEqual({ reports: 3, highRisk: 1, mainPest: 'মাজরা পোকা' });
});