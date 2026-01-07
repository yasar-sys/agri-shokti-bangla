import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, priceContext, prices } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Find specific crop if mentioned in query
    const queriedCrop = prices?.find((p: any) => 
      query.toLowerCase().includes(p.name.toLowerCase()) ||
      (p.emoji && query.includes(p.emoji))
    );

    const systemPrompt = `আপনি AgriBrain বাজার বিশ্লেষক AI। আপনি বাংলাদেশের কৃষি পণ্যের বাজার দর বিশ্লেষণ করেন।

বর্তমান বাজার দর:
${priceContext}

নির্দেশনা:
1. সবসময় বাংলায় উত্তর দিন
2. কৃষকদের জন্য সহজ ভাষায় ব্যাখ্যা করুন
3. দাম, প্রবণতা এবং পূর্বাভাস বিশ্লেষণ করুন
4. বিক্রির সঠিক সময় সম্পর্কে পরামর্শ দিন
5. উত্তর সংক্ষিপ্ত কিন্তু তথ্যপূর্ণ রাখুন (২-৩ বাক্য)
6. প্রয়োজনে টাকার পরিমাণ উল্লেখ করুন`;

    const userMessage = queriedCrop 
      ? `${query}\n\nবিস্তারিত: ${queriedCrop.emoji || ''} ${queriedCrop.name} - আজ ৳${queriedCrop.today}, গতকাল ৳${queriedCrop.yesterday}, সাপ্তাহিক গড় ৳${queriedCrop.weeklyAvg || queriedCrop.today}, পূর্বাভাস: ${queriedCrop.forecast === 'up' ? 'বাড়বে' : queriedCrop.forecast === 'down' ? 'কমবে' : 'স্থিতিশীল'}`
      : query;

    console.log('Sending market query to Lovable AI:', userMessage.substring(0, 100));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
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
    const analysis = data.choices?.[0]?.message?.content || 'দুঃখিত, বিশ্লেষণ করতে পারছি না।';
    
    // Extract recommendation from analysis
    let recommendation = '';
    if (queriedCrop) {
      const change = queriedCrop.today - queriedCrop.yesterday;
      if (queriedCrop.forecast === 'up' && change >= 0) {
        recommendation = `${queriedCrop.emoji || '🌾'} ${queriedCrop.name} - অপেক্ষা করুন, দাম বাড়বে`;
      } else if (queriedCrop.forecast === 'down') {
        recommendation = `${queriedCrop.emoji || '🌾'} ${queriedCrop.name} - এখনই বিক্রি করুন`;
      } else {
        recommendation = `${queriedCrop.emoji || '🌾'} ${queriedCrop.name} - বাজার পর্যবেক্ষণ করুন`;
      }
    }

    console.log('Market AI response received successfully');

    return new Response(
      JSON.stringify({ 
        analysis,
        recommendation,
        confidence: queriedCrop?.confidence || 80,
        queriedCrop: queriedCrop?.name || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Market AI function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
