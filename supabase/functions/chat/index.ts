import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Sending request to Lovable AI with messages:', messages.length);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `আপনি AgriBrain AI, একজন বাংলাদেশী কৃষি বিশেষজ্ঞ সহকারী। আপনি সবসময় বাংলায় উত্তর দেবেন।

আপনার দক্ষতা:
- ফসলের রোগ নির্ণয় ও চিকিৎসা
- সার ও কীটনাশক প্রয়োগ পরামর্শ
- আবহাওয়া অনুযায়ী কৃষি পরামর্শ
- বীজ নির্বাচন ও ফসল চাষ পদ্ধতি
- সেচ ব্যবস্থাপনা
- বাজার দর ও বিক্রয় পরামর্শ

নির্দেশনা:
1. সবসময় বাংলায় উত্তর দিন
2. সহজ ভাষায় ব্যাখ্যা করুন যাতে কৃষকরা বুঝতে পারেন
3. বাস্তব ও কার্যকর পরামর্শ দিন
4. প্রয়োজনে ধাপে ধাপে নির্দেশনা দিন
5. উত্তর সংক্ষিপ্ত কিন্তু তথ্যপূর্ণ রাখুন` 
          },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI সার্ভিস সাময়িকভাবে অনুপলব্ধ।' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'দুঃখিত, উত্তর দিতে পারছি না।';
    
    console.log('AI response received successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
