import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * NASA POWER API Integration Hook
 * Real climate data from NASA (RootSource-inspired)
 */

interface ClimateData {
  temperature: {
    current: number | null;
    max: number | null;
    min: number | null;
    average: number;
    trend: string;
    trend_bn: string;
  };
  precipitation: {
    total: number;
    average: number;
    last_rain_date: string | null;
    trend: string;
  };
  humidity: {
    current: number | null;
    average: number;
  };
  wind: {
    current: number | null;
    average: number;
  };
  solar: {
    current: number | null;
    average: number;
  };
  dewpoint: {
    current: number | null;
    average: number;
  };
  pressure: {
    current: number | null;
    average: number;
  };
  recommendations: string[];
  raw_data: any;
  metadata: {
    latitude: number;
    longitude: number;
    elevation: number;
    timezone: number;
    source: string;
    date_range: { start: string; end: string };
    timestamp: string;
  };
}

interface UseNASAPowerOptions {
  latitude?: number;
  longitude?: number;
  days?: number;
  autoFetch?: boolean;
}

export function useNASAPowerClimate(options: UseNASAPowerOptions = {}) {
  const {
    latitude = 23.8103, // Default: Dhaka
    longitude = 90.4125,
    days = 30,
    autoFetch = false
  } = options;

  const [data, setData] = useState<ClimateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClimateData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching NASA POWER data for lat=${latitude}, lng=${longitude}`);

      const { data: result, error: functionError } = await supabase.functions.invoke(
        'nasa-power-climate',
        {
          body: {
            latitude,
            longitude,
            days
          }
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Failed to fetch NASA POWER data');
      }

      if (!result.success) {
        throw new Error(result.error || 'NASA POWER API returned an error');
      }

      setData(result.data);
      console.log('NASA POWER data fetched successfully');

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('NASA POWER fetch error:', err);
      setError(errorMessage);
      
      toast({
        title: 'NASA ডেটা লোড ব্যর্থ',
        description: 'NASA POWER API থেকে তথ্য পাওয়া যায়নি',
        variant: 'destructive'
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, days, toast]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchClimateData();
    }
  }, [autoFetch, fetchClimateData]);

  // Refresh data
  const refresh = useCallback(() => {
    return fetchClimateData();
  }, [fetchClimateData]);

  // Get specific metric
  const getTemperature = useCallback(() => {
    return data?.temperature || null;
  }, [data]);

  const getRainfall = useCallback(() => {
    return data?.precipitation || null;
  }, [data]);

  const getHumidity = useCallback(() => {
    return data?.humidity || null;
  }, [data]);

  const getSolarRadiation = useCallback(() => {
    return data?.solar || null;
  }, [data]);

  // Get recommendations
  const getRecommendations = useCallback(() => {
    return data?.recommendations || [];
  }, [data]);

  // Format data for charts
  const getChartData = useCallback(() => {
    if (!data?.raw_data) return null;

    const rawData = data.raw_data;
    
    // Convert NASA data to chart format
    const dates = Object.keys(rawData.T2M || {});
    
    return dates.map(date => ({
      date,
      temperature: rawData.T2M?.[date] || null,
      temp_max: rawData.T2M_MAX?.[date] || null,
      temp_min: rawData.T2M_MIN?.[date] || null,
      precipitation: rawData.PRECTOTCORR?.[date] || null,
      humidity: rawData.RH2M?.[date] || null,
      wind: rawData.WS2M?.[date] || null,
      solar: rawData.ALLSKY_SFC_SW_DWN?.[date] || null
    }));
  }, [data]);

  // Check if data is stale (older than 6 hours)
  const isStale = useCallback(() => {
    if (!data?.metadata?.timestamp) return true;
    const timestamp = new Date(data.metadata.timestamp).getTime();
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;
    return (now - timestamp) > sixHours;
  }, [data]);

  return {
    data,
    loading,
    error,
    fetch: fetchClimateData,
    refresh,
    getTemperature,
    getRainfall,
    getHumidity,
    getSolarRadiation,
    getRecommendations,
    getChartData,
    isStale,
    metadata: data?.metadata || null
  };
}

// Helper function to format NASA date (YYYYMMDD)
export function formatNASADate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// Get date range for NASA POWER
export function getNASADateRange(daysBack: number = 30): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysBack);
  
  return {
    start: formatNASADate(start),
    end: formatNASADate(end)
  };
}

// Convert temperature C to F
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

// Convert wind speed m/s to km/h
export function msToKmh(ms: number): number {
  return ms * 3.6;
}

// Classify temperature for Bangladesh
export function classifyTemperature(temp: number): {
  category: string;
  category_bn: string;
  color: string;
} {
  if (temp >= 35) {
    return { category: 'Very Hot', category_bn: 'অত্যধিক গরম', color: 'red' };
  } else if (temp >= 30) {
    return { category: 'Hot', category_bn: 'গরম', color: 'orange' };
  } else if (temp >= 25) {
    return { category: 'Warm', category_bn: 'উষ্ণ', color: 'yellow' };
  } else if (temp >= 20) {
    return { category: 'Mild', category_bn: 'মৃদু', color: 'green' };
  } else if (temp >= 15) {
    return { category: 'Cool', category_bn: 'শীতল', color: 'blue' };
  } else {
    return { category: 'Cold', category_bn: 'ঠান্ডা', color: 'indigo' };
  }
}

// Classify humidity
export function classifyHumidity(humidity: number): {
  category: string;
  category_bn: string;
  advice: string;
  advice_bn: string;
} {
  if (humidity >= 85) {
    return {
      category: 'Very Humid',
      category_bn: 'অত্যধিক আর্দ্র',
      advice: 'High disease risk - monitor crops closely',
      advice_bn: 'রোগের ঝুঁকি বেশি - ফসল ঘনিষ্ঠভাবে পর্যবেক্ষণ করুন'
    };
  } else if (humidity >= 70) {
    return {
      category: 'Humid',
      category_bn: 'আর্দ্র',
      advice: 'Good for most crops',
      advice_bn: 'বেশিরভাগ ফসলের জন্য ভালো'
    };
  } else if (humidity >= 50) {
    return {
      category: 'Moderate',
      category_bn: 'মাঝারি',
      advice: 'Ideal conditions',
      advice_bn: 'আদর্শ অবস্থা'
    };
  } else if (humidity >= 30) {
    return {
      category: 'Dry',
      category_bn: 'শুষ্ক',
      advice: 'Increase irrigation',
      advice_bn: 'সেচ বৃদ্ধি করুন'
    };
  } else {
    return {
      category: 'Very Dry',
      category_bn: 'অত্যন্ত শুষ্ক',
      advice: 'Emergency irrigation needed',
      advice_bn: 'জরুরি সেচ প্রয়োজন'
    };
  }
}
