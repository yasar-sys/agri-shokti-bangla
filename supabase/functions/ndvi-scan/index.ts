import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NDVIAnalysis {
  healthScore: number;
  vegetationIndex: number;
  moistureLevel: number;
  stressLevel: number;
  status: string;
  statusBn: string;
  recommendations: string[];
}

// Simulate NDVI analysis from satellite data
// In production, this would integrate with actual satellite APIs like Sentinel-2, Planet Labs, etc.
function analyzeNDVI(previousScore: number | null): NDVIAnalysis {
  // Simulate realistic NDVI variations based on seasonal and environmental factors
  const baseScore = previousScore || 0.7;
  const variation = (Math.random() - 0.5) * 0.15; // ±7.5% variation
  const healthScore = Math.max(0.1, Math.min(0.99, baseScore + variation));
  
  // Calculate derived metrics
  const vegetationIndex = healthScore * (0.85 + Math.random() * 0.15);
  const moistureLevel = 0.4 + healthScore * 0.5 + (Math.random() - 0.5) * 0.1;
  const stressLevel = Math.max(0, 1 - healthScore - Math.random() * 0.1);
  
  // Determine status based on health score
  let status: string;
  let statusBn: string;
  let recommendations: string[] = [];
  
  if (healthScore >= 0.85) {
    status = 'excellent';
    statusBn = 'অত্যন্ত ভালো';
    recommendations = [
      'বর্তমান চাষ পদ্ধতি বজায় রাখুন',
      'নিয়মিত পর্যবেক্ষণ করুন'
    ];
  } else if (healthScore >= 0.7) {
    status = 'good';
    statusBn = 'সুস্থ';
    recommendations = [
      'পরবর্তী সপ্তাহে পানি সেচ দিন',
      'মাটির আর্দ্রতা পরীক্ষা করুন'
    ];
  } else if (healthScore >= 0.5) {
    status = 'moderate';
    statusBn = 'মাঝারি';
    recommendations = [
      'জৈব সার প্রয়োগ করুন',
      'কীটপতঙ্গ পরীক্ষা করুন',
      'সেচ বাড়ান'
    ];
  } else if (healthScore >= 0.3) {
    status = 'poor';
    statusBn = 'সমস্যা আছে';
    recommendations = [
      'জরুরি কীটনাশক স্প্রে প্রয়োজন',
      'মাটি পরীক্ষা করান',
      'কৃষি বিশেষজ্ঞের পরামর্শ নিন'
    ];
  } else {
    status = 'critical';
    statusBn = 'গুরুতর সমস্যা';
    recommendations = [
      'জরুরি পদক্ষেপ প্রয়োজন',
      'রোগ নির্ণয় করুন',
      'বিকল্প ফসল বিবেচনা করুন'
    ];
  }
  
  return {
    healthScore: Math.round(healthScore * 100) / 100,
    vegetationIndex: Math.round(vegetationIndex * 1000) / 1000,
    moistureLevel: Math.round(moistureLevel * 100) / 100,
    stressLevel: Math.round(stressLevel * 100) / 100,
    status,
    statusBn,
    recommendations
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, userId, fieldZoneId } = await req.json();
    console.log(`NDVI scan action: ${action}`, { userId, fieldZoneId });

    switch (action) {
      case 'scan_all': {
        // Get all field zones for the user
        const { data: zones, error: zonesError } = await supabase
          .from('field_zones')
          .select('*')
          .eq('user_id', userId);

        if (zonesError) throw zonesError;
        if (!zones || zones.length === 0) {
          return new Response(JSON.stringify({ 
            success: true, 
            scans: [],
            message: 'No field zones found' 
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const scans = [];
        for (const zone of zones) {
          const analysis = analyzeNDVI(zone.health_score);
          
          // Record the scan
          const { data: scan, error: scanError } = await supabase
            .from('ndvi_scans')
            .insert({
              field_zone_id: zone.id,
              user_id: userId,
              health_score: analysis.healthScore,
              vegetation_index: analysis.vegetationIndex,
              moisture_level: analysis.moistureLevel,
              stress_level: analysis.stressLevel,
              raw_data: { recommendations: analysis.recommendations },
              scan_source: 'satellite'
            })
            .select()
            .single();

          if (scanError) {
            console.error('Error recording scan:', scanError);
            continue;
          }

          // Update the field zone with new health data
          const { error: updateError } = await supabase
            .from('field_zones')
            .update({
              health_score: analysis.healthScore,
              status: analysis.status,
              status_bn: analysis.statusBn,
              last_scan_at: new Date().toISOString(),
              ndvi_data: {
                vegetationIndex: analysis.vegetationIndex,
                moistureLevel: analysis.moistureLevel,
                stressLevel: analysis.stressLevel,
                recommendations: analysis.recommendations
              }
            })
            .eq('id', zone.id);

          if (updateError) {
            console.error('Error updating zone:', updateError);
          }

          scans.push({
            ...scan,
            zone_name: zone.name,
            zone_name_bn: zone.name_bn,
            recommendations: analysis.recommendations
          });
        }

        console.log(`Completed ${scans.length} NDVI scans`);
        return new Response(JSON.stringify({ 
          success: true, 
          scans,
          summary: {
            total: scans.length,
            avgHealth: scans.reduce((sum, s) => sum + s.health_score, 0) / scans.length,
            criticalZones: scans.filter(s => s.health_score < 0.5).length
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'scan_single': {
        if (!fieldZoneId) throw new Error('fieldZoneId required');

        const { data: zone, error: zoneError } = await supabase
          .from('field_zones')
          .select('*')
          .eq('id', fieldZoneId)
          .single();

        if (zoneError) throw zoneError;

        const analysis = analyzeNDVI(zone.health_score);

        // Record the scan
        const { data: scan, error: scanError } = await supabase
          .from('ndvi_scans')
          .insert({
            field_zone_id: zone.id,
            user_id: userId,
            health_score: analysis.healthScore,
            vegetation_index: analysis.vegetationIndex,
            moisture_level: analysis.moistureLevel,
            stress_level: analysis.stressLevel,
            raw_data: { recommendations: analysis.recommendations },
            scan_source: 'satellite'
          })
          .select()
          .single();

        if (scanError) throw scanError;

        // Update the field zone
        await supabase
          .from('field_zones')
          .update({
            health_score: analysis.healthScore,
            status: analysis.status,
            status_bn: analysis.statusBn,
            last_scan_at: new Date().toISOString(),
            ndvi_data: {
              vegetationIndex: analysis.vegetationIndex,
              moistureLevel: analysis.moistureLevel,
              stressLevel: analysis.stressLevel,
              recommendations: analysis.recommendations
            }
          })
          .eq('id', zone.id);

        return new Response(JSON.stringify({ 
          success: true, 
          scan: {
            ...scan,
            zone_name: zone.name,
            zone_name_bn: zone.name_bn,
            recommendations: analysis.recommendations
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get_history': {
        const { limit = 10 } = await req.json();
        
        let query = supabase
          .from('ndvi_scans')
          .select('*, field_zones(name, name_bn)')
          .eq('user_id', userId)
          .order('scanned_at', { ascending: false })
          .limit(limit);

        if (fieldZoneId) {
          query = query.eq('field_zone_id', fieldZoneId);
        }

        const { data: scans, error } = await query;
        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true, 
          scans 
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get_trends': {
        if (!fieldZoneId) throw new Error('fieldZoneId required');

        const { data: scans, error } = await supabase
          .from('ndvi_scans')
          .select('health_score, vegetation_index, moisture_level, stress_level, scanned_at')
          .eq('field_zone_id', fieldZoneId)
          .order('scanned_at', { ascending: true })
          .limit(30);

        if (error) throw error;

        // Calculate trend (improving, declining, stable)
        let trend = 'stable';
        if (scans.length >= 2) {
          const recent = scans.slice(-5);
          const avgRecent = recent.reduce((sum, s) => sum + s.health_score, 0) / recent.length;
          const older = scans.slice(0, 5);
          const avgOlder = older.reduce((sum, s) => sum + s.health_score, 0) / older.length;
          
          if (avgRecent - avgOlder > 0.05) trend = 'improving';
          else if (avgOlder - avgRecent > 0.05) trend = 'declining';
        }

        return new Response(JSON.stringify({ 
          success: true, 
          scans,
          trend
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('NDVI scan error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
