import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry configuration for transient errors
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callAIWithRetry(requestBody: any, apiKey: string, retries = 0): Promise<Response> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Retry on 5xx errors or network issues
    if (response.status >= 500 && retries < MAX_RETRIES) {
      console.log(`AI gateway returned ${response.status}, retrying (${retries + 1}/${MAX_RETRIES})...`);
      await sleep(RETRY_DELAY_MS * (retries + 1));
      return callAIWithRetry(requestBody, apiKey, retries + 1);
    }

    return response;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`Network error, retrying (${retries + 1}/${MAX_RETRIES})...`, error);
      await sleep(RETRY_DELAY_MS * (retries + 1));
      return callAIWithRetry(requestBody, apiKey, retries + 1);
    }
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'সার্ভার কনফিগারেশন ত্রুটি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'ছবি আপলোড করুন' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate image format
    if (!imageBase64.startsWith('data:image/')) {
      return new Response(
        JSON.stringify({ error: 'অবৈধ ছবির ফরম্যাট। JPG, PNG বা WebP ছবি ব্যবহার করুন।' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing crop disease from image...');

    const requestBody = {
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
    };

    const response = await callAIWithRetry(requestBody, LOVABLE_API_KEY);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'সার্ভার ব্যস্ত। ১০ সেকেন্ড পর আবার চেষ্টা করুন।' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI সার্ভিস সাময়িকভাবে অনুপলব্ধ। পরে আবার চেষ্টা করুন।' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status >= 500) {
        return new Response(
          JSON.stringify({ error: 'সার্ভারে সাময়িক সমস্যা হয়েছে। কয়েক সেকেন্ড পর আবার চেষ্টা করুন।' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    console.log('AI response received, length:', aiResponse.length);

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
      console.error('Raw response:', aiResponse.substring(0, 500));

      analysisResult = {
        diseaseName: "বিশ্লেষণে সমস্যা",
        confidence: 0,
        cropType: "অজানা",
        severity: "unknown",
        symptoms: ["ছবি বিশ্লেষণ করা যায়নি"],
        causes: [],
        treatment: "পরিষ্কার ছবি দিয়ে আবার চেষ্টা করুন",
        preventiveMeasures: ["পাতা বা আক্রান্ত অংশ কাছ থেকে ছবি তুলুন"],
        fertilizer: "বিশ্লেষণ করা যায়নি",
        irrigation: "বিশ্লেষণ করা যায়নি",
        organicSolution: "",
        chemicalSolution: "",
        expectedRecoveryDays: 0,
        yieldImpact: "অজানা",
        isHealthy: null,
        additionalNotes: "ভালো আলোতে পরিষ্কার ছবি তুলে আবার চেষ্টা করুন। আক্রান্ত পাতা বা অংশ কাছ থেকে ফোকাস করুন।"
      };
    }

    return new Response(
      JSON.stringify({ result: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Detect disease function error:', error);

    // Provide user-friendly error message
    const errorMessage = error instanceof Error
      ? (error.message.includes('fetch') || error.message.includes('network')
        ? 'নেটওয়ার্ক সমস্যা হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।'
        : 'সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।')
      : 'অজানা ত্রুটি হয়েছে।';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
