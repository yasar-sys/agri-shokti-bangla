import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  loading: boolean;
  error: string | null;
}

// VAPID public key - this should match your generated key
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    loading: true,
    error: null
  });

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'serviceWorker' in navigator && 
                          'PushManager' in window && 
                          'Notification' in window;

      if (!isSupported) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          loading: false,
          error: 'Push notifications are not supported on this device'
        }));
        return;
      }

      // Check current permission
      const permission = Notification.permission;

      // Check if already subscribed (we store push SW under /push/ scope)
      try {
        const registration = await navigator.serviceWorker.getRegistration('/push/');
        const subscription = registration
          ? await registration.pushManager.getSubscription()
          : null;

        setState({
          isSupported: true,
          isSubscribed: !!subscription,
          permission,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error checking push subscription:', error);
        setState(prev => ({
          ...prev,
          isSupported: true,
          loading: false,
          error: 'Error checking subscription status'
        }));
      }
    };

    checkSupport();
  }, []);

  // Register service worker for push
  const registerServiceWorker = useCallback(async () => {
    try {
      // Use a dedicated scope to avoid conflicting with the main PWA SW.
      const scope = '/push/';

      // Check if already registered for this scope
      const existingReg = await navigator.serviceWorker.getRegistration(scope);
      if (existingReg) return existingReg;

      const registration = await navigator.serviceWorker.register('/sw-push.js', { scope });
      console.log('Push SW registered:', registration.scope);
      return registration;
    } catch (error) {
      console.error('SW registration failed:', error);
      throw new Error('Failed to register service worker');
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setState(prev => ({
          ...prev,
          permission,
          loading: false,
          error: 'Notification permission denied'
        }));
        toast.error('বিজ্ঞপ্তি অনুমতি প্রত্যাখ্যান করা হয়েছে');
        return false;
      }

      // Register service worker (push scope)
      const registration = await registerServiceWorker();

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer
      });

      const subscriptionJson = subscription.toJSON();
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();

      // Save subscription to database
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscriptionJson.endpoint!,
          p256dh: subscriptionJson.keys!.p256dh,
          auth: subscriptionJson.keys!.auth,
          user_id: session?.user?.id || null,
          is_active: true,
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        }, {
          onConflict: 'endpoint'
        });

      if (dbError) {
        console.error('Error saving subscription:', dbError);
        throw new Error('Failed to save subscription');
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        permission: 'granted',
        loading: false,
        error: null
      }));

      toast.success('বিজ্ঞপ্তি সক্রিয় করা হয়েছে!');
      return true;

    } catch (error) {
      console.error('Subscription error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Subscription failed'
      }));
      toast.error('বিজ্ঞপ্তি সক্রিয় করতে ব্যর্থ');
      return false;
    }
  }, [registerServiceWorker]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.getRegistration('/push/');
      const subscription = registration ? await registration.pushManager.getSubscription() : null;

      if (subscription) {
        const endpoint = subscription.endpoint;
        
        // Unsubscribe from push
        await subscription.unsubscribe();

        // Remove from database
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', endpoint);
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        loading: false,
        error: null
      }));

      toast.success('বিজ্ঞপ্তি নিষ্ক্রিয় করা হয়েছে');
      return true;

    } catch (error) {
      console.error('Unsubscribe error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to unsubscribe'
      }));
      toast.error('বিজ্ঞপ্তি নিষ্ক্রিয় করতে ব্যর্থ');
      return false;
    }
  }, []);

  // Send a test notification
  const sendTestNotification = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          alertType: 'test',
          title: 'পরীক্ষামূলক বিজ্ঞপ্তি',
          body: 'আপনার বিজ্ঞপ্তি সিস্টেম সঠিকভাবে কাজ করছে!',
          sendToAll: false
        }
      });

      if (error) throw error;
      
      toast.success('পরীক্ষামূলক বিজ্ঞপ্তি পাঠানো হয়েছে');
      return true;
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('বিজ্ঞপ্তি পাঠাতে ব্যর্থ');
      return false;
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
}
