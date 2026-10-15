import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClimateDataRequest {
  latitude: number;
  longitude: number;
  days?: number;
}

const NASA_FILL = -999;
const isValid = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v !== NASA_FILL;

const toYmd = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
const toCompact = (d: Date) => toYmd(d).replace(/-/g, '');

type Series = Record<string, number | null>;
interface ParamSet {
  T2M: Series; T2M_MAX: Series; T2M_MIN: Series;
  PRECTOTCORR: Series; RH2M: Series; WS2M: Series;
  ALLSKY_SFC_SW_DWN: Series; T2MDEW: Series; PS: Series;
}

const emptySet = (): ParamSet => ({
  T2M: {}, T2M_MAX: {}, T2M_MIN: {}, PRECTOTCORR: {}, RH2M: {}, WS2M: {}, ALLSKY_SFC_SW_DWN: {}, T2MDEW: {}, PS: {},
});

async function fetchNasaPower(lat: number, lng: number, startStr: string, endStr: string) {
  const params = ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR', 'RH2M', 'WS2M', 'ALLSKY_SFC_SW_DWN', 'T2MDEW', 'PS'];
  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params.join(',')}&community=AG&longitude=${lng}&latitude=${lat}&start=${startStr}&end=${endStr}&format=JSON`;
  const response = await fetch(url, { headers: { 'User-Agent': 'AgriShokti-Bangla/1.0' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`NASA POWER ${response.status}`);
  const json = await response.json();
  const param = json?.properties?.parameter;
  if (!param) throw new Error('NASA POWER returned no parameters');
  const out = emptySet();
  for (const key of params) {
    const series = param[key] ?? {};
    for (const [date, raw] of Object.entries(series)) {
      (out as any)[key][date] = isValid(raw as number) ? (raw as number) : null;
    }
  }
  return { paramData: out, geometry: json.geometry, elevation: param.ELEV ?? null, timezone: param.TZ ?? null };
}

async function fetchOpenMeteoArchive(lat: number, lng: number, startDate: Date, endDate: Date) {
  const q = new URLSearchParams({
    latitude: String(lat), longitude: String(lng),
    start_date: toYmd(startDate), end_date: toYmd(endDate),
    daily: 'temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max,shortwave_radiation_sum,dew_point_2m_mean,surface_pressure_mean',
    timezone: 'Asia/Dhaka',
    wind_speed_unit: 'ms',
  });
  const response = await fetch(`https://archive-api.open-meteo.com/v1/archive?${q}`, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);
  const json = await response.json();
  const daily = json?.daily; if (!daily?.time) throw new Error('Open-Meteo returned no daily');
  const out = emptySet();
  daily.time.forEach((isoDate: string, i: number) => {
    const d = isoDate.replace(/-/g, '');
    const num = (arr: number[] | undefined) => isValid(arr?.[i] as number) ? (arr![i] as number) : null;
    out.T2M[d] = num(daily.temperature_2m_mean);
    out.T2M_MAX[d] = num(daily.temperature_2m_max);
    out.T2M_MIN[d] = num(daily.temperature_2m_min);
    out.PRECTOTCORR[d] = num(daily.precipitation_sum);
    out.RH2M[d] = num(daily.relative_humidity_2m_mean);
    out.WS2M[d] = num(daily.wind_speed_10m_max);
    out.ALLSKY_SFC_SW_DWN[d] = num(daily.shortwave_radiation_sum);
    out.T2MDEW[d] = num(daily.dew_point_2m_mean);
    const ps = daily.surface_pressure_mean?.[i];
    out.PS[d] = isValid(ps) ? ps / 10 : null; // hPa -> kPa
  });
  return { paramData: out, geometry: { coordinates: [json.longitude ?? lng, json.latitude ?? lat] }, elevation: json.elevation ?? null, timezone: 6 };
}

