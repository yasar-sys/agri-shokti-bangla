import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MarketPrice {
  crop_name: string;
  crop_emoji: string | null;
  today_price: number;
  yesterday_price: number;
  weekly_avg: number | null;
  forecast: string | null;
  forecast_price: number | null;
  confidence: number | null;
}

interface AIResponse {
  analysis: string;
  recommendation: string;
  confidence: number;
}

type AIStatus = 'idle' | 'loading_prices' | 'analyzing' | 'complete' | 'error';

export function useMarketAI() {
  const [status, setStatus] = useState<AIStatus>('idle');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeMarket = useCallback(async (query: string) => {
    setStatus('loading_prices');
    setError(null);
    setResponse(null);

    try {
      // Step 1: Load market prices
      const { data: prices, error: pricesError } = await supabase
        .from('market_prices')
        .select('*')
        .order('crop_name');

      if (pricesError) throw pricesError;

      if (!prices || prices.length === 0) {
        throw new Error('বাজার দর ডেটা পাওয়া যায়নি');
      }

      setStatus('analyzing');

      // Build context for AI
      const priceContext = prices.map((p: MarketPrice) => {
        const change = p.today_price - p.yesterday_price;
        const changePercent = ((change / p.yesterday_price) * 100).toFixed(1);
        return `${p.crop_emoji || ''} ${p.crop_name}: আজ ৳${p.today_price}, গতকাল ৳${p.yesterday_price} (${change >= 0 ? '+' : ''}${changePercent}%), সাপ্তাহিক গড় ৳${p.weekly_avg || p.today_price}, পূর্বাভাস: ${p.forecast === 'up' ? 'বাড়বে' : p.forecast === 'down' ? 'কমবে' : 'স্থিতিশীল'}`;
      }).join('\n');

      // Step 2: Call AI for analysis
      const { data: aiData, error: aiError } = await supabase.functions.invoke('market-ai', {
        body: { 
          query,
          priceContext,
          prices: prices.map((p: MarketPrice) => ({
            name: p.crop_name,
            emoji: p.crop_emoji,
            today: p.today_price,
            yesterday: p.yesterday_price,
            weeklyAvg: p.weekly_avg,
            forecast: p.forecast,
            forecastPrice: p.forecast_price,
            confidence: p.confidence
          }))
        }
      });

      if (aiError) throw aiError;

      setResponse({
        analysis: aiData.analysis || aiData.response,
        recommendation: aiData.recommendation || '',
        confidence: aiData.confidence || 85
      });
      setStatus('complete');

    } catch (err) {
      console.error('Market AI error:', err);
      setError(err instanceof Error ? err.message : 'AI বিশ্লেষণে সমস্যা হয়েছে');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResponse(null);
    setError(null);
  }, []);

  return { 
    status, 
    response, 
    error, 
    analyzeMarket, 
    reset,
    isLoading: status === 'loading_prices' || status === 'analyzing'
  };
}
