import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface PredictInput {
  crop: string;
  areaHectares?: number;
  latitude?: number;
  longitude?: number;
  ndvi?: number;
  rainfallMm?: number;
  avgTempC?: number;
  humidity?: number;
  irrigation?: 'low' | 'normal' | 'high';
  fertilizerTiming?: 'early' | 'onTime' | 'late';
  scenarioLabel?: string;
}

// Rough baseline yield (ton/hectare) for common Bangladesh crops
const BASE_YIELD: Record<string, { min: number; max: number; label: string }> = {
  rice: { min: 3.5, max: 5.5, label: 'ধান' },
  wheat: { min: 2.5, max: 4.0, label: 'গম' },
  maize: { min: 6.0, max: 9.0, label: 'ভুট্টা' },
  jute: { min: 2.0, max: 3.0, label: 'পাট' },
  potato: { min: 18, max: 28, label: 'আলু' },
  onion: { min: 10, max: 15, label: 'পেঁয়াজ' },
  tomato: { min: 20, max: 35, label: 'টমেটো' },
  mustard: { min: 1.0, max: 1.6, label: 'সরিষা' },
  lentil: { min: 1.0, max: 1.5, label: 'মসুর' },
  sugarcane: { min: 40, max: 60, label: 'আখ' },
};

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function computePrediction(input: PredictInput) {
  const cropKey = input.crop.toLowerCase();
  const base = BASE_YIELD[cropKey] || { min: 2.5, max: 4.5, label: input.crop };

  const reasons: string[] = [];
  let mult = 1.0;
  let confidence = 65;

  // NDVI signal
  if (typeof input.ndvi === 'number') {
    const ndvi = clamp(input.ndvi, 0, 1);
    const ndviMult = 0.7 + ndvi * 0.6; // 0.7–1.3
    mult *= ndviMult;
    confidence += 10;
    if (ndvi >= 0.6) reasons.push(`স্যাটেলাইটে সবুজতা (NDVI ${ndvi.toFixed(2)}) ভালো — ফসল সুস্থ।`);
    else if (ndvi >= 0.4) reasons.push(`NDVI ${ndvi.toFixed(2)} — মাঝারি সবুজতা, যত্ন বাড়ানো দরকার।`);
    else reasons.push(`NDVI ${ndvi.toFixed(2)} কম — ফসলে চাপ বা পানির অভাব থাকতে পারে।`);
  }

  // Rainfall (mm over season)
  if (typeof input.rainfallMm === 'number') {
    const r = input.rainfallMm;
    if (r < 200) { mult *= 0.85; reasons.push(`মৌসুমি বৃষ্টি কম (${Math.round(r)} মিমি) — সেচ প্রয়োজন।`); }
    else if (r > 1200) { mult *= 0.9; reasons.push(`অতিবৃষ্টি (${Math.round(r)} মিমি) — জলাবদ্ধতার ঝুঁকি।`); }
    else { mult *= 1.05; reasons.push(`বৃষ্টিপাত অনুকূল (${Math.round(r)} মিমি)।`); }
    confidence += 8;
  }

  // Temperature
  if (typeof input.avgTempC === 'number') {
    const t = input.avgTempC;
    if (t < 18 || t > 34) { mult *= 0.9; reasons.push(`গড় তাপমাত্রা ${t.toFixed(1)}°C — ফসলের জন্য প্রতিকূল।`); }
    else { mult *= 1.03; reasons.push(`তাপমাত্রা ${t.toFixed(1)}°C — বৃদ্ধির জন্য উপযোগী।`); }
    confidence += 7;
  }

  // Irrigation adjustment
  if (input.irrigation === 'high') { mult *= 1.06; reasons.push('বাড়তি সেচ — উৎপাদন কিছুটা বাড়বে।'); }
  else if (input.irrigation === 'low') { mult *= 0.92; reasons.push('কম সেচ — উৎপাদন কমতে পারে।'); }

  // Fertilizer timing
  if (input.fertilizerTiming === 'onTime') { mult *= 1.05; reasons.push('সময়মতো সার প্রয়োগ — ফলন বাড়াবে।'); }
  else if (input.fertilizerTiming === 'late') { mult *= 0.9; reasons.push('দেরিতে সার প্রয়োগ — ফলন কমতে পারে।'); }

  confidence = clamp(confidence, 50, 92);

  const min = +(base.min * mult).toFixed(2);
  const max = +(base.max * mult).toFixed(2);
  const avg = +(((min + max) / 2)).toFixed(2);

  const totalAvg = input.areaHectares ? +(avg * input.areaHectares).toFixed(2) : null;

  const reasoning_bn = [
    `${base.label} ফসলের জন্য প্রাথমিক অনুমান: ${min}–${max} টন/হেক্টর।`,
    ...reasons,
    input.areaHectares
      ? `আপনার ${input.areaHectares} হেক্টর জমিতে মোট আনুমানিক ফলন প্রায় ${totalAvg} টন।`
      : '',
    `আত্মবিশ্বাসের মাত্রা প্রায় ${confidence}%। NDVI ও আবহাওয়ার আরও তথ্য থাকলে অনুমান আরও নিখুঁত হবে।`,
  ].filter(Boolean).join(' ');

  return { min, max, avg, unit: 'ton/hectare', confidence, reasoning_bn, totalAvg };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as PredictInput;
    if (!body?.crop) {
      return new Response(JSON.stringify({ error: 'crop is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const result = computePrediction(body);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[predict-yield] error', err);
    return new Response(JSON.stringify({ error: 'Prediction failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