function latestValid(series: Series): { value: number | null; date: string | null } {
  const entries = Object.entries(series).sort(([a], [b]) => a.localeCompare(b));
  for (let i = entries.length - 1; i >= 0; i--) if (isValid(entries[i][1] as number)) return { value: entries[i][1] as number, date: entries[i][0] };
  return { value: null, date: null };
}
const avg = (s: Series) => { const v = Object.values(s).filter(isValid) as number[]; return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const sum = (s: Series) => { const v = Object.values(s).filter(isValid) as number[]; return v.length ? v.reduce((a, b) => a + b, 0) : null; };
function trend(s: Series): string {
  const v = Object.values(s).filter(isValid) as number[]; if (v.length < 4) return 'stable';
  const half = Math.floor(v.length / 2);
  const d = v.slice(half).reduce((a, b) => a + b, 0) / (v.length - half) - v.slice(0, half).reduce((a, b) => a + b, 0) / half;
  if (d > 1) return 'increasing'; if (d < -1) return 'decreasing'; return 'stable';
}
function lastRain(s: Series): string | null {
  const entries = Object.entries(s).sort(([a], [b]) => a.localeCompare(b));
  for (let i = entries.length - 1; i >= 0; i--) if (isValid(entries[i][1] as number) && (entries[i][1] as number) > 0.5) return entries[i][0];
  return null;
}

function recommendations(p: ParamSet): string[] {
  const r: string[] = [];
  const t = latestValid(p.T2M).value; const rain = sum(p.PRECTOTCORR) ?? 0; const h = latestValid(p.RH2M).value;
  if (t !== null && t > 35) r.push('উচ্চ তাপমাত্রা — ঘন ঘন সেচ দিন ও মালচিং করুন');
  else if (t !== null && t < 15) r.push('নিম্ন তাপমাত্রা — শীতকালীন ফসলের উপযুক্ত সময়');
  if (rain < 10) r.push('কম বৃষ্টিপাত — সেচ নিশ্চিত করুন');
  else if (rain > 200) r.push('অতিরিক্ত বৃষ্টি — নিষ্কাশন পরীক্ষা করুন');
  if (h !== null && h > 85) r.push('উচ্চ আর্দ্রতা — ছত্রাক রোগের জন্য সতর্ক থাকুন');
  else if (h !== null && h < 40) r.push('কম আর্দ্রতা — মাটির পানি ধারণ ক্ষমতা বাড়ান');
  if (!lastRain(p.PRECTOTCORR)) r.push('দীর্ঘদিন বৃষ্টি হয়নি — খরা প্রস্তুতি নিন');
  return r;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { latitude, longitude, days = 30 }: ClimateDataRequest = await req.json();
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error('Invalid coordinates');
    }
    const endDate = new Date(); const startDate = new Date(); startDate.setUTCDate(endDate.getUTCDate() - days);

    const sources: Array<{ source: string; attribution: string; status: 'ok' | 'failed' | 'empty'; detail?: string }> = [];
    let paramData: ParamSet | null = null; let geometry: any = null; let elevation: number | null = null; let timezone: number | null = null; let primary = '';

    try {
      const nasa = await fetchNasaPower(latitude, longitude, toCompact(startDate), toCompact(endDate));
      const hasRecent = isValid(latestValid(nasa.paramData.T2M).value as any);
      sources.push({ source: 'NASA POWER (daily, AG community)', attribution: 'NASA Langley Research Center POWER Project', status: hasRecent ? 'ok' : 'empty', detail: hasRecent ? undefined : 'latest days returned fill value' });
      if (hasRecent) { paramData = nasa.paramData; geometry = nasa.geometry; elevation = nasa.elevation; timezone = nasa.timezone ?? 6; primary = 'NASA POWER'; }
    } catch (err) {
      sources.push({ source: 'NASA POWER (daily, AG community)', attribution: 'NASA Langley Research Center POWER Project', status: 'failed', detail: err instanceof Error ? err.message : String(err) });
    }

    if (!paramData) {
      try {
        const om = await fetchOpenMeteoArchive(latitude, longitude, startDate, endDate);
        sources.push({ source: 'Open-Meteo ERA5 Archive', attribution: 'Open-Meteo.com (CC BY 4.0), ECMWF ERA5', status: 'ok' });
        paramData = om.paramData; geometry = om.geometry; elevation = om.elevation; timezone = om.timezone; primary = 'Open-Meteo ERA5';
      } catch (err) {
        sources.push({ source: 'Open-Meteo ERA5 Archive', attribution: 'Open-Meteo.com (CC BY 4.0), ECMWF ERA5', status: 'failed', detail: err instanceof Error ? err.message : String(err) });
      }
    }

    if (!paramData) {
      return new Response(JSON.stringify({ success: false, error: 'All climate providers failed', provenance: { sources, requested_at: new Date().toISOString() } }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const temp = latestValid(paramData.T2M); const prec = sum(paramData.PRECTOTCORR); const trnd = trend(paramData.T2M);
    const processedData = {
      temperature: { current: temp.value, max: latestValid(paramData.T2M_MAX).value, min: latestValid(paramData.T2M_MIN).value, average: avg(paramData.T2M), trend: trnd, trend_bn: trnd === 'increasing' ? 'বৃদ্ধি পাচ্ছে' : trnd === 'decreasing' ? 'হ্রাস পাচ্ছে' : 'স্থিতিশীল', observation_date: temp.date },
      precipitation: { total: prec, average: avg(paramData.PRECTOTCORR), last_rain_date: lastRain(paramData.PRECTOTCORR), trend: trend(paramData.PRECTOTCORR) },
      humidity: { current: latestValid(paramData.RH2M).value, average: avg(paramData.RH2M) },
      wind: { current: latestValid(paramData.WS2M).value, average: avg(paramData.WS2M) },
      solar: { current: latestValid(paramData.ALLSKY_SFC_SW_DWN).value, average: avg(paramData.ALLSKY_SFC_SW_DWN) },
      dewpoint: { current: latestValid(paramData.T2MDEW).value, average: avg(paramData.T2MDEW) },
      pressure: { current: latestValid(paramData.PS).value, average: avg(paramData.PS) },
      recommendations: recommendations(paramData),
      raw_data: paramData,
      metadata: {
        latitude: geometry?.coordinates?.[1] ?? latitude,
        longitude: geometry?.coordinates?.[0] ?? longitude,
        elevation, timezone: timezone ?? 6,
        source: primary,
        is_simulated: false,
        date_range: { start: toYmd(startDate), end: toYmd(endDate) },
        timestamp: new Date().toISOString(),
      },
      provenance: {
        primary_source: primary,
        sources,
        parameters: ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR', 'RH2M', 'WS2M', 'ALLSKY_SFC_SW_DWN', 'T2MDEW', 'PS'],
        fill_value: NASA_FILL,
        requested_at: new Date().toISOString(),
        notes: 'Fill values from NASA POWER are discarded; wind in m/s, pressure in kPa.',
      },
    };

    return new Response(JSON.stringify({ success: true, data: processedData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
