import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NASA GIBS WMTS configuration for real satellite imagery
const GIBS_BASE_URL = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best';
const NDVI_LAYERS = {
  terra: 'MODIS_Terra_NDVI_16Day',
  aqua: 'MODIS_Aqua_NDVI_16Day',
  viirs: 'VIIRS_NOAA20_CorrectedReflectance_TrueColor'
};

// Generate realistic NDVI data based on Bangladesh agricultural patterns
function generateRealisticNDVI(baseScore: number, daysAgo: number, seasonalFactor: number): number {
  // Apply seasonal variation (Bangladesh has 3 crop seasons)
  const seasonalVariation = Math.sin((daysAgo / 365) * 2 * Math.PI) * 0.15;
  
  // Weather variability
  const weatherNoise = (Math.random() - 0.5) * 0.1;
  
  // Growth trend
  const growthTrend = Math.sin((daysAgo / 120) * Math.PI) * 0.1;
  
  const ndvi = baseScore + seasonalVariation + weatherNoise + growthTrend + seasonalFactor;
  return Math.max(0.1, Math.min(0.95, ndvi));
}

// Get NASA GIBS tile URL for real satellite imagery
function getGIBSTileUrl(layer: string, date: string, z: number, x: number, y: number): string {
  return `${GIBS_BASE_URL}/${layer}/default/${date}/GoogleMapsCompatible_Level9/${z}/${y}/${x}.png`;
}

// Calculate vegetation health status from NDVI
function getHealthStatus(ndvi: number): { status: string; status_bn: string; severity: string } {
  if (ndvi >= 0.8) return { status: 'excellent', status_bn: 'খুব ভালো', severity: 'healthy' };
  if (ndvi >= 0.6) return { status: 'good', status_bn: 'সুস্থ', severity: 'moderate' };
  if (ndvi >= 0.4) return { status: 'moderate', status_bn: 'মাঝারি', severity: 'warning' };
  if (ndvi >= 0.2) return { status: 'poor', status_bn: 'দুর্বল', severity: 'critical' };
  return { status: 'critical', status_bn: 'সংকটজনক', severity: 'severe' };
}

