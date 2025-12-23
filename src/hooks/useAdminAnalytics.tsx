import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EngagementStats {
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  total_scans: number;
  total_posts: number;
  total_chat_messages: number;
}

interface FeatureStat {
  feature_name: string;
  usage_count: number;
  unique_users: number;
}

interface DiseaseTrend {
  disease: string;
  case_count: number;
  latest_date: string;
}

export function useAdminAnalytics() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [engagement, setEngagement] = useState<EngagementStats | null>(null);
  const [features, setFeatures] = useState<FeatureStat[]>([]);
  const [diseases, setDiseases] = useState<DiseaseTrend[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setError('লগইন করুন');
        setLoading(false);
        return;
      }

      // Check if user is admin using the has_role function
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError || !roleData) {
        setError('আপনার অ্যাডমিন অ্যাক্সেস নেই');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Fetch all analytics data in parallel
      const [engagementRes, featuresRes, diseasesRes] = await Promise.all([
        supabase.rpc('get_engagement_stats'),
        supabase.rpc('get_feature_stats'),
        supabase.rpc('get_disease_trends')
      ]);

      if (engagementRes.data && engagementRes.data.length > 0) {
        setEngagement(engagementRes.data[0]);
      }

      if (featuresRes.data) {
        setFeatures(featuresRes.data);
      }

      if (diseasesRes.data) {
        setDiseases(diseasesRes.data);
      }

    } catch (err) {
      console.error('Analytics error:', err);
      setError('ডেটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    setLoading(true);
    checkAdminAndFetchData();
  };

  return {
    isAdmin,
    loading,
    error,
    engagement,
    features,
    diseases,
    refetch
  };
}
