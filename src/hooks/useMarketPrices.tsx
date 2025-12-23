import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MarketPrice {
  id: string;
  crop_name: string;
  crop_emoji: string | null;
  today_price: number;
  yesterday_price: number;
  weekly_avg: number | null;
  unit: string | null;
  market_location: string | null;
  forecast: string | null;
  forecast_price: number | null;
  confidence: number | null;
  updated_at: string;
}

export function useMarketPrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrices();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('market-prices-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'market_prices' },
        () => {
          fetchPrices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPrices = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('market_prices')
        .select('*')
        .order('crop_name');

      if (fetchError) throw fetchError;
      setPrices(data || []);
    } catch (err) {
      console.error('Error fetching market prices:', err);
      setError('বাজার দর লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const getTopPrices = (count = 3) => {
    return prices.slice(0, count).map(p => ({
      emoji: p.crop_emoji,
      name: p.crop_name,
      price: `৳${p.today_price.toLocaleString('bn-BD')}`,
      weeklyAvg: p.weekly_avg ? `৳${p.weekly_avg.toLocaleString('bn-BD')}` : null,
      change: p.today_price - p.yesterday_price,
      positive: p.today_price >= p.yesterday_price
    }));
  };

  return { prices, loading, error, getTopPrices, refetch: fetchPrices };
}