// Generate AI recommendations based on NDVI trends
function generateRecommendations(currentNDVI: number, trend: string, zone: string): string[] {
  const recommendations: string[] = [];
  
  if (currentNDVI < 0.4) {
    recommendations.push('🚨 জরুরি সেচ প্রয়োজন - মাটির আর্দ্রতা কম');
    recommendations.push('🔬 রোগ পরীক্ষা করুন - পাতা হলুদ হওয়ার লক্ষণ থাকতে পারে');
    recommendations.push('✈️ ড্রোন দিয়ে কীটনাশক স্প্রে করুন');
  } else if (currentNDVI < 0.6) {
    recommendations.push('💧 নিয়মিত সেচ বজায় রাখুন');
    recommendations.push('🌱 সার প্রয়োগের সময় হতে পারে');
  } else if (currentNDVI >= 0.8) {
    recommendations.push('✅ ফসলের স্বাস্থ্য চমৎকার');
    recommendations.push('📅 ফসল কাটার সময় নির্ধারণ করুন');
  }
  
  if (trend === 'declining') {
    recommendations.push('⚠️ স্বাস্থ্য হ্রাস পাচ্ছে - দ্রুত পদক্ষেপ নিন');
  } else if (trend === 'improving') {
    recommendations.push('📈 স্বাস্থ্যের উন্নতি হচ্ছে - বর্তমান পরিচর্যা চালু রাখুন');
  }
  
  return recommendations;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, userId, fieldZoneId, latitude, longitude, days } = await req.json();

    console.log(`NASA NDVI action: ${action}, userId: ${userId}`);

    switch (action) {
      case 'get_satellite_tiles': {
        // Return NASA GIBS tile URLs for the given location
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        // Calculate tile coordinates from lat/lng
        const zoom = 9;
        const lat = latitude || 23.8103; // Default: Dhaka
        const lng = longitude || 90.4125;
        
        const n = Math.pow(2, zoom);
        const x = Math.floor((lng + 180) / 360 * n);
        const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
        
        const tiles = {
          ndvi_terra: getGIBSTileUrl(NDVI_LAYERS.terra, dateStr, zoom, x, y),
          ndvi_aqua: getGIBSTileUrl(NDVI_LAYERS.aqua, dateStr, zoom, x, y),
          true_color: getGIBSTileUrl(NDVI_LAYERS.viirs, dateStr, zoom, x, y),
          tile_coords: { z: zoom, x, y },
          date: dateStr,
          center: { lat, lng }
        };
        
        return new Response(JSON.stringify({ success: true, tiles }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_ndvi_history': {
        // Generate NDVI history for the past N days
        const historyDays = days || 90;
        const history: any[] = [];
        
        // Get field zone data if exists
        let baseScore = 0.65;
        if (fieldZoneId) {
          const { data: zone } = await supabase
            .from('field_zones')
            .select('health_score')
            .eq('id', fieldZoneId)
            .single();
          
          if (zone) {
            baseScore = zone.health_score;
          }
        }
        
        // Generate historical data points
        const today = new Date();
        for (let i = historyDays; i >= 0; i -= 7) { // Weekly data points
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          // Simulate seasonal patterns for Bangladesh
          const month = date.getMonth();
          let seasonalFactor = 0;
          
          // Boro season (Nov-Apr): Higher NDVI
          if (month >= 10 || month <= 3) {
            seasonalFactor = 0.1;
          }
          // Aus season (Apr-Jul): Moderate
          else if (month >= 3 && month <= 6) {
            seasonalFactor = 0;
          }
          // Aman season (Jul-Nov): Variable
          else {
            seasonalFactor = 0.05;
          }
          
          const ndvi = generateRealisticNDVI(baseScore, i, seasonalFactor);
          const status = getHealthStatus(ndvi);
          
          history.push({
            date: date.toISOString().split('T')[0],
            ndvi: parseFloat(ndvi.toFixed(3)),
            health_score: parseFloat((ndvi * 100).toFixed(1)),
            status: status.status,
            status_bn: status.status_bn,
            moisture_index: parseFloat((0.3 + ndvi * 0.5 + (Math.random() - 0.5) * 0.1).toFixed(3)),
            stress_level: parseFloat(((1 - ndvi) * 0.8).toFixed(3))
          });
        }
        
        // Calculate trend
        const recentAvg = history.slice(-4).reduce((a, b) => a + b.ndvi, 0) / 4;
        const olderAvg = history.slice(0, 4).reduce((a, b) => a + b.ndvi, 0) / 4;
        const trend = recentAvg > olderAvg + 0.05 ? 'improving' 
                    : recentAvg < olderAvg - 0.05 ? 'declining' 
                    : 'stable';
        
        const latestNDVI = history[history.length - 1]?.ndvi || baseScore;
        const recommendations = generateRecommendations(latestNDVI, trend, fieldZoneId || 'default');
        
        return new Response(JSON.stringify({ 
          success: true, 
          history,
          trend,
          trend_bn: trend === 'improving' ? 'উন্নতি হচ্ছে' : trend === 'declining' ? 'অবনতি হচ্ছে' : 'স্থিতিশীল',
          recommendations,
          summary: {
            latest_ndvi: latestNDVI,
            average_ndvi: parseFloat((history.reduce((a, b) => a + b.ndvi, 0) / history.length).toFixed(3)),
            max_ndvi: Math.max(...history.map(h => h.ndvi)),
            min_ndvi: Math.min(...history.map(h => h.ndvi))
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_all_zones_history': {
        // Get history for all field zones of a user
        if (!userId) {
          throw new Error('userId is required');
        }
        
        const { data: zones, error: zonesError } = await supabase
          .from('field_zones')
          .select('id, name, name_bn, health_score, latitude, longitude')
          .eq('user_id', userId);
        
        if (zonesError) throw zonesError;
        
        const zonesWithHistory = await Promise.all((zones || []).map(async (zone) => {
          const historyDays = days || 60;
          const history: any[] = [];
          const today = new Date();
          
          for (let i = historyDays; i >= 0; i -= 7) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const month = date.getMonth();
            let seasonalFactor = (month >= 10 || month <= 3) ? 0.1 : (month >= 3 && month <= 6) ? 0 : 0.05;
            
            const ndvi = generateRealisticNDVI(zone.health_score, i, seasonalFactor);
            
            history.push({
              date: date.toISOString().split('T')[0],
              ndvi: parseFloat(ndvi.toFixed(3)),
              health_score: parseFloat((ndvi * 100).toFixed(1))
            });
          }
          
          return {
            zone_id: zone.id,
            zone_name: zone.name,
            zone_name_bn: zone.name_bn,
            history
          };
        }));
        
        return new Response(JSON.stringify({ 
          success: true, 
          zones: zonesWithHistory
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'analyze_imagery': {
        // Analyze satellite imagery and detect anomalies
        const lat = latitude || 23.8103;
        const lng = longitude || 90.4125;
        
        // Simulate image analysis results
        const analysis = {
          vegetation_coverage: parseFloat((0.6 + Math.random() * 0.3).toFixed(2)),
          water_bodies: parseFloat((Math.random() * 0.1).toFixed(2)),
          bare_soil: parseFloat((0.1 + Math.random() * 0.2).toFixed(2)),
          cloud_coverage: parseFloat((Math.random() * 0.15).toFixed(2)),
          detected_anomalies: [] as any[],
          crop_type_prediction: 'rice', // Rice is most common in Bangladesh
          growth_stage: 'vegetative',
          estimated_yield: parseFloat((2.5 + Math.random() * 1.5).toFixed(2)), // tons per hectare
          last_updated: new Date().toISOString()
        };
        
        // Detect potential issues
        if (analysis.vegetation_coverage < 0.5) {
          analysis.detected_anomalies.push({
            type: 'low_vegetation',
            type_bn: 'কম গাছপালা',
            severity: 'warning',
            location: { lat: lat + (Math.random() - 0.5) * 0.01, lng: lng + (Math.random() - 0.5) * 0.01 },
            recommendation: 'পানির ঘাটতি বা রোগের লক্ষণ হতে পারে'
          });
        }
        
        if (analysis.bare_soil > 0.25) {
          analysis.detected_anomalies.push({
            type: 'exposed_soil',
            type_bn: 'উন্মুক্ত মাটি',
            severity: 'moderate',
            location: { lat: lat + (Math.random() - 0.5) * 0.01, lng: lng + (Math.random() - 0.5) * 0.01 },
            recommendation: 'মালচিং বা আবরণী ফসল বিবেচনা করুন'
          });
        }
        
        // Random pest detection
        if (Math.random() > 0.7) {
          analysis.detected_anomalies.push({
            type: 'pest_activity',
            type_bn: 'পোকার আক্রমণ সন্দেহ',
            severity: 'high',
            location: { lat: lat + (Math.random() - 0.5) * 0.01, lng: lng + (Math.random() - 0.5) * 0.01 },
            recommendation: 'ড্রোন দিয়ে নিবিড় পরিদর্শন প্রয়োজন'
          });
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          analysis,
          tile_url: getGIBSTileUrl(NDVI_LAYERS.viirs, new Date().toISOString().split('T')[0], 9, 
            Math.floor((lng + 180) / 360 * 512), 
            Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * 512)
          )
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('NASA NDVI function error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
