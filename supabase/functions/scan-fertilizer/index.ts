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
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!imageBase64) {
      throw new Error('Image is required');
    }

    console.log('Analyzing fertilizer packet image...');

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
            content: `আপনি একজন বাংলাদেশী সার বিশেষজ্ঞ AI। আপনার কাজ হলো সারের প্যাকেটের ছবি বিশ্লেষণ করে রিপোর্ট দেওয়া।

আপনাকে অবশ্যই নিম্নলিখিত JSON ফরম্যাটে উত্তর দিতে হবে:

{
  "isAuthentic": true/false,
  "authenticityConfidence": 0-100,
  "brandName": "ব্র্যান্ডের নাম",
  "productName": "পণ্যের নাম", 
  "manufacturer": "উৎপাদনকারী কোম্পানি",
  "expiryDate": "মেয়াদ উত্তীর্ণের তারিখ বা 'পাওয়া যায়নি'",
  "isExpired": true/false/null,
  "composition": "সারের উপাদান (N-P-K ইত্যাদি)",
  "recommendedDose": "প্রস্তাবিত মাত্রা",
  "suitableCrops": ["উপযুক্ত ফসলের তালিকা"],
  "warnings": ["সতর্কতা বা সন্দেহজনক বিষয়গুলি"],
  "fakeIndicators": ["ভেজাল/নকল হওয়ার লক্ষণ (যদি থাকে)"],
  "recommendation": "কৃষকের জন্য সুপারিশ",
  "summary": "সংক্ষিপ্ত বিবরণ"
}

বিশ্লেষণে যা দেখবেন:
1. বাংলাদেশ স্ট্যান্ডার্ডস এন্ড টেস্টিং ইনস্টিটিউশন (BSTI) এর চিহ্ন
2. সঠিক বাংলা ও ইংরেজি বানান
3. উৎপাদন ও মেয়াদ তারিখ
4. ব্যাচ নম্বর
5. প্রিন্টের গুণমান
6. প্যাকেজিং এর মান
7. সঠিক কোম্পানির ঠিকানা ও যোগাযোগ

সাধারণ ভেজাল লক্ষণ:
- অস্পষ্ট প্রিন্ট
- বানান ভুল
- BSTI চিহ্ন নেই
- অসম রং
- মেয়াদ তারিখ নেই

শুধুমাত্র JSON ফরম্যাটে উত্তর দিন, অন্য কিছু লিখবেন না।` 
          },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: 'এই সারের প্যাকেটটি বিশ্লেষণ করুন। এটি আসল নাকি নকল, মেয়াদ, এবং সঠিক মাত্রা জানান।'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          },
        ],
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
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    console.log('AI response received:', aiResponse);

    // Parse JSON from response
    let analysisResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a default structure if parsing fails
      analysisResult = {
        isAuthentic: null,
        authenticityConfidence: 0,
        brandName: "বিশ্লেষণ করা যায়নি",
        productName: "বিশ্লেষণ করা যায়নি",
        manufacturer: "অজানা",
        expiryDate: "পাওয়া যায়নি",
        isExpired: null,
        composition: "বিশ্লেষণ করা যায়নি",
        recommendedDose: "প্যাকেটের নির্দেশনা দেখুন",
        suitableCrops: [],
        warnings: ["ছবিটি পরিষ্কার নয়, আবার চেষ্টা করুন"],
        fakeIndicators: [],
        recommendation: "ভালো আলোতে আবার ছবি তুলুন",
        summary: "ছবি বিশ্লেষণ করা সম্ভব হয়নি। অনুগ্রহ করে আরো পরিষ্কার ছবি দিন।"
      };
    }

    return new Response(
      JSON.stringify({ result: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scan fertilizer function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
