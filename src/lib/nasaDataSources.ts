/**
 * NASA Space Apps Challenge 2025 - Farm Navigators Data Sources
 * 
 * This configuration file contains all NASA and partner API endpoints
 * for agricultural monitoring in Bangladesh.
 * 
 * Resources: https://www.spaceappschallenge.org/2025/challenges/nasa-farm-navigators-using-nasa-data-exploration-in-agriculture/
 */

// ============= NASA GIBS (Global Imagery Browse Services) =============
// Real-time satellite imagery tiles
export const NASA_GIBS = {
  BASE_URL: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best',

  // NDVI Vegetation Indices
  LAYERS: {
    // MODIS Terra NDVI - 8-day composite (250m resolution)
    MODIS_TERRA_NDVI_8DAY: 'MODIS_Terra_NDVI_8Day',
    // MODIS Terra NDVI - 16-day composite (250m resolution)
    MODIS_TERRA_NDVI_16DAY: 'MODIS_Terra_NDVI_16Day',
    // MODIS Aqua NDVI - 16-day composite
    MODIS_AQUA_NDVI_16DAY: 'MODIS_Aqua_NDVI_16Day',
    // VIIRS NDVI - 8-day composite (375m resolution)
    VIIRS_NDVI_8DAY: 'VIIRS_SNPP_NDVI_8Day',

    // Soil Moisture
    SMAP_SOIL_MOISTURE_L4: 'SMAP_L4_Analyzed_Surface_Soil_Moisture',
    SMAP_SOIL_MOISTURE_L3: 'SMAP_L3_SM_P_E_Surface_Soil_Moisture_9km',

    // Evapotranspiration (ET)
    MODIS_TERRA_ET_8DAY: 'MODIS_Terra_Evapotranspiration_8Day',

    // Land Surface Temperature
    MODIS_TERRA_LST_DAY: 'MODIS_Terra_Land_Surface_Temp_Day',
    MODIS_TERRA_LST_NIGHT: 'MODIS_Terra_Land_Surface_Temp_Night',

    // True Color Imagery
    VIIRS_NOAA20_TRUE_COLOR: 'VIIRS_NOAA20_CorrectedReflectance_TrueColor',
    MODIS_TERRA_TRUE_COLOR: 'MODIS_Terra_CorrectedReflectance_TrueColor',

    // Precipitation
    IMERG_PRECIPITATION: 'GPM_IMERG_Precipitation_Rate',

    // Floods & Disasters
    MODIS_FLOOD_DETECTION: 'MODIS_Combined_Flood_14Day_3Day',
    VIIRS_FIRE_DETECTION: 'VIIRS_NOAA20_Thermal_Anomalies_375m_Day'
  },

  // Get tile URL for a specific layer and date
  getTileUrl: (layer: string, date: string, z: number, y: number, x: number) => {
    return `${NASA_GIBS.BASE_URL}/${layer}/default/${date}/GoogleMapsCompatible_Level9/${z}/${y}/${x}.png`;
  },

  // Get WMTS URL for Leaflet integration
  getWMTSUrl: (layer: string, date: string) => {
    return `${NASA_GIBS.BASE_URL}/${layer}/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`;
  },

  // Max zoom levels for different layers
  MAX_ZOOM: {
    NDVI: 9,
    TRUE_COLOR: 9,
    SOIL_MOISTURE: 7,
    LST: 7,
    PRECIPITATION: 6
  }
};

// ============= NASA GLAM (Global Agriculture Monitoring) =============
// Real-time cropland monitoring
export const NASA_GLAM = {
  BASE_URL: 'https://glam1.gsfc.nasa.gov',
  WMS_URL: 'https://glam1.gsfc.nasa.gov/cgi-bin/mapserv',

  // Available products
  PRODUCTS: {
    CROP_CONDITION: 'crop_condition',
    NDVI_ANOMALY: 'ndvi_anomaly',
    RAINFALL_ANOMALY: 'rainfall_anomaly',
    VCI: 'vegetation_condition_index'
  }
};

