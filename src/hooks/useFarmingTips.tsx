import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FarmingTip {
  id: string;
  tip_text: string;
  category: string;
  season: string | null;
  crop_type: string | null;
}

export function useFarmingTips() {
  const [tips, setTips] = useState<FarmingTip[]>([]);
  const [currentTip, setCurrentTip] = useState<FarmingTip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const { data, error } = await supabase
        .from('farming_tips')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      const tipsList = data || [];
      setTips(tipsList);
      
      // Get random tip for today
      if (tipsList.length > 0) {
        const today = new Date().getDate();
        const tipIndex = today % tipsList.length;
        setCurrentTip(tipsList[tipIndex]);
      }
    } catch (err) {
      console.error('Error fetching tips:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRandomTip = () => {
    if (tips.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
  };

  return { tips, currentTip, loading, getRandomTip };
}
