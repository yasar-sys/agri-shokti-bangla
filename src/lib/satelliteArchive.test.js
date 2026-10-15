import { expect, test } from 'bun:test';
import { archiveDateAllowed, archiveTileUrl } from './satelliteArchive';
test('archive accepts 2000 through 2026 inclusive', () => {
  expect(archiveDateAllowed('2000-01-01')).toBe(true);
  expect(archiveDateAllowed('2026-12-31')).toBe(true);
  expect(archiveDateAllowed('1999-12-31')).toBe(false);
  expect(archiveDateAllowed('2027-01-01')).toBe(false);
});
test('MODIS tile carries selected historical date', () => {
  expect(archiveTileUrl('modis', '2000-03-01', 3, 4, 5)).toContain('/2000-03-01/GoogleMapsCompatible_Level9/5/4/3.jpg');
});
test('Landsat is a time-filtered archive rather than current world imagery', () => {
  const url = new URL(archiveTileUrl('landsat', '2000-03-01', 3, 4, 5));
  expect(url.pathname).toContain('/Landsat/MS/ImageServer/exportImage');
  expect(url.searchParams.get('time')).toBe(`${Date.parse('2000-03-01T00:00:00Z') - 16 * 86400000},${Date.parse('2000-03-01T00:00:00Z') + 16 * 86400000}`);
});