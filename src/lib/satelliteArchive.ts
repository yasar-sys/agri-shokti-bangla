import L from 'leaflet';
import { satelliteTileCache } from './satelliteTileCache';

export const ARCHIVE_START = '2000-01-01';
export const ARCHIVE_END = '2026-12-31';
export type ArchiveSource = 'modis' | 'landsat';

export function archiveDateAllowed(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= ARCHIVE_START && date <= ARCHIVE_END && Number.isFinite(Date.parse(date));
}

export function archiveTileUrl(source: ArchiveSource, date: string, x: number, y: number, z: number): string {
  if (!archiveDateAllowed(date)) throw new Error('Archive date outside 2000–2026');
  if (source === 'modis') return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/${z}/${y}/${x}.jpg`;
  const halfWorld = 20037508.342789244;
  const span = halfWorld * 2 / 2 ** z;
  const bbox = [-halfWorld + x * span, halfWorld - (y + 1) * span, -halfWorld + (x + 1) * span, halfWorld - y * span];
  const day = Date.parse(`${date}T00:00:00Z`);
  const params = new URLSearchParams({ bbox: bbox.join(','), bboxSR: '3857', imageSR: '3857', size: '256,256', format: 'png32', f: 'image', time: `${day - 16 * 86400000},${day + 16 * 86400000}`, renderingRule: JSON.stringify({ rasterFunction: 'Natural Color with DRA' }), mosaicRule: JSON.stringify({ mosaicMethod: 'esriMosaicAttribute', sortField: 'CloudCover', ascending: true }) });
  return `https://landsat2.arcgis.com/arcgis/rest/services/Landsat/MS/ImageServer/exportImage?${params}`;
}

export function createArchiveLayer(source: ArchiveSource, date: string, onUnavailable: () => void): L.GridLayer {
  const layer = L.gridLayer({ maxZoom: 19, maxNativeZoom: source === 'modis' ? 9 : 12, attribution: source === 'modis' ? 'NASA GIBS / MODIS' : 'USGS Landsat / Esri' });
  layer.createTile = (coords, done) => {
    const image = document.createElement('img');
    image.width = 256; image.height = 256; image.alt = '';
    const url = archiveTileUrl(source, date, coords.x, coords.y, coords.z);
    let objectUrl: string | undefined;
    image.onload = () => { if (objectUrl) URL.revokeObjectURL(objectUrl); done(undefined, image); };
    image.onerror = () => { if (objectUrl) URL.revokeObjectURL(objectUrl); onUnavailable(); done(new Error('Archive imagery unavailable'), image); };
    (async () => {
      let blob = await satelliteTileCache.getTile(url);
      if (!blob) {
        const response = await fetch(url);
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error('No archive image');
        blob = await response.blob();
        await satelliteTileCache.cacheTile(url, blob, source, date);
      }
      objectUrl = URL.createObjectURL(blob); image.src = objectUrl;
    })().catch(() => { onUnavailable(); done(new Error('Archive imagery unavailable'), image); });
    return image;
  };
  return layer;
}