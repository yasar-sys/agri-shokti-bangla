import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * RootSource-inspired NASA POWER API Integration
 * Production-ready climate data from NASA
 */

interface ClimateDataRequest {
  latitude: number;
  longitude: number;
  days?: number;
  parameters?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, days = 30, parameters }: ClimateDataRequest = await req.json();

    console.log(`NASA POWER request: lat=${latitude}, lng=${longitude}, days=${days}`);

    // Validate coordinates
    if (!latitude || !longitude || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error('Invalid coordinates');
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    };

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    // Default agricultural parameters
    const params = parameters || [
      'T2M',              // Temperature at 2 Meters (°C)
      'T2M_MAX',          // Max Temperature (°C)
      'T2M_MIN',          // Min Temperature (°C)
      'PRECTOTCORR',      // Precipitation (mm/day)
      'RH2M',             // Relative Humidity (%)
      'WS2M',             // Wind Speed (m/s)
      'ALLSKY_SFC_SW_DWN', // Solar Radiation (MJ/m²/day)
      'T2MDEW',           // Dew Point (°C)
      'PS',               // Surface Pressure (kPa)
    ];

    // Call NASA POWER API
    const nasaUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params.join(',')}&community=AG&longitude=${longitude}&latitude=${latitude}&start=${start}&end=${end}&format=JSON`;

    console.log('Calling NASA POWER API...');
    const response = await fetch(nasaUrl, {
      headers: {
        'User-Agent': 'AgriShokti-Bangla/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`NASA POWER API returned ${response.status}`);
    }

    const nasaData = await response.json();
    const paramData = nasaData.properties.parameter;

    // Process the data
    const getLatestValue = (dataObj: any): number | null => {
      if (!dataObj) return null;
      const values = Object.values(dataObj) as number[];
      return values[values.length - 1];
    };

    const calculateAverage = (dataObj: any): number => {
      if (!dataObj) return 0;
      const values = Object.values(dataObj) as number[];
      const validValues = values.filter(v => v !== -999 && v !== null && !isNaN(v));
      if (validValues.length === 0) return 0;
      return validValues.reduce((a, b) => a + b, 0) / validValues.length;
    };

    const calculateSum = (dataObj: any): number => {
      if (!dataObj) return 0;
      const values = Object.values(dataObj) as number[];
      const validValues = values.filter(v => v !== -999 && v !== null && !isNaN(v));
      return validValues.reduce((a, b) => a + b, 0);
    };

    const calculateTrend = (dataObj: any): string => {
      if (!dataObj) return 'stable';
      const values = Object.values(dataObj) as number[];
      const validValues = values.filter(v => v !== -999 && v !== null);
      if (validValues.length < 2) return 'stable';
      
      const firstHalf = validValues.slice(0, Math.floor(validValues.length / 2));
      const secondHalf = validValues.slice(Math.floor(validValues.length / 2));
      
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      const diff = secondAvg - firstAvg;
      if (diff > 1) return 'increasing';
      if (diff < -1) return 'decreasing';
      return 'stable';
    };

    const getLastRainDate = (dataObj: any): string | null => {
      if (!dataObj) return null;
      const entries = Object.entries(dataObj) as [string, number][];
      const reversed = entries.reverse();
      const lastRain = reversed.find(([_, value]) => value > 0.5); // At least 0.5mm
      return lastRain ? lastRain[0] : null;
    };

    // Generate Bengali recommendations based on data
    const generateRecommendations = (): string[] => {
      const recommendations: string[] = [];
      const temp = getLatestValue(paramData.T2M) || 0;
      const rain = calculateSum(paramData.PRECTOTCORR);
      const humidity = getLatestValue(paramData.RH2M) || 0;
      const lastRain = getLastRainDate(paramData.PRECTOTCORR);

      // Temperature-based
      if (temp > 35) {
        recommendations.push('🌡️ উচ্চ তাপমাত্রা - ঘন ঘন সেচ দিন এবং মালচিং করুন');
      } else if (temp < 15) {
        recommendations.push('❄️ নিম্ন তাপমাত্রা - শীতকালীন ফসল রোপণের উপযুক্ত');
      }

      // Rainfall-based
      if (rain < 10) {
        recommendations.push('☀️ কম বৃষ্টিপাত - সেচ ব্যবস্থা নিশ্চিত করুন');
      } else if (rain > 200) {
        recommendations.push('🌧️ অতিরিক্ত বৃষ্টি - নিষ্কাশন ব্যবস্থা পরীক্ষা করুন');
      }

      // Humidity-based
      if (humidity > 85) {
        recommendations.push('💧 উচ্চ আর্দ্রতা - ছত্রাকের জন্য সতর্ক থাকুন');
      } else if (humidity < 40) {
        recommendations.push('🏜️ কম আর্দ্রতা - পানি ধারণ ক্ষমতা বাড়ান');
      }

      if (!lastRain) {
        recommendations.push('⚠️ দীর্ঘদিন বৃষ্টি হয়নি - খরা প্রস্তুতি নিন');
      }

      return recommendations;
    };

    const processedData = {
      temperature: {
        current: getLatestValue(paramData.T2M),
        max: getLatestValue(paramData.T2M_MAX),
        min: getLatestValue(paramData.T2M_MIN),
        average: calculateAverage(paramData.T2M),
        trend: calculateTrend(paramData.T2M),
        trend_bn: calculateTrend(paramData.T2M) === 'increasing' ? 'বৃদ্ধি পাচ্ছে' : 
                  calculateTrend(paramData.T2M) === 'decreasing' ? 'হ্রাস পাচ্ছে' : 'স্থিতিশীল'
      },
      precipitation: {
        total: calculateSum(paramData.PRECTOTCORR),
        average: calculateAverage(paramData.PRECTOTCORR),
        last_rain_date: getLastRainDate(paramData.PRECTOTCORR),
        trend: calculateTrend(paramData.PRECTOTCORR)
      },
      humidity: {
        current: getLatestValue(paramData.RH2M),
        average: calculateAverage(paramData.RH2M)
      },
      wind: {
        current: getLatestValue(paramData.WS2M),
        average: calculateAverage(paramData.WS2M)
      },
      solar: {
        current: getLatestValue(paramData.ALLSKY_SFC_SW_DWN),
        average: calculateAverage(paramData.ALLSKY_SFC_SW_DWN)
      },
      dewpoint: {
        current: getLatestValue(paramData.T2MDEW),
        average: calculateAverage(paramData.T2MDEW)
      },
      pressure: {
        current: getLatestValue(paramData.PS),
        average: calculateAverage(paramData.PS)
      },
      recommendations: generateRecommendations(),
      raw_data: paramData, // Include full data for charting
      metadata: {
        latitude: nasaData.geometry.coordinates[1],
        longitude: nasaData.geometry.coordinates[0],
        elevation: nasaData.properties.parameter.ELEV,
        timezone: nasaData.properties.parameter.TZ || 6,
        source: 'NASA POWER API',
        date_range: { start, end },
        timestamp: new Date().toISOString()
      }
    };

    console.log('NASA POWER data processed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: processedData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('NASA POWER function error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        fallback_available: true
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
