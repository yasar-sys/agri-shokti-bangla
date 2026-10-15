import L from 'leaflet';
import { satelliteTileCache } from './satelliteTileCache';
import { archiveTileUrl, type ArchiveSource } from './satelliteArchive';

export function createArchiveLayer(source: ArchiveSource, date: string, onUnavailable: () => void): L.GridLayer {
  class ArchiveLayer extends L.GridLayer {
  createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
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
  }
  }
  return new ArchiveLayer({ maxZoom: 19, maxNativeZoom: source === 'modis' ? 9 : 12, attribution: source === 'modis' ? 'NASA GIBS / MODIS' : 'USGS Landsat / Esri' });
}