// ============= Crop-CASMA (NASA SMAP + MODIS Soil Moisture) =============
// High-resolution soil moisture data
export const CROP_CASMA = {
  WMS_URL: 'https://nassgeo.csiss.gmu.edu/CropCASMA/wms',
  WCS_URL: 'https://nassgeo.csiss.gmu.edu/CropCASMA/wcs',

  LAYERS: {
    // SMAP Soil Moisture (9km resolution)
    SMAP_SM: 'smap_sm',
    // MODIS NDVI
    MODIS_NDVI: 'modis_ndvi',
    // Crop Growth Stage
    CROP_STAGE: 'crop_stage',
    // Evapotranspiration
    ET: 'evapotranspiration'
  },

  getWMSUrl: (layer: string, bbox: string) => {
    return `${CROP_CASMA.WMS_URL}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${layer}&CRS=EPSG:4326&BBOX=${bbox}&WIDTH=256&HEIGHT=256&FORMAT=image/png`;
  }
};

// ============= AppEEARS (Application for Extracting and Exploring Analysis Ready Samples) =============
// API for subsetting NASA Earth Science data
export const APPEEARS = {
  BASE_URL: 'https://appeears.earthdatacloud.nasa.gov/api',

  ENDPOINTS: {
    PRODUCTS: '/product',
    TASK: '/task',
    BUNDLE: '/bundle',
    QUALITY: '/quality'
  },

  // Common products for agriculture
  PRODUCTS: {
    // MODIS NDVI
    MOD13Q1: 'MOD13Q1.061', // Terra 250m NDVI
    MYD13Q1: 'MYD13Q1.061', // Aqua 250m NDVI
    // MODIS LST
    MOD11A2: 'MOD11A2.061', // Land Surface Temperature
    // SMAP Soil Moisture
    SPL3SMP: 'SPL3SMP.008', // SMAP Enhanced L3
    // GPM Precipitation
    GPM_3IMERGDF: 'GPM_3IMERGDF.07'
  }
};

// ============= NASA Harvest Portal =============
// Agricultural geospatial data repository
export const NASA_HARVEST = {
  PORTAL_URL: 'https://www.harvestportal.org',
  API_URL: 'https://api.harvestportal.org/v1',

  DATASETS: {
    CROP_YIELD: 'crop_yield_estimates',
    FOOD_SECURITY: 'food_security_indicators',
    CROP_AREA: 'crop_area_mapping'
  }
};

// ============= Open-Meteo Weather API =============
// Free weather API (already integrated)
export const OPEN_METEO = {
  BASE_URL: 'https://api.open-meteo.com/v1',

  ENDPOINTS: {
    FORECAST: '/forecast',
    HISTORICAL: '/archive',
    FLOOD: '/flood'
  },

  // Weather parameters for agriculture
  PARAMS: {
    CURRENT: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,soil_temperature_0cm,soil_moisture_0_1cm',
    DAILY: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,et0_fao_evapotranspiration',
    HOURLY: 'temperature_2m,relative_humidity_2m,precipitation,soil_temperature_0cm,soil_moisture_0_1cm'
  },

  getForecastUrl: (lat: number, lng: number, params: string) => {
    return `${OPEN_METEO.BASE_URL}/forecast?latitude=${lat}&longitude=${lng}&${params}&timezone=auto`;
  }
};

