# Satellite Vision API Reference

## Core Libraries

### 1. satelliteTileCache

**Import:**
```typescript
import { satelliteTileCache, fetchTileWithCache, getAdjacentTileCoords } from '@/lib/satelliteTileCache';
```

**Methods:**

#### `satelliteTileCache.init()`
Initialize the IndexedDB cache.
```typescript
await satelliteTileCache.init();
```

#### `satelliteTileCache.getTile(url: string)`
Retrieve a tile from cache.
```typescript
const blob = await satelliteTileCache.getTile('https://example.com/tile.png');
if (blob) {
  const url = URL.createObjectURL(blob);
  // Use url for image src
}
```

#### `satelliteTileCache.cacheTile(url, blob, layer, date)`
Store a tile in cache.
```typescript
const response = await fetch(tileUrl);
const blob = await response.blob();
await satelliteTileCache.cacheTile(tileUrl, blob, 'ndvi', '2026-01-06');
```

#### `satelliteTileCache.prefetchTiles(urls, layer, date)`
Prefetch multiple tiles.
```typescript
const urls = [
  'https://example.com/tile1.png',
  'https://example.com/tile2.png',
];
await satelliteTileCache.prefetchTiles(urls, 'satellite', '2026-01-06');
```

#### `satelliteTileCache.getCacheStats()`
Get cache statistics.
```typescript
const stats = await satelliteTileCache.getCacheStats();
console.log(stats);
// { count: 245, size: 52428800, sizeMB: 50 }
```

#### `satelliteTileCache.clearCache()`
Clear all cached tiles.
```typescript
await satelliteTileCache.clearCache();
```

**Helper Functions:**

#### `fetchTileWithCache(url, layer, date, options?)`
Fetch a tile with automatic caching and retry logic.
```typescript
const blob = await fetchTileWithCache(
  'https://example.com/tile.png',
  'ndvi',
  '2026-01-06',
  { headers: { 'Accept': 'image/png' } }
);
```

#### `getAdjacentTileCoords(z, x, y, radius?)`
Get coordinates of adjacent tiles for prefetching.
```typescript
const coords = getAdjacentTileCoords(10, 512, 256, 1);
// Returns array of { z, x, y } for surrounding tiles
```

**Configuration:**
```typescript
const MAX_CACHE_SIZE_MB = 100;        // Maximum cache size
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000;  // 7 days
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;    // Daily cleanup
```

---

### 2. nasaApiClient

**Import:**
```typescript
import { nasaApiClient } from '@/lib/nasaApiClient';
```

**Methods:**

#### `nasaApiClient.getNDVIHistory(fieldZoneId?, days?)`
Get NDVI history for a field zone.
```typescript
const data = await nasaApiClient.getNDVIHistory('field-123', 90);
console.log(data.history);    // Array of NDVI data points
console.log(data.trend);      // 'improving' | 'stable' | 'declining'
console.log(data.summary);    // Statistics
```

#### `nasaApiClient.getAllZonesHistory(userId, days?)`
Get NDVI history for all user's zones.
```typescript
const data = await nasaApiClient.getAllZonesHistory('user-123', 60);
console.log(data.zones);      // Array of zones with history
```

#### `nasaApiClient.analyzeImagery(latitude, longitude)`
Analyze satellite imagery for a location.
```typescript
const data = await nasaApiClient.analyzeImagery(23.8103, 90.4125);
console.log(data.analysis);
// {
//   vegetation_coverage: 0.65,
//   water_bodies: 0.05,
//   detected_anomalies: [...],
//   crop_type_prediction: 'rice'
// }
```

#### `nasaApiClient.getSatelliteTiles(latitude, longitude)`
Get satellite tile URLs for a location.
```typescript
const data = await nasaApiClient.getSatelliteTiles(23.8103, 90.4125);
console.log(data.tiles);
// {
//   ndvi_terra: 'https://...',
//   ndvi_aqua: 'https://...',
//   soil_moisture: 'https://...'
// }
```

