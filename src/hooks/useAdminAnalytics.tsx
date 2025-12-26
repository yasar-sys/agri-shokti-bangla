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

interface ChatMessage {
  content: string;
  sender: string;
  created_at: string;
  session_id: string;
}

interface ScanRecord {
  disease_name: string | null;
  health_score: number | null;
  treatment: string | null;
  created_at: string;
}

interface CommunityPost {
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  likes_count: number | null;
  comments_count: number | null;
}

interface DailyActivity {
  date: string;
  count: number;
}

export function useAdminAnalytics() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [engagement, setEngagement] = useState<EngagementStats | null>(null);
  const [features, setFeatures] = useState<FeatureStat[]>([]);
  const [diseases, setDiseases] = useState<DiseaseTrend[]>([]);
  const [recentChats, setRecentChats] = useState<ChatMessage[]>([]);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserId(session?.user?.id || null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when userId changes
  useEffect(() => {
    if (userId) {
      checkAdminAndFetchData(userId);
    } else {
      setLoading(false);
      setError('লগইন করুন');
    }
  }, [userId]);

  const checkAdminAndFetchData = async (currentUserId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is admin using the passed userId
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUserId)
        .eq('role', 'admin')
        .maybeSingle();
      
      console.log('Admin check for user:', currentUserId, 'Result:', roleData, 'Error:', roleError);

      if (roleError || !roleData) {
        setError('আপনার অ্যাডমিন অ্যাক্সেস নেই');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Fetch all analytics data in parallel
      const [
        engagementRes, 
        featuresRes, 
        diseasesRes,
        chatsRes,
        scansRes,
        postsRes,
        activityRes
      ] = await Promise.all([
        supabase.rpc('get_engagement_stats'),
        supabase.rpc('get_feature_stats'),
        supabase.rpc('get_disease_trends'),
        supabase.from('chat_messages').select('content, sender, created_at, session_id').order('created_at', { ascending: false }).limit(50),
        supabase.from('scan_history').select('disease_name, health_score, treatment, created_at').order('created_at', { ascending: false }).limit(20),
        supabase.from('community_posts').select('title, content, author_name, created_at, likes_count, comments_count').order('created_at', { ascending: false }).limit(20),
        supabase.from('analytics_events').select('created_at').order('created_at', { ascending: false }).limit(500)
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

      if (chatsRes.data) {
        setRecentChats(chatsRes.data);
      }

      if (scansRes.data) {
        setRecentScans(scansRes.data);
      }

      if (postsRes.data) {
        setRecentPosts(postsRes.data);
      }

      // Process daily activity for last 7 days
      if (activityRes.data) {
        const activityByDay: Record<string, number> = {};
        const today = new Date();
        
        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('bn-BD', { weekday: 'short' });
          activityByDay[dateStr] = 0;
        }

        // Count events
        activityRes.data.forEach(event => {
          const eventDate = new Date(event.created_at);
          const daysDiff = Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff < 7) {
            const dateStr = eventDate.toLocaleDateString('bn-BD', { weekday: 'short' });
            if (activityByDay[dateStr] !== undefined) {
              activityByDay[dateStr]++;
            }
          }
        });

        setDailyActivity(Object.entries(activityByDay).map(([date, count]) => ({ date, count })));
      }

    } catch (err) {
      console.error('Analytics error:', err);
      setError('ডেটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    if (userId) {
      checkAdminAndFetchData(userId);
    }
  };

  return {
    isAdmin,
    loading,
    error,
    engagement,
    features,
    diseases,
    recentChats,
    recentScans,
    recentPosts,
    dailyActivity,
    refetch
  };
}
