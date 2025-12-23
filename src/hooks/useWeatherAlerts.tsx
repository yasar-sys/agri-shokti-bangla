import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeatherAlert {
  id: string;
  alert_type: string;
  severity: string | null;
  title: string;
  message: string;
  advice: string | null;
  region: string | null;
  valid_from: string | null;
  valid_until: string | null;
}

export function useWeatherAlerts() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('weather_alerts')
        .select('*')
        .eq('is_active', true)
        .order('severity', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      console.error('Error fetching weather alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveAlerts = alerts.length > 0;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high' as string);

  return { alerts, loading, hasActiveAlerts, criticalAlerts, refetch: fetchAlerts };
}