#### `nasaApiClient.getHealthStatus()`
Get health status of all API endpoints.
```typescript
const healthMap = nasaApiClient.getHealthStatus();
healthMap.forEach((status, endpoint) => {
  console.log(endpoint, status);
  // {
  //   status: 'healthy',
  //   latency: 450,
  //   errorRate: 0.05,
  //   consecutiveFailures: 0
  // }
});
```

#### `nasaApiClient.getOverallHealth()`
Get overall API health.
```typescript
const health = nasaApiClient.getOverallHealth();
// Returns: 'healthy' | 'degraded' | 'down'
```

#### `nasaApiClient.clearCache()`
Clear API response cache.
```typescript
nasaApiClient.clearCache();
```

**Configuration:**
```typescript
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,        // Maximum retry attempts
  baseDelay: 1000,      // Initial delay (ms)
  maxDelay: 10000,      // Maximum delay (ms)
  timeout: 15000,       // Request timeout (ms)
};

const CIRCUIT_BREAKER_THRESHOLD = 5;      // Failures before opening
const CIRCUIT_BREAKER_TIMEOUT = 60000;    // Reset timeout (ms)
```

---

### 3. useSatelliteServiceWorker Hook

**Import:**
```typescript
import { useSatelliteServiceWorker } from '@/hooks/useSatelliteServiceWorker';
```

**Usage:**
```typescript
function MyComponent() {
  const serviceWorker = useSatelliteServiceWorker();

  return (
    <div>
      {serviceWorker.isSupported && (
        <p>Service Worker: {serviceWorker.isRegistered ? 'Active' : 'Inactive'}</p>
      )}
      
      {serviceWorker.isUpdateAvailable && (
        <button onClick={serviceWorker.updateServiceWorker}>
          Update Available - Click to Install
        </button>
      )}
      
      <button onClick={serviceWorker.clearCache}>
        Clear Cache
      </button>
    </div>
  );
}
```

**Properties:**
```typescript
interface ServiceWorkerState {
  isSupported: boolean;         // Browser supports SW
  isRegistered: boolean;        // SW is registered
  isUpdateAvailable: boolean;   // New version available
  registration: ServiceWorkerRegistration | null;
}
```

**Methods:**

#### `updateServiceWorker()`
Install waiting service worker update.
```typescript
serviceWorker.updateServiceWorker();
// Page will reload automatically
```

#### `clearCache()`
Clear all service worker caches.
```typescript
await serviceWorker.clearCache();
```

#### `prefetchTiles(urls)`
Prefetch tiles via service worker.
```typescript
serviceWorker.prefetchTiles([
  'https://example.com/tile1.png',
  'https://example.com/tile2.png',
]);
```

#### `getCacheSize()`
Get total cache size.
```typescript
const bytes = await serviceWorker.getCacheSize();
const mb = (bytes / (1024 * 1024)).toFixed(2);
console.log(`Cache size: ${mb} MB`);
```

---

## UI Components

### 1. TimelapseControls

**Import:**
```typescript
import { TimelapseControls } from '@/components/satellite/TimelapseControls';
```

**Props:**
```typescript
interface TimelapseControlsProps {
  dates: Date[];              // Array of dates to cycle through
  currentIndex: number;       // Current date index
  onIndexChange: (index: number) => void;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  onExport?: () => void;      // Optional export handler
  className?: string;
}
```

**Usage:**
```typescript
const [dates, setDates] = useState([...]);
const [currentIndex, setCurrentIndex] = useState(0);
const [isPlaying, setIsPlaying] = useState(false);

<TimelapseControls
  dates={dates}
  currentIndex={currentIndex}
  onIndexChange={setCurrentIndex}
  onPlay={() => setIsPlaying(true)}
  onPause={() => setIsPlaying(false)}
  isPlaying={isPlaying}
  onExport={() => console.log('Export')}
/>
```

**Features:**
- Play/pause controls
- Speed adjustment (0.5x, 1x, 2x, 4x)
- Loop mode
- Frame navigation
- Progress slider
- Date display

---

### 2. SatelliteComparison

**Import:**
```typescript
import { SatelliteComparison } from '@/components/satellite/SatelliteComparison';
```

