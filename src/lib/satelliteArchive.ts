
export const ARCHIVE_START = '2000-01-01';
export const ARCHIVE_END = '2026-12-31';
export type ArchiveSource = 'modis' | 'landsat';

/** Latest selectable date: never in the future, never past the archive window. */
export function archiveMaxDate(today: string = new Date().toISOString().slice(0, 10)): string {
  return today < ARCHIVE_END ? today : ARCHIVE_END;
}

export function archiveDateAllowed(date: string, today?: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= ARCHIVE_START && date <= archiveMaxDate(today) && Number.isFinite(Date.parse(date));
}

export function clampArchiveDate(date: string, today?: string): string {
  if (date < ARCHIVE_START) return ARCHIVE_START;
  const max = archiveMaxDate(today);
  return date > max ? max : date;
}

export function archiveTileUrl(source: ArchiveSource, date: string, x: number, y: number, z: number, today?: string): string {
  if (!archiveDateAllowed(date, today)) throw new Error('Archive date outside 2000–today');
  if (source === 'modis') return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/${z}/${y}/${x}.jpg`;
  const halfWorld = 20037508.342789244;
  const span = halfWorld * 2 / 2 ** z;
  const bbox = [-halfWorld + x * span, halfWorld - (y + 1) * span, -halfWorld + (x + 1) * span, halfWorld - y * span];
  // Nearest low-cloud acquisition to the selected date (Landsat 8 scenes + GLS 2000/2005/2010 epochs),
  // so older years still show real Landsat imagery instead of empty tiles.
  const params = new URLSearchParams({ bbox: bbox.join(','), bboxSR: '3857', imageSR: '3857', size: '256,256', format: 'png32', f: 'image', renderingRule: JSON.stringify({ rasterFunction: 'Natural Color with DRA' }), mosaicRule: JSON.stringify({ mosaicMethod: 'esriMosaicAttribute', sortField: 'AcquisitionDate', sortValue: date, ascending: true, where: 'CloudCover < 0.3' }) });
  return `https://landsat2.arcgis.com/arcgis/rest/services/Landsat/MS/ImageServer/exportImage?${params}`;
}
