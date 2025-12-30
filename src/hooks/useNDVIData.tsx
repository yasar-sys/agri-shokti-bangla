import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FieldZone {
  id: string;
  user_id: string;
  name: string;
  name_bn: string;
  health_score: number;
  status: string;
  status_bn: string;
  latitude: number | null;
  longitude: number | null;
  area_acres: number | null;
  last_scan_at: string;
  ndvi_data: {
    vegetationIndex?: number;
    moistureLevel?: number;
    stressLevel?: number;
    recommendations?: string[];
  };
  created_at: string;
  updated_at: string;
}

interface NDVIScan {
  id: string;
  field_zone_id: string;
  health_score: number;
  vegetation_index: number | null;
  moisture_level: number | null;
  stress_level: number | null;
  scanned_at: string;
}

export function useNDVIData(userId: string | null) {
  const [fieldZones, setFieldZones] = useState<FieldZone[]>([]);
  const [scans, setScans] = useState<NDVIScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  // Fetch field zones
  const fetchFieldZones = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('field_zones')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion for ndvi_data since it comes as unknown from Supabase
      const typedData = (data || []).map(zone => ({
        ...zone,
        ndvi_data: (zone.ndvi_data || {}) as FieldZone['ndvi_data']
      }));
      
      setFieldZones(typedData);
    } catch (error) {
      console.error('Error fetching field zones:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch recent scans
  const fetchScans = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('ndvi_scans')
        .select('*')
        .eq('user_id', userId)
        .order('scanned_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error('Error fetching scans:', error);
    }
  }, [userId]);

  // Create a new field zone
  const createFieldZone = useCallback(async (zone: Partial<FieldZone>) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('field_zones')
        .insert({
          user_id: userId,
          name: zone.name || 'New Zone',
          name_bn: zone.name_bn || 'নতুন জোন',
          health_score: zone.health_score || 0.7,
          status: zone.status || 'unknown',
          status_bn: zone.status_bn || 'অজানা',
          latitude: zone.latitude,
          longitude: zone.longitude,
          area_acres: zone.area_acres || 1,
          ndvi_data: zone.ndvi_data || {}
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'সফল',
        description: 'নতুন ফিল্ড জোন যোগ হয়েছে',
      });

      await fetchFieldZones();
      return data;
    } catch (error) {
      console.error('Error creating field zone:', error);
      toast({
        title: 'ত্রুটি',
        description: 'ফিল্ড জোন যোগ করতে ব্যর্থ',
        variant: 'destructive',
      });
      return null;
    }
  }, [userId, fetchFieldZones, toast]);

  // Trigger NDVI scan
  const triggerScan = useCallback(async (fieldZoneId?: string) => {
    if (!userId) return null;

    setScanning(true);
    try {
      const response = await supabase.functions.invoke('ndvi-scan', {
        body: {
          action: fieldZoneId ? 'scan_single' : 'scan_all',
          userId,
          fieldZoneId
        }
      });

      if (response.error) throw response.error;

      const { data } = response;
      if (!data.success) throw new Error(data.error);

      toast({
        title: 'স্ক্যান সম্পন্ন',
        description: fieldZoneId 
          ? 'NDVI স্ক্যান সম্পন্ন হয়েছে' 
          : `${data.scans?.length || 0} টি জোন স্ক্যান হয়েছে`,
      });

      await fetchFieldZones();
      await fetchScans();

      return data;
    } catch (error) {
      console.error('Error triggering scan:', error);
      toast({
        title: 'ত্রুটি',
        description: 'NDVI স্ক্যান করতে ব্যর্থ',
        variant: 'destructive',
      });
      return null;
    } finally {
      setScanning(false);
    }
  }, [userId, fetchFieldZones, fetchScans, toast]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    fetchFieldZones();
    fetchScans();

    // Subscribe to real-time updates
    const zonesChannel = supabase
      .channel('field-zones-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'field_zones',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Field zone change:', payload);
          if (payload.eventType === 'INSERT') {
            const newZone = {
              ...payload.new,
              ndvi_data: (payload.new.ndvi_data || {}) as FieldZone['ndvi_data']
            } as FieldZone;
            setFieldZones(prev => [newZone, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedZone = {
              ...payload.new,
              ndvi_data: (payload.new.ndvi_data || {}) as FieldZone['ndvi_data']
            } as FieldZone;
            setFieldZones(prev => 
              prev.map(z => z.id === updatedZone.id ? updatedZone : z)
            );
          } else if (payload.eventType === 'DELETE') {
            setFieldZones(prev => 
              prev.filter(z => z.id !== (payload.old as FieldZone).id)
            );
          }
        }
      )
      .subscribe();

    const scansChannel = supabase
      .channel('ndvi-scans-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ndvi_scans',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New NDVI scan:', payload);
          setScans(prev => [payload.new as NDVIScan, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(zonesChannel);
      supabase.removeChannel(scansChannel);
    };
  }, [userId, fetchFieldZones, fetchScans]);

  return {
    fieldZones,
    scans,
    loading,
    scanning,
    createFieldZone,
    triggerScan,
    refetch: fetchFieldZones
  };
}