**Props:**
```typescript
interface SatelliteComparisonProps {
  dates: Date[];              // Available dates
  onCompare: (mode: ComparisonMode) => void;
  onClose: () => void;
  className?: string;
}

interface ComparisonMode {
  type: 'side-by-side' | 'slider' | 'overlay';
  leftDate: Date;
  rightDate: Date;
}
```

**Usage:**
```typescript
const [showComparison, setShowComparison] = useState(false);

const handleCompare = (mode: ComparisonMode) => {
  console.log('Compare:', mode.leftDate, 'vs', mode.rightDate);
  console.log('Type:', mode.type);
};

{showComparison && (
  <SatelliteComparison
    dates={dates}
    onCompare={handleCompare}
    onClose={() => setShowComparison(false)}
  />
)}
```

**Features:**
- Date range selection
- Comparison type selection
- Time difference calculation
- Apply/cancel actions

---

### 3. MobileSatelliteControls

**Import:**
```typescript
import { MobileSatelliteControls } from '@/components/satellite/MobileSatelliteControls';
```

**Props:**
```typescript
type TileLayer = 'satellite' | 'ndvi' | 'soil_moisture' | 'lst' | 'precipitation';

interface MobileSatelliteControlsProps {
  activeLayer: TileLayer;
  onLayerChange: (layer: TileLayer) => void;
  onComparisonToggle: () => void;
  onTimelapseToggle: () => void;
  className?: string;
}
```

**Usage:**
```typescript
const [activeLayer, setActiveLayer] = useState<TileLayer>('ndvi');

<MobileSatelliteControls
  activeLayer={activeLayer}
  onLayerChange={setActiveLayer}
  onComparisonToggle={() => setShowComparison(!showComparison)}
  onTimelapseToggle={() => setShowTimelapse(!showTimelapse)}
/>
```

**Features:**
- Floating action button
- Bottom sheet UI
- Layer selection grid
- Quick actions
- API health display
- Cache statistics
- Cache management

---

## Backend API

### Satellite Tiles Edge Function

**Endpoint:**
```
POST /functions/v1/satellite-tiles
```

**Query Parameters:**
```typescript
interface TileQuery {
  provider: 'satellite' | 'terrain' | 'osm' | 'ndvi';
  z: number;      // Zoom level (0-20)
  x: number;      // Tile X coordinate
  y: number;      // Tile Y coordinate
}
```

**Example:**
```typescript
// Using query params
fetch('/functions/v1/satellite-tiles?provider=satellite&z=10&x=512&y=256');

// Using path
fetch('/functions/v1/satellite-tiles/satellite/10/512/256');
```

**Response:**
```
Content-Type: image/png
Cache-Control: public, max-age=604800, stale-while-revalidate=3600
X-Cache: HIT | MISS
X-Tile-Source: satellite
ETag: "satellite-10-512-256"
```

**Cache Configuration:**
```typescript
const TILE_PROVIDERS = {
  satellite: { maxAge: 7 * 24 * 60 * 60 },  // 7 days
  terrain: { maxAge: 7 * 24 * 60 * 60 },
  osm: { maxAge: 7 * 24 * 60 * 60 },
  ndvi: { maxAge: 8 * 24 * 60 * 60 },       // 8 days
};
```

---

## Service Worker API

### Caches

**Names:**
```typescript
const CACHE_NAME = 'agri-shokti-satellite-v1';
const TILE_CACHE_NAME = 'satellite-tiles-v1';
const API_CACHE_NAME = 'nasa-api-v1';
```

**Cache TTL:**
```typescript
const TILE_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;   // 7 days
const API_CACHE_MAX_AGE = 5 * 60 * 1000;               // 5 minutes
```

### Messages

Send messages to Service Worker:

#### Skip Waiting
```typescript
navigator.serviceWorker.controller?.postMessage({
  type: 'SKIP_WAITING'
});
```

#### Clear Cache
```typescript
navigator.serviceWorker.controller?.postMessage({
  type: 'CLEAR_CACHE'
});
```

