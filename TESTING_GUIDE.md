# Quick Start Guide - Satellite Vision Optimization

## 🚀 Testing the New Features

### Prerequisites
```bash
# All dependencies are already installed
# No additional setup required
```

### 1. Test Tile Caching (IndexedDB)

**Open Browser DevTools:**
1. Navigate to `/satellite`
2. Open DevTools (F12) → Application → IndexedDB
3. Look for `satellite-tile-cache` database
4. Navigate around the map to see tiles being cached

**Verify Caching:**
```javascript
// Run in browser console
import { satelliteTileCache } from './src/lib/satelliteTileCache';

// Get cache statistics
const stats = await satelliteTileCache.getCacheStats();
console.log('Cache Stats:', stats);
// Output: { count: 45, size: 15728640, sizeMB: 15 }

// Clear cache
await satelliteTileCache.clearCache();
```

---

### 2. Test Service Worker (PWA)

**Check Registration:**
1. Open DevTools → Application → Service Workers
2. Verify `satellite-sw.js` is registered and activated
3. Check "Update on reload" for development

**Test Offline Mode:**
1. Navigate to `/satellite` while online
2. Wait for tiles to load and cache
3. Open DevTools → Network → Enable "Offline"
4. Refresh page or navigate map
5. Verify tiles load from cache (check console for SW logs)

**Console Commands:**
```javascript
// Check if SW is registered
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW Status:', reg ? 'Active' : 'Not registered');
});

// Check cache storage
caches.keys().then(keys => {
  console.log('Cache Names:', keys);
});

// Get cache size
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  return (totalSize / (1024 * 1024)).toFixed(2) + ' MB';
}

getCacheSize().then(size => console.log('Total Cache Size:', size));
```

---

### 3. Test API Health Monitoring

**Monitor API Status:**
1. Open the Satellite page
2. Look for API health badge (top right if degraded/down)
3. Check browser console for health logs

**Simulate API Failure:**
```javascript
// Run in console to see circuit breaker in action
import { nasaApiClient } from './src/lib/nasaApiClient';

// Get current health status
const healthMap = nasaApiClient.getHealthStatus();
console.log('API Health:', Array.from(healthMap.entries()));

// Get overall health
const overall = nasaApiClient.getOverallHealth();
console.log('Overall Health:', overall); // 'healthy' | 'degraded' | 'down'
```

---

### 4. Test Time-lapse Mode

**Steps:**
1. Click "টাইমলাইন" (Timeline) button in header
2. Time-lapse controls appear at bottom
3. Click Play button (▶️)
4. Watch dates cycle through 30-day period
5. Adjust speed: 0.5x, 1x, 2x, 4x
6. Enable loop mode with loop button (🔄)
7. Test export button (downloads ready when implemented)

**Keyboard Shortcuts:**
- `Space` - Play/Pause
- `←` - Previous frame
- `→` - Next frame

---

### 5. Test Comparison Mode

**Steps:**
1. Click "তুলনা" (Compare) button (desktop only)
2. Select first date from dropdown
3. Select second date from dropdown
4. Choose comparison type:
   - পাশাপাশি (Side-by-side)
   - স্লাইডার (Slider)
   - ওভারলে (Overlay)
5. Click "প্রয়োগ করুন" (Apply)
6. See time difference calculation

---

### 6. Test Mobile Controls

**On Mobile/Responsive View:**
1. Resize browser to mobile width (<768px)
2. Look for floating button (bottom right)
3. Tap button to open layer selector
4. Try different layers:
   - স্যাটেলাইট (Satellite)
   - উদ্ভিদ সূচক (NDVI)
   - মাটির আর্দ্রতা (Soil Moisture)
   - তাপমাত্রা (Temperature)
   - বৃষ্টিপাত (Precipitation)
5. View cache stats in bottom sheet
6. Test "Clear Cache" button

---

### 7. Test Offline Detection

**Steps:**
1. Open Satellite page while online
2. See "NASA" badge (green)
3. Disable network: DevTools → Network → Offline
4. See "অফলাইন" (Offline) badge appear (orange)
5. Navigate map - tiles load from cache
6. Enable network again
7. See "অনলাইন" (Online) toast notification

---

## 📊 Performance Testing

### Measure Load Times

