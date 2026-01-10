/**
 * AgroMonitoring API Type Definitions
 * API Documentation: https://agromonitoring.com/api
 */

export interface AgroPolygonGeometry {
  type: 'Feature';
  properties: Record<string, any>;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface AgroPolygon {
  id: string;
  name: string;
  center: number[]; // [lng, lat]
  area: number; // in hectares
  user_id: string;
  geo_json: AgroPolygonGeometry;
  created_at?: number;
}

export interface AgroWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface AgroWeather {
  dt: number; // timestamp
  main: {
    temp: number; // Kelvin
    feels_like: number;
    pressure: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  weather: AgroWeatherCondition[];
}

export interface AgroNDVIData {
  dt: number; // timestamp
  source: string;
  zoom: number;
  dc: number;
  cl: number;
  data: {
    mean: number;
    std: number;
    p25: number;
    num: number;
    p75: number;
    min: number;
    max: number;
    median: number;
  };
  image?: string; // URL to NDVI image
}

export interface AgroSoilData {
  dt: number; // timestamp
  t10: number; // soil temperature at 10cm depth (Kelvin)
  moisture: number; // soil moisture m³/m³
  t0: number; // surface temperature (Kelvin)
}

export interface AgroSatelliteImage {
  dt: number; // timestamp
  type: string;
  dc: number;
  cl: number;
  sun: {
    azimuth: number;
    elevation: number;
  };
  image: {
    truecolor?: string;
    falsecolor?: string;
    ndvi?: string;
    evi?: string;
  };
  tile: {
    truecolor?: string;
    falsecolor?: string;
    ndvi?: string;
    evi?: string;
  };
  stats: {
    ndvi?: number;
    evi?: number;
  };
}

export interface AgroMonitoringError {
  cod: string;
  message: string;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
}

// NDVI Time-Series Types
export type NDVITrend = 'improving' | 'stable' | 'declining';

export interface NDVIHistoryPoint {
  date: string;
  timestamp: number;
  ndvi: number;
  min?: number;
  max?: number;
  median?: number;
  cloudCoverage: number;
  type: string;
}

export interface NDVIWarning {
  date: string;
  previousNDVI: number;
  currentNDVI: number;
  dropPercent: number;
  severity: 'warning' | 'critical';
  message: string;
  messageBn: string;
}

export interface NDVIStatistics {
  current: number;
  average: number;
  min: number;
  max: number;
}

export interface AgroNDVIHistory {
  polygonId: string;
  days: number;
  history: NDVIHistoryPoint[];
  statistics: NDVIStatistics;
  trend: NDVITrend;
  trendBn: string;
  warnings: NDVIWarning[];
  dataPoints: number;
}