#### Prefetch Tiles
```typescript
navigator.serviceWorker.controller?.postMessage({
  type: 'PREFETCH_TILES',
  urls: ['https://example.com/tile1.png', 'https://example.com/tile2.png']
});
```

---

## Types Reference

### Core Types

```typescript
type TileLayer = 'satellite' | 'ndvi' | 'soil_moisture' | 'lst' | 'precipitation';

type APIHealth = 'healthy' | 'degraded' | 'down';

interface CacheStats {
  count: number;
  size: number;
  sizeMB: number;
}

interface APIHealthStatus {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  lastCheck: number;
  errorRate: number;
  consecutiveFailures: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  timeout: number;
}

interface ComparisonMode {
  type: 'side-by-side' | 'slider' | 'overlay';
  leftDate: Date;
  rightDate: Date;
}
```

---

## Events

### Online/Offline

```typescript
window.addEventListener('online', () => {
  console.log('Network restored');
});

window.addEventListener('offline', () => {
  console.log('Network lost');
});
```

### Service Worker Events

```typescript
navigator.serviceWorker.addEventListener('controllerchange', () => {
  console.log('New Service Worker activated');
  window.location.reload();
});

registration.addEventListener('updatefound', () => {
  console.log('New Service Worker version found');
});
```

---

## Performance Monitoring

### Measure Cache Performance

```typescript
async function measureCachePerformance() {
  const url = 'https://example.com/tile.png';
  
  // First load (cache miss)
  performance.mark('fetch-start');
  await fetchTileWithCache(url, 'satellite', '2026-01-06');
  performance.mark('fetch-end');
  performance.measure('first-load', 'fetch-start', 'fetch-end');
  
  // Second load (cache hit)
  performance.mark('cache-start');
  await fetchTileWithCache(url, 'satellite', '2026-01-06');
  performance.mark('cache-end');
  performance.measure('cached-load', 'cache-start', 'cache-end');
  
  const measures = performance.getEntriesByType('measure');
  console.log(measures);
}
```

### Monitor API Health

```typescript
setInterval(() => {
  const health = nasaApiClient.getOverallHealth();
  console.log('API Health:', health);
  
  if (health === 'down') {
    // Alert user or fallback to cached data
  }
}, 30000); // Check every 30 seconds
```

---

## Error Handling

### Tile Loading Errors

```typescript
try {
  const blob = await fetchTileWithCache(url, layer, date);
  if (!blob) {
    // Handle missing tile
    console.warn('Tile not available');
  }
} catch (error) {
  console.error('Tile fetch failed:', error);
  // Fallback to placeholder or cached data
}
```

### API Errors

```typescript
try {
  const data = await nasaApiClient.getNDVIHistory(fieldId, days);
} catch (error) {
  if (error.message.includes('Circuit breaker open')) {
    // API is temporarily unavailable
    console.log('Using cached data');
  } else {
    // Other error
    console.error('API error:', error);
  }
}
```

---

## Best Practices

1. **Always check cache before fetching**
   ```typescript
   const cached = await satelliteTileCache.getTile(url);
   if (cached) {
     return cached;
   }
   const fresh = await fetch(url);
   ```

2. **Prefetch adjacent tiles**
   ```typescript
   const coords = getAdjacentTileCoords(z, x, y);
   const urls = coords.map(c => getTileUrl(c.z, c.x, c.y));
   await satelliteTileCache.prefetchTiles(urls, layer, date);
   ```

3. **Monitor API health**
   ```typescript
   const health = nasaApiClient.getOverallHealth();
   if (health !== 'healthy') {
     // Use cached data or show warning
   }
   ```

4. **Clear cache periodically**
   ```typescript
   const stats = await satelliteTileCache.getCacheStats();
   if (stats.sizeMB > 90) {
     await satelliteTileCache.clearCache();
   }
   ```

5. **Handle offline gracefully**
   ```typescript
   if (!navigator.onLine) {
     // Show offline indicator
     // Use cached data only
   }
   ```

---

**Last Updated**: 2026-01-06  
**Version**: 2.0.0
