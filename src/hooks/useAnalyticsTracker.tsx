import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAnalyticsTracker() {
  const trackEvent = useCallback(async (eventType: string, eventName: string, metadata: Record<string, any> = {}) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      await supabase.from('analytics_events').insert({
        user_id: session?.user?.id || null,
        event_type: eventType,
        event_name: eventName,
        metadata
      });
    } catch (err) {
      // Silently fail - analytics should never break the app
      console.debug('Analytics tracking failed:', err);
    }
  }, []);

  const trackPageView = useCallback((pageName: string) => {
    trackEvent('page_view', pageName);
  }, [trackEvent]);

  const trackFeatureUse = useCallback((featureName: string, metadata?: Record<string, any>) => {
    trackEvent('feature_use', featureName, metadata);
  }, [trackEvent]);

  const trackAction = useCallback((actionName: string, metadata?: Record<string, any>) => {
    trackEvent('action', actionName, metadata);
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackFeatureUse,
    trackAction
  };
}
