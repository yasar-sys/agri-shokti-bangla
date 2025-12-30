import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Waypoint {
  lat: number;
  lng: number;
  type: 'start' | 'waypoint' | 'end';
}

interface FieldZone {
  id: string;
  name: string;
  health_score: number;
  latitude: number;
  longitude: number;
  area_acres: number;
}

// Traveling Salesman Problem solver using nearest neighbor heuristic
function optimizeRoute(waypoints: Waypoint[]): Waypoint[] {
  if (waypoints.length <= 2) return waypoints;
  
  const optimized: Waypoint[] = [];
  const remaining = [...waypoints];
  
  // Start from the first waypoint
  let current = remaining.shift()!;
  optimized.push(current);
  
  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const distance = calculateDistance(current, remaining[i]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }
    
    current = remaining.splice(nearestIndex, 1)[0];
    optimized.push(current);
  }
  
  return optimized;
}

function calculateDistance(p1: Waypoint, p2: Waypoint): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Generate spray pattern waypoints for a field zone
function generateSprayWaypoints(zone: FieldZone, sprayWidth: number = 0.01): Waypoint[] {
  const waypoints: Waypoint[] = [];
  const baseLatLng = { lat: zone.latitude || 23.8103, lng: zone.longitude || 90.4125 };
  
  // Calculate field dimensions based on area (assuming roughly square field)
  const areaKm2 = (zone.area_acres || 1) * 0.00404686;
  const sideLength = Math.sqrt(areaKm2);
  const latDelta = sideLength / 111; // 1 degree lat ≈ 111km
  const lngDelta = sideLength / (111 * Math.cos(toRad(baseLatLng.lat)));
  
  // Generate zigzag pattern for complete coverage
  const rows = Math.ceil(latDelta / sprayWidth);
  for (let i = 0; i <= rows; i++) {
    const lat = baseLatLng.lat + (i * sprayWidth * (i % 2 === 0 ? 1 : 1));
    if (i % 2 === 0) {
      waypoints.push({ lat, lng: baseLatLng.lng, type: 'waypoint' });
      waypoints.push({ lat, lng: baseLatLng.lng + lngDelta, type: 'waypoint' });
    } else {
      waypoints.push({ lat, lng: baseLatLng.lng + lngDelta, type: 'waypoint' });
      waypoints.push({ lat, lng: baseLatLng.lng, type: 'waypoint' });
    }
  }
  
  // Mark start and end
  if (waypoints.length > 0) {
    waypoints[0].type = 'start';
    waypoints[waypoints.length - 1].type = 'end';
  }
  
  return waypoints;
}

// Prioritize zones based on health score and urgency
function prioritizeZones(zones: FieldZone[]): FieldZone[] {
  return [...zones].sort((a, b) => {
    // Lower health score = higher priority
    const priorityA = a.health_score < 0.5 ? 3 : a.health_score < 0.7 ? 2 : 1;
    const priorityB = b.health_score < 0.5 ? 3 : b.health_score < 0.7 ? 2 : 1;
    return priorityB - priorityA;
  });
}

// Estimate spray time based on area and drone specs
function estimateSprayTime(areaAcres: number): number {
  // Assuming drone covers 1 acre in 10 minutes (including turns and refills)
  return Math.ceil(areaAcres * 10);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, userId, fieldZoneId, routeId, sprayType, waypoints } = await req.json();
    console.log(`Drone route optimization action: ${action}`, { userId, fieldZoneId, routeId });

    switch (action) {
      case 'generate_routes': {
        // Get all field zones for the user
        const { data: zones, error: zonesError } = await supabase
          .from('field_zones')
          .select('*')
          .eq('user_id', userId);

        if (zonesError) throw zonesError;
        if (!zones || zones.length === 0) {
          return new Response(JSON.stringify({ 
            success: true, 
            routes: [],
            message: 'No field zones found' 
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Prioritize zones and generate routes
        const prioritizedZones = prioritizeZones(zones);
        const routes = [];

        for (const zone of prioritizedZones) {
          const waypoints = generateSprayWaypoints(zone);
          const optimizedPath = optimizeRoute(waypoints);
          const estimatedTime = estimateSprayTime(zone.area_acres || 1);

          // Determine task based on health score
          let task = 'monitoring';
          let taskBn = 'পর্যবেক্ষণ';
          if (zone.health_score < 0.5) {
            task = 'pesticide_spray';
            taskBn = 'কীটনাশক স্প্রে';
          } else if (zone.health_score < 0.7) {
            task = 'fertilizer_spray';
            taskBn = 'সার ছিটানো';
          }

          // Create or update route in database
          const { data: route, error: routeError } = await supabase
            .from('drone_routes')
            .upsert({
              user_id: userId,
              field_zone_id: zone.id,
              task,
              task_bn: taskBn,
              area_acres: zone.area_acres || 1,
              estimated_time_mins: estimatedTime,
              status: 'pending',
              status_bn: 'অপেক্ষমাণ',
              priority: zone.health_score < 0.5 ? 3 : zone.health_score < 0.7 ? 2 : 1,
              waypoints,
              optimized_path: optimizedPath,
              spray_type: sprayType || task
            }, { onConflict: 'id' })
            .select()
            .single();

          if (!routeError && route) {
            routes.push(route);
          }
        }

        console.log(`Generated ${routes.length} drone routes`);
        return new Response(JSON.stringify({ 
          success: true, 
          routes,
          totalEstimatedTime: routes.reduce((sum, r) => sum + r.estimated_time_mins, 0)
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'optimize_single': {
        // Optimize a single route
        if (!routeId) throw new Error('routeId required');

        const { data: route, error: routeError } = await supabase
          .from('drone_routes')
          .select('*, field_zones(*)')
          .eq('id', routeId)
          .single();

        if (routeError) throw routeError;

        const zone = route.field_zones;
        const newWaypoints = waypoints || generateSprayWaypoints(zone);
        const optimizedPath = optimizeRoute(newWaypoints);

        const { data: updated, error: updateError } = await supabase
          .from('drone_routes')
          .update({
            waypoints: newWaypoints,
            optimized_path: optimizedPath,
            updated_at: new Date().toISOString()
          })
          .eq('id', routeId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ 
          success: true, 
          route: updated 
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'start_route': {
        if (!routeId) throw new Error('routeId required');

        const { data: updated, error } = await supabase
          .from('drone_routes')
          .update({
            status: 'in_progress',
            status_bn: 'চলছে',
            started_at: new Date().toISOString()
          })
          .eq('id', routeId)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, route: updated }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'complete_route': {
        if (!routeId) throw new Error('routeId required');

        const { data: updated, error } = await supabase
          .from('drone_routes')
          .update({
            status: 'completed',
            status_bn: 'সম্পন্ন',
            completed_at: new Date().toISOString(),
            coverage_percentage: 100
          })
          .eq('id', routeId)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, route: updated }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'update_progress': {
        if (!routeId) throw new Error('routeId required');
        const { coverage } = await req.json();

        const { data: updated, error } = await supabase
          .from('drone_routes')
          .update({
            coverage_percentage: coverage || 0
          })
          .eq('id', routeId)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, route: updated }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Drone route optimization error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
