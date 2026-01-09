import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScanRecord {
  id: string;
  image_url: string | null;
  disease_name: string | null;
  health_score: number | null;
  symptoms: string[] | null;
  treatment: string | null;
  fertilizer_advice: string | null;
  created_at: string;
}

export function useScanHistory() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user's scan history
  const fetchScans = useCallback(async () => {
    if (!userId) {
      setScans([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setScans(data || []);
    } catch (err) {
      console.error('Error fetching scan history:', err);
      toast.error('স্ক্যান ইতিহাস লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  // Save a new scan to history
  const saveScan = useCallback(async (scanData: {
    image_url?: string;
    disease_name: string;
    health_score: number;
    symptoms?: string[];
    treatment?: string;
    fertilizer_advice?: string;
  }) => {
    if (!userId) {
      console.log('User not logged in, scan not saved to history');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('scan_history')
        .insert({
          user_id: userId,
          session_id: crypto.randomUUID(),
          disease_name: scanData.disease_name,
          health_score: scanData.health_score,
          symptoms: scanData.symptoms || [],
          treatment: scanData.treatment || '',
          fertilizer_advice: scanData.fertilizer_advice || '',
          image_url: scanData.image_url || null
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setScans(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      console.error('Error saving scan:', err);
      return null;
    }
  }, [userId]);

  // Delete a scan from history
  const deleteScan = useCallback(async (scanId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('scan_history')
        .delete()
        .eq('id', scanId)
        .eq('user_id', userId);

      if (error) throw error;
      
      setScans(prev => prev.filter(s => s.id !== scanId));
      toast.success('স্ক্যান মুছে ফেলা হয়েছে');
      return true;
    } catch (err) {
      console.error('Error deleting scan:', err);
      toast.error('মুছতে সমস্যা হয়েছে');
      return false;
    }
  }, [userId]);

  // Get scan statistics
  const getStats = useCallback(() => {
    const totalScans = scans.length;
    const diseasesDetected = scans.filter(s => s.disease_name && s.disease_name !== 'সুস্থ ফসল').length;
    const healthyScans = scans.filter(s => s.health_score && s.health_score >= 80).length;
    const avgHealthScore = scans.length > 0 
      ? Math.round(scans.reduce((acc, s) => acc + (s.health_score || 0), 0) / scans.length)
      : 0;

    return {
      totalScans,
      diseasesDetected,
      healthyScans,
      avgHealthScore
    };
  }, [scans]);

  return {
    scans,
    loading,
    userId,
    saveScan,
    deleteScan,
    refetch: fetchScans,
    getStats,
    isAuthenticated: !!userId
  };
}