**Before Optimization:**
```javascript
// In console on a fresh load
performance.mark('start');
// Wait for tiles to load
performance.mark('end');
performance.measure('tile-load', 'start', 'end');
console.log(performance.getEntriesByName('tile-load'));
// Typical: 2000-5000ms
```

**After Optimization:**
```javascript
// Same test with caching enabled
// First load: 200-1000ms
// Second load: <100ms (from cache)
```

### Network Tab Analysis
1. Open DevTools → Network
2. Filter by "Img" or "XHR"
3. Look for:
   - `(from ServiceWorker)` - SW cache hit
   - `(disk cache)` - Browser cache hit
   - `200 OK` with fast timing - Server cache hit

---

## 🐛 Debugging Tips

### Common Issues

**1. Service Worker Not Registering**
```javascript
// Check if browser supports SW
if ('serviceWorker' in navigator) {
  console.log('✅ Service Worker supported');
} else {
  console.log('❌ Service Worker NOT supported');
}

// Force unregister and re-register
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  window.location.reload();
});
```

**2. Cache Not Working**
```javascript
// Check IndexedDB
indexedDB.databases().then(dbs => {
  console.log('Available DBs:', dbs);
});

// Verify cache operations
import { satelliteTileCache } from './src/lib/satelliteTileCache';
await satelliteTileCache.init();
console.log('Cache initialized');
```

**3. API Calls Failing**
```javascript
// Check circuit breaker status
import { nasaApiClient } from './src/lib/nasaApiClient';
const health = nasaApiClient.getHealthStatus();
health.forEach((status, endpoint) => {
  console.log(`${endpoint}:`, {
    status: status.status,
    failures: status.consecutiveFailures,
    errorRate: status.errorRate
  });
});

// Clear API cache
nasaApiClient.clearCache();
```

**4. Mobile Controls Not Showing**
```javascript
// Check screen width
console.log('Screen width:', window.innerWidth);
// Mobile controls show when width < 1024px

// Force mobile view in DevTools
// DevTools → Toggle device toolbar (Ctrl+Shift+M)
```

---

## 🔍 Console Logs to Watch

### Expected Logs

**Service Worker:**
```
[ServiceWorker] Install
[ServiceWorker] Activate
[ServiceWorker] Cache hit: satellite_10_512_256
[ServiceWorker] Fetching tile: https://...
[ServiceWorker] Success: 45678 bytes
```

**Tile Cache:**
```
Cache Stats: { count: 45, size: 15728640, sizeMB: 15 }
Cached tile: https://...
Cleanup: Removed 15 old tiles
```

**API Client:**
```
Retry attempt 1 for nasa-ndvi after 1234ms
Circuit breaker reset for nasa-ndvi
API cache hit: ndvi_history_field-1_90
```

---

## 🎯 Feature Checklist

Test each feature and check off:

- [ ] Tile caching (IndexedDB)
- [ ] Service Worker registration
- [ ] Offline mode
- [ ] API retry logic
- [ ] Circuit breaker
- [ ] Time-lapse controls
- [ ] Comparison mode
- [ ] Mobile layer selector
- [ ] Cache statistics
- [ ] API health indicator
- [ ] Online/offline detection
- [ ] PWA installability

---

## 📱 Mobile Testing

### Real Device Testing
1. Deploy to staging environment
2. Open on mobile browser
3. Test touch interactions
4. Check responsive layout
5. Test PWA installation:
   - Chrome: Menu → Add to Home Screen
   - Safari: Share → Add to Home Screen

### Performance Targets
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s
- Cumulative Layout Shift: <0.1

---

## 🚀 Production Checklist

Before deploying:

- [ ] All tests passing
- [ ] Service Worker tested offline
- [ ] Cache limits verified (100MB max)
- [ ] API retry logic tested
- [ ] Mobile UI tested on real devices
- [ ] Error boundaries in place
- [ ] Analytics events tracked
- [ ] Performance budget met
- [ ] Accessibility tested
- [ ] Bengali translations verified

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify DevTools → Application shows:
   - Service Worker active
   - IndexedDB database present
   - Cache Storage populated
3. Clear all caches and retry
4. Check network tab for failed requests
5. Review SATELLITE_OPTIMIZATION_REPORT.md

---

**Happy Testing!** 🎉
