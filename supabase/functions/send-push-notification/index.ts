import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Web Push requires base64url encoding
function base64UrlToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string }>;
}

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    // Use web-push compatible approach via fetch with VAPID
    const encoder = new TextEncoder();
    const payloadBytes = encoder.encode(JSON.stringify(payload));
    
    // For production, you'd use a proper web-push library
    // Here we'll use a simplified approach with the Push API
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
        'Urgency': 'high',
      },
      body: payloadBytes,
    });

    if (response.ok || response.status === 201) {
      console.log(`Push sent successfully to: ${subscription.endpoint.substring(0, 50)}...`);
      return true;
    } else if (response.status === 410) {
      // Subscription expired or invalid
      console.log(`Subscription expired: ${subscription.endpoint.substring(0, 50)}...`);
      return false;
    } else {
      console.error(`Push failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { alertType, title, body, userId, sendToAll } = await req.json();

    console.log(`Sending push notification: ${title} - ${alertType}`);

    // Build query for active subscriptions
    let query = supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true);

    if (userId && !sendToAll) {
      query = query.eq('user_id', userId);
    }

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      throw new Error('Failed to fetch subscriptions');
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active subscriptions found');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No active subscriptions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${subscriptions.length} active subscriptions`);

    const payload: PushPayload = {
      title: title || 'agriশক্তি সতর্কতা',
      body: body || 'নতুন বিজ্ঞপ্তি',
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: alertType || 'general',
      data: {
        alertType,
        timestamp: new Date().toISOString(),
        url: '/climate-alert'
      },
      actions: [
        { action: 'view', title: 'দেখুন' },
        { action: 'dismiss', title: 'বাতিল' }
      ]
    };

    let successCount = 0;
    let failedCount = 0;
    const expiredEndpoints: string[] = [];

    for (const sub of subscriptions) {
      const success = await sendPushNotification(
        {
          endpoint: sub.endpoint,
          p256dh: sub.p256dh,
          auth: sub.auth
        },
        payload,
        vapidPublicKey,
        vapidPrivateKey
      );

      if (success) {
        successCount++;
      } else {
        failedCount++;
        expiredEndpoints.push(sub.endpoint);
      }
    }

    // Mark expired subscriptions as inactive
    if (expiredEndpoints.length > 0) {
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .in('endpoint', expiredEndpoints);

      if (updateError) {
        console.error('Error updating expired subscriptions:', updateError);
      } else {
        console.log(`Marked ${expiredEndpoints.length} subscriptions as inactive`);
      }
    }

    console.log(`Push results: ${successCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failedCount,
        total: subscriptions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Push notification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
