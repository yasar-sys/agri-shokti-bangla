import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DroneRoute {
  id: string;
  user_id: string;
  field_zone_id: string | null;
  task: string;
  task_bn: string;
  area_acres: number;
  estimated_time_mins: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  status_bn: string;
  priority: number;
  waypoints: Array<{ lat: number; lng: number; type: string }>;
  optimized_path: Array<{ lat: number; lng: number; type: string }>;
  spray_type: string | null;
  coverage_percentage: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useDroneRoutes(userId: string | null) {
  const [routes, setRoutes] = useState<DroneRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const { toast } = useToast();

  // Fetch drone routes
  const fetchRoutes = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('drone_routes')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type assertion for JSONB fields and status
      const typedData = (data || []).map(route => ({
        ...route,
        status: route.status as DroneRoute['status'],
        waypoints: (route.waypoints || []) as DroneRoute['waypoints'],
        optimized_path: (route.optimized_path || []) as DroneRoute['optimized_path']
      }));

      setRoutes(typedData);
    } catch (error) {
      console.error('Error fetching drone routes:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Generate optimized routes for all field zones
  const generateRoutes = useCallback(async (sprayType?: string) => {
    if (!userId) return null;

    setOptimizing(true);
    try {
      const response = await supabase.functions.invoke('optimize-drone-route', {
        body: {
          action: 'generate_routes',
          userId,
          sprayType
        }
      });

      if (response.error) throw response.error;

      const { data } = response;
      if (!data.success) throw new Error(data.error);

      toast({
        title: 'রুট তৈরি সম্পন্ন',
        description: `${data.routes?.length || 0} টি ড্রোন রুট অপ্টিমাইজ হয়েছে`,
      });

      await fetchRoutes();
      return data;
    } catch (error) {
      console.error('Error generating routes:', error);
      toast({
        title: 'ত্রুটি',
        description: 'ড্রোন রুট তৈরি করতে ব্যর্থ',
        variant: 'destructive',
      });
      return null;
    } finally {
      setOptimizing(false);
    }
  }, [userId, fetchRoutes, toast]);

  // Optimize a single route
  const optimizeRoute = useCallback(async (routeId: string) => {
    if (!userId) return null;

    setOptimizing(true);
    try {
      const response = await supabase.functions.invoke('optimize-drone-route', {
        body: {
          action: 'optimize_single',
          userId,
          routeId
        }
      });

      if (response.error) throw response.error;

      const { data } = response;
      if (!data.success) throw new Error(data.error);

      toast({
        title: 'রুট অপ্টিমাইজ হয়েছে',
        description: 'ড্রোন রুট পুনরায় অপ্টিমাইজ করা হয়েছে',
      });

      await fetchRoutes();
      return data;
    } catch (error) {
      console.error('Error optimizing route:', error);
      toast({
        title: 'ত্রুটি',
        description: 'রুট অপ্টিমাইজ করতে ব্যর্থ',
        variant: 'destructive',
      });
      return null;
    } finally {
      setOptimizing(false);
    }
  }, [userId, fetchRoutes, toast]);

  // Start a drone route
  const startRoute = useCallback(async (routeId: string) => {
    if (!userId) return null;

    try {
      const response = await supabase.functions.invoke('optimize-drone-route', {
        body: {
          action: 'start_route',
          userId,
          routeId
        }
      });

      if (response.error) throw response.error;

      const { data } = response;
      if (!data.success) throw new Error(data.error);

      toast({
        title: 'ড্রোন শুরু হয়েছে',
        description: 'ড্রোন অপারেশন চলছে',
      });

      return data;
    } catch (error) {
      console.error('Error starting route:', error);
      toast({
        title: 'ত্রুটি',
        description: 'ড্রোন শুরু করতে ব্যর্থ',
        variant: 'destructive',
      });
      return null;
    }
  }, [userId, toast]);

  // Complete a drone route
  const completeRoute = useCallback(async (routeId: string) => {
    if (!userId) return null;

    try {
      const response = await supabase.functions.invoke('optimize-drone-route', {
        body: {
          action: 'complete_route',
          userId,
          routeId
        }
      });

      if (response.error) throw response.error;

      const { data } = response;
      if (!data.success) throw new Error(data.error);

      toast({
        title: 'অপারেশন সম্পন্ন',
        description: 'ড্রোন অপারেশন সফলভাবে শেষ হয়েছে',
      });

      return data;
    } catch (error) {
      console.error('Error completing route:', error);
      toast({
        title: 'ত্রুটি',
        description: 'অপারেশন সম্পন্ন করতে ব্যর্থ',
        variant: 'destructive',
      });
      return null;
    }
  }, [userId, toast]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    fetchRoutes();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`drone-routes-changes-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drone_routes',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Drone route change:', payload);
          if (payload.eventType === 'INSERT') {
            const newRoute = {
              ...payload.new,
              waypoints: (payload.new.waypoints || []) as DroneRoute['waypoints'],
              optimized_path: (payload.new.optimized_path || []) as DroneRoute['optimized_path']
            } as DroneRoute;
            setRoutes(prev => [newRoute, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedRoute = {
              ...payload.new,
              waypoints: (payload.new.waypoints || []) as DroneRoute['waypoints'],
              optimized_path: (payload.new.optimized_path || []) as DroneRoute['optimized_path']
            } as DroneRoute;
            setRoutes(prev =>
              prev.map(r => r.id === updatedRoute.id ? updatedRoute : r)
            );
          } else if (payload.eventType === 'DELETE') {
            setRoutes(prev =>
              prev.filter(r => r.id !== (payload.old as DroneRoute).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchRoutes]);

  // Calculate stats
  const stats = {
    total: routes.length,
    pending: routes.filter(r => r.status === 'pending').length,
    inProgress: routes.filter(r => r.status === 'in_progress').length,
    completed: routes.filter(r => r.status === 'completed').length,
    totalArea: routes.reduce((sum, r) => sum + r.area_acres, 0),
    totalTime: routes.reduce((sum, r) => sum + r.estimated_time_mins, 0)
  };

  return {
    routes,
    loading,
    optimizing,
    stats,
    generateRoutes,
    optimizeRoute,
    startRoute,
    completeRoute,
    refetch: fetchRoutes
  };
}
