import { expect, test } from 'bun:test';
import { archiveDateAllowed, archiveTileUrl, clampArchiveDate } from './satelliteArchive';
test('archive accepts 2000 through today, never future dates', () => {
  expect(archiveDateAllowed('2000-01-01', '2026-10-15')).toBe(true);
  expect(archiveDateAllowed('2026-10-15', '2026-10-15')).toBe(true);
  expect(archiveDateAllowed('2026-10-16', '2026-10-15')).toBe(false);
  expect(archiveDateAllowed('1999-12-31', '2026-10-15')).toBe(false);
  expect(archiveDateAllowed('2027-01-01', '2027-06-01')).toBe(false);
  expect(clampArchiveDate('2026-12-01', '2026-10-15')).toBe('2026-10-15');
});
test('MODIS tile carries selected historical date', () => {
  expect(archiveTileUrl('modis', '2000-03-01', 3, 4, 5)).toContain('/2000-03-01/GoogleMapsCompatible_Level9/5/4/3.jpg');
});
test('Landsat picks the acquisition nearest the selected date', () => {
  const url = new URL(archiveTileUrl('landsat', '2005-01-15', 3, 4, 5));
  expect(url.pathname).toContain('/Landsat/MS/ImageServer/exportImage');
  const rule = JSON.parse(url.searchParams.get('mosaicRule'));
  expect(rule.sortField).toBe('AcquisitionDate');
  expect(rule.sortValue).toBe('2005-01-15');
});