// ============= NASA POWER (Prediction Of Worldwide Energy Resources) =============
// Agroclimatology data
export const NASA_POWER = {
  BASE_URL: 'https://power.larc.nasa.gov/api/temporal',

  PARAMETERS: {
    // Solar
    ALLSKY_SFC_SW_DWN: 'All Sky Surface Shortwave Downward Irradiance',
    CLRSKY_SFC_SW_DWN: 'Clear Sky Surface Shortwave Downward Irradiance',
    // Temperature
    T2M: 'Temperature at 2 Meters',
    T2M_MAX: 'Maximum Temperature at 2 Meters',
    T2M_MIN: 'Minimum Temperature at 2 Meters',
    // Precipitation
    PRECTOTCORR: 'Precipitation Corrected',
    // Humidity
    RH2M: 'Relative Humidity at 2 Meters',
    // Wind
    WS2M: 'Wind Speed at 2 Meters',
    // Evapotranspiration
    EVPTRNS: 'Evapotranspiration'
  },

  getDataUrl: (lat: number, lng: number, start: string, end: string, params: string[]) => {
    return `${NASA_POWER.BASE_URL}/daily/point?parameters=${params.join(',')}&community=AG&longitude=${lng}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;
  }
};

// ============= Tile Layer Configurations for Leaflet =============

// Fallback providers when primary fails
export const FALLBACK_TILE_PROVIDERS = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    name: 'OpenStreetMap',
    nameBn: 'ওপেনস্ট্রিটম্যাপ'
  },
  esri: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18,
    name: 'Esri Satellite',
    nameBn: 'এসরি স্যাটেলাইট'
  },
  carto_light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OSM &copy; CARTO',
    maxZoom: 19,
    name: 'Carto Light',
    nameBn: 'কার্টো লাইট'
  },
  stadia: {
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    attribution: '&copy; Stadia Maps',
    maxZoom: 20,
    name: 'Stadia',
    nameBn: 'স্ট্যাডিয়া'
  }
};

export type TileErrorReason = 'rate_limit' | 'not_found' | 'timeout' | 'network' | 'cors' | 'unknown';

export interface TileLoadError {
  reason: TileErrorReason;
  message: string;
  messageBn: string;
  status?: number;
  provider: string;
}

export function getTileErrorReason(error: Error | Response | number): TileLoadError {
  if (typeof error === 'number') {
    if (error === 429) return { reason: 'rate_limit', message: 'Too many requests', messageBn: 'অনেক বেশি রিকোয়েস্ট', status: 429, provider: '' };
    if (error === 404) return { reason: 'not_found', message: 'Tile not found', messageBn: 'টাইল পাওয়া যায়নি', status: 404, provider: '' };
    if (error >= 500) return { reason: 'unknown', message: 'Server error', messageBn: 'সার্ভার ত্রুটি', status: error, provider: '' };
  }

  if (error instanceof Response) {
    return getTileErrorReason(error.status);
  }

  const errMsg = error instanceof Error ? error.message.toLowerCase() : '';
  if (errMsg.includes('timeout') || errMsg.includes('aborted')) {
    return { reason: 'timeout', message: 'Request timed out', messageBn: 'রিকোয়েস্ট সময়সীমা পার', provider: '' };
  }
  if (errMsg.includes('network') || errMsg.includes('fetch')) {
    return { reason: 'network', message: 'Network error', messageBn: 'নেটওয়ার্ক সমস্যা', provider: '' };
  }
  if (errMsg.includes('cors')) {
    return { reason: 'cors', message: 'CORS blocked', messageBn: 'CORS ব্লকড', provider: '' };
  }

  return { reason: 'unknown', message: 'Unknown error', messageBn: 'অজানা ত্রুটি', provider: '' };
}

export const TILE_LAYERS = {
  // Satellite imagery
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18
  },

  // Dark terrain
  terrain: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OSM &copy; CARTO',
    maxZoom: 18
  },

  // Light base map (for overlays)
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OSM &copy; CARTO',
    maxZoom: 18
  },

  // NASA GIBS NDVI (dynamic date)
  getNDVILayer: (date: string) => ({
    url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`,
    attribution: 'NDVI &copy; NASA GIBS MODIS',
    maxZoom: 9
  }),

  // NASA GIBS Soil Moisture
  getSoilMoistureLayer: (date: string) => ({
    url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/SMAP_L4_Analyzed_Surface_Soil_Moisture/default/${date}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png`,
    attribution: 'Soil Moisture &copy; NASA SMAP',
    maxZoom: 7
  }),

  // NASA GIBS Land Surface Temperature
  getLSTLayer: (date: string) => ({
    url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/${date}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png`,
    attribution: 'LST &copy; NASA MODIS',
    maxZoom: 7
  }),

  // NASA GIBS Precipitation
  getPrecipitationLayer: (date: string) => ({
    url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GPM_IMERG_Precipitation_Rate/default/${date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
    attribution: 'Precipitation &copy; NASA GPM',
    maxZoom: 6
  }),

  // NASA GIBS Flood Detection
  getFloodLayer: (date: string) => ({
    url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Combined_Flood_14Day_3Day/default/${date}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png`,
    attribution: 'Flood Detection &copy; NASA MODIS',
    maxZoom: 8
  }),

  // NASA GIBS True Color
  getTrueColorLayer: (date: string) => ({
    url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
    attribution: 'True Color &copy; NASA VIIRS',
    maxZoom: 9
  })
};

// ============= Helper Functions =============

// Get date string for NASA GIBS (most layers have ~10-14 day delay for "best" archival quality)
export function getGIBSDate(daysBack: number = 14): string {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date.toISOString().split('T')[0];
}

// Get recent date range for historical data
export function getDateRange(daysBack: number = 30): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysBack);
  return {
    start: start.toISOString().split('T')[0].replace(/-/g, ''),
    end: end.toISOString().split('T')[0].replace(/-/g, '')
  };
}

// Convert lat/lng to tile coordinates
export function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lng + 180) / 360 * n);
  const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
  return { x, y };
}

// NDVI Color scale (standard Earth Observation scale)
export function getNDVIColor(value: number, opacity: number = 0.8): string {
  if (value >= 0.8) return `hsla(120, 80%, 35%, ${opacity})`; // Dark green - Dense vegetation
  if (value >= 0.6) return `hsla(100, 70%, 40%, ${opacity})`; // Green - Healthy vegetation
  if (value >= 0.4) return `hsla(60, 80%, 45%, ${opacity})`;  // Yellow - Moderate vegetation
  if (value >= 0.2) return `hsla(30, 80%, 45%, ${opacity})`;  // Orange - Sparse vegetation
  return `hsla(0, 70%, 45%, ${opacity})`;                     // Red - Bare soil/water
}

// Soil moisture color scale
export function getSoilMoistureColor(value: number, opacity: number = 0.8): string {
  if (value >= 0.4) return `hsla(210, 80%, 35%, ${opacity})`; // Dark blue - Saturated
  if (value >= 0.3) return `hsla(200, 70%, 45%, ${opacity})`; // Blue - Wet
  if (value >= 0.2) return `hsla(180, 60%, 50%, ${opacity})`; // Cyan - Moist
  if (value >= 0.1) return `hsla(45, 70%, 55%, ${opacity})`;  // Yellow - Dry
  return `hsla(30, 80%, 45%, ${opacity})`;                    // Orange - Very dry
}

// Health status from NDVI
export function getHealthStatus(ndvi: number): { status: string; statusBn: string; severity: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical' } {
  if (ndvi >= 0.8) return { status: 'Excellent', statusBn: 'খুব ভালো', severity: 'excellent' };
  if (ndvi >= 0.6) return { status: 'Good', statusBn: 'সুস্থ', severity: 'good' };
  if (ndvi >= 0.4) return { status: 'Moderate', statusBn: 'মাঝারি', severity: 'moderate' };
  if (ndvi >= 0.2) return { status: 'Poor', statusBn: 'দুর্বল', severity: 'poor' };
  return { status: 'Critical', statusBn: 'সংকটজনক', severity: 'critical' };
}

// Bangladesh crop seasons
export const BANGLADESH_SEASONS = {
  BORO: { start: 11, end: 4, name: 'Boro', nameBn: 'বোরো', crops: ['rice', 'wheat', 'potato'] },
  AUS: { start: 4, end: 7, name: 'Aus', nameBn: 'আউশ', crops: ['rice', 'jute'] },
  AMAN: { start: 7, end: 11, name: 'Aman', nameBn: 'আমন', crops: ['rice'] }
};

export function getCurrentSeason(): typeof BANGLADESH_SEASONS.BORO {
  const month = new Date().getMonth();
  if (month >= 10 || month <= 3) return BANGLADESH_SEASONS.BORO;
  if (month >= 3 && month <= 6) return BANGLADESH_SEASONS.AUS;
  return BANGLADESH_SEASONS.AMAN;
}

export default {
  NASA_GIBS,
  NASA_GLAM,
  CROP_CASMA,
  APPEEARS,
  NASA_HARVEST,
  OPEN_METEO,
  NASA_POWER,
  TILE_LAYERS,
  getGIBSDate,
  getDateRange,
  latLngToTile,
  getNDVIColor,
  getSoilMoistureColor,
  getHealthStatus,
  getCurrentSeason,
  BANGLADESH_SEASONS
};
