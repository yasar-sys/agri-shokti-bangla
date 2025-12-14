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
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!imageBase64) {
      throw new Error('Image is required');
    }

    console.log('Analyzing crop disease from image...');

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
            content: `আপনি একজন বাংলাদেশী কৃষি রোগ বিশেষজ্ঞ AI। আপনার কাজ হলো ফসলের পাতা বা গাছের ছবি বিশ্লেষণ করে রোগ নির্ণয় করা।

আপনাকে অবশ্যই নিম্নলিখিত JSON ফরম্যাটে উত্তর দিতে হবে:

{
  "diseaseName": "রোগের বাংলা নাম (ইংরেজি নামসহ)",
  "confidence": 0-100 (শতকরা নির্ভুলতা),
  "cropType": "ফসলের ধরন (ধান/গম/আলু/টমেটো ইত্যাদি)",
  "severity": "low/medium/high/critical",
  "symptoms": ["লক্ষণগুলির তালিকা - কমপক্ষে ৩-৪টি"],
  "causes": ["রোগের কারণ - কমপক্ষে ২-৩টি"],
  "treatment": "চিকিৎসা ও প্রতিকারের বিস্তারিত বিবরণ",
  "preventiveMeasures": ["প্রতিরোধমূলক ব্যবস্থা - কমপক্ষে ২-৩টি"],
  "fertilizer": "সার ব্যবস্থাপনার পরামর্শ",
  "irrigation": "সেচ ব্যবস্থাপনার পরামর্শ",
  "organicSolution": "জৈব/প্রাকৃতিক সমাধান (যদি থাকে)",
  "chemicalSolution": "রাসায়নিক সমাধান ও মাত্রা",
  "expectedRecoveryDays": "আনুমানিক সুস্থতার সময় (দিন)",
  "yieldImpact": "ফলনে প্রভাব (%)",
  "isHealthy": false,
  "additionalNotes": "অতিরিক্ত পরামর্শ"
}

যদি গাছ সুস্থ থাকে তাহলে:
{
  "diseaseName": "সুস্থ ফসল",
  "confidence": 90-100,
  "cropType": "ফসলের ধরন",
  "severity": "none",
  "symptoms": ["কোন রোগের লক্ষণ নেই"],
  "causes": [],
  "treatment": "কোন চিকিৎসার প্রয়োজন নেই",
  "preventiveMeasures": ["নিয়মিত পর্যবেক্ষণ করুন", "সুষম সার দিন"],
  "fertilizer": "স্বাভাবিক সার ব্যবস্থাপনা চালিয়ে যান",
  "irrigation": "প্রয়োজন অনুযায়ী সেচ দিন",
  "organicSolution": "জৈব সার ব্যবহার অব্যাহত রাখুন",
  "chemicalSolution": "প্রয়োজন নেই",
  "expectedRecoveryDays": 0,
  "yieldImpact": "০%",
  "isHealthy": true,
  "additionalNotes": "আপনার ফসল সুস্থ আছে!"
}

বাংলাদেশে প্রচলিত ফসলের রোগ যেমন:
- ধান: ব্লাস্ট, ব্রাউন স্পট, শিথ ব্লাইট, টুংরো, ব্যাক্টেরিয়াল লিফ ব্লাইট
- আলু: লেট ব্লাইট, আর্লি ব্লাইট, স্ক্যাব
- টমেটো: আর্লি ব্লাইট, মোজাইক ভাইরাস, ফিউজেরিয়াম উইল্ট
- বেগুন: ব্যাক্টেরিয়াল উইল্ট, ফ্রুট বোরার
- পেঁয়াজ: পার্পেল ব্লচ, স্টেমফাইলিয়াম ব্লাইট
- গম: পাতা ঝলসা, রাস্ট

শুধুমাত্র JSON ফরম্যাটে উত্তর দিন, অন্য কিছু লিখবেন না।` 
          },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: 'এই ফসলের ছবিটি বিশ্লেষণ করে রোগ নির্ণয় করুন। যদি সুস্থ থাকে সেটাও জানান।'
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
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      analysisResult = {
        diseaseName: "বিশ্লেষণ করা যায়নি",
        confidence: 0,
        cropType: "অজানা",
        severity: "unknown",
        symptoms: ["ছবি পরিষ্কার নয়"],
        causes: [],
        treatment: "অনুগ্রহ করে আবার চেষ্টা করুন",
        preventiveMeasures: [],
        fertilizer: "বিশ্লেষণ করা যায়নি",
        irrigation: "বিশ্লেষণ করা যায়নি",
        organicSolution: "",
        chemicalSolution: "",
        expectedRecoveryDays: 0,
        yieldImpact: "অজানা",
        isHealthy: null,
        additionalNotes: "পরিষ্কার ছবি দিয়ে আবার চেষ্টা করুন"
      };
    }

    return new Response(
      JSON.stringify({ result: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Detect disease function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
