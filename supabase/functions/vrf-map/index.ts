// Variable-Rate Fertilizer (VRF) Map generator
// Input: field polygon center + NDVI zone stats (or synthesized grid from mean NDVI)
// Output: per-zone N/P/K application rate map based on NDVI-driven vigor deficit.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface ZoneIn { id?: string; ndvi: number; areaHa?: number }
interface Body {
  crop?: string;
  targetYieldTHa?: number;
  baseRateKgHa?: { N: number; P: number; K: number };
  zones?: ZoneIn[];
  meanNdvi?: number;   // if zones absent, auto-generate 3x3 grid around mean
  gridSize?: number;   // default 3
}

const CROP_UPTAKE: Record<string, { N: number; P: number; K: number }> = {
  rice:  { N: 120, P: 30, K: 60 },
  wheat: { N: 110, P: 30, K: 40 },
  maize: { N: 150, P: 40, K: 60 },
  potato:{ N: 140, P: 60, K: 120 },
  jute:  { N: 80,  P: 20, K: 40 },
  vegetable: { N: 100, P: 40, K: 80 },
  other: { N: 100, P: 30, K: 50 },
};

function zoneClass(ndvi: number) {
  if (ndvi < 0.3) return { label: 'দুর্বল', color: '#dc2626', factor: 1.35 };
  if (ndvi < 0.5) return { label: 'মাঝারি', color: '#f59e0b', factor: 1.15 };
  if (ndvi < 0.7) return { label: 'ভালো', color: '#84cc16', factor: 0.95 };
  return { label: 'চমৎকার', color: '#16a34a', factor: 0.75 };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body: Body = await req.json();
    const crop = body.crop ?? 'rice';
    const uptake = CROP_UPTAKE[crop] ?? CROP_UPTAKE.other;
    const base = body.baseRateKgHa ?? uptake;
    const yieldFactor = body.targetYieldTHa ? Math.max(0.6, Math.min(1.4, body.targetYieldTHa / 5)) : 1;

    let zones: ZoneIn[] = body.zones ?? [];
    if (!zones.length) {
      const mean = body.meanNdvi ?? 0.55;
      const n = body.gridSize ?? 3;
      zones = Array.from({ length: n * n }, (_, i) => {
        // Simulate spatial variability around the mean NDVI
        const jitter = ((i * 37) % 100) / 100 - 0.5;
        return { id: `z${i + 1}`, ndvi: Math.max(0.15, Math.min(0.9, mean + jitter * 0.35)), areaHa: 0.1 };
      });
    }

    const map = zones.map((z) => {
      const cls = zoneClass(z.ndvi);
      const N = Math.round(base.N * cls.factor * yieldFactor);
      const P = Math.round(base.P * (0.9 + (1 - cls.factor) * 0.4) * yieldFactor);
      const K = Math.round(base.K * cls.factor * yieldFactor);
      const areaHa = z.areaHa ?? 0.1;
      return {
        id: z.id ?? crypto.randomUUID().slice(0, 6),
        ndvi: Number(z.ndvi.toFixed(3)),
        areaHa,
        class: cls.label,
        color: cls.color,
        N_kg_ha: N, P_kg_ha: P, K_kg_ha: K,
        N_kg_total: Math.round(N * areaHa * 10) / 10,
        P_kg_total: Math.round(P * areaHa * 10) / 10,
        K_kg_total: Math.round(K * areaHa * 10) / 10,
        advice_bn: cls.label === 'দুর্বল'
          ? 'বেশি সার দিন — গাছ দুর্বল, পুষ্টি ঘাটতি'
          : cls.label === 'মাঝারি'
          ? 'গড় হারে সার দিন'
          : cls.label === 'ভালো'
          ? 'হালকা সার — অপচয় এড়ান'
          : 'ন্যূনতম সার — মাটি ইতিমধ্যেই সমৃদ্ধ',
      };
    });

    const totals = map.reduce((a, z) => ({
      N: a.N + z.N_kg_total, P: a.P + z.P_kg_total, K: a.K + z.K_kg_total, area: a.area + z.areaHa,
    }), { N: 0, P: 0, K: 0, area: 0 });

    const uniform = { N: base.N * totals.area, P: base.P * totals.area, K: base.K * totals.area };
    const savingsPct = Math.max(0, Math.round((1 - (totals.N + totals.P + totals.K) / (uniform.N + uniform.P + uniform.K)) * 100));

    return new Response(JSON.stringify({
      success: true,
      crop,
      zones: map,
      totals: {
        N_kg: Math.round(totals.N * 10) / 10,
        P_kg: Math.round(totals.P * 10) / 10,
        K_kg: Math.round(totals.K * 10) / 10,
        area_ha: Math.round(totals.area * 100) / 100,
      },
      savingsPct,
      summary_bn: `${map.length} টি জোনে মোট N ${Math.round(totals.N)} কেজি, P ${Math.round(totals.P)} কেজি, K ${Math.round(totals.K)} কেজি। ইউনিফর্ম প্রয়োগের চেয়ে ~${savingsPct}% সাশ্রয়।`,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
