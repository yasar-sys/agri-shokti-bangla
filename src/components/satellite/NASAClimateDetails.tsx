import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Thermometer, CloudRain, Droplets, Sun, Wind, ArrowUpRight, ArrowDownRight, Minus, Download, Database } from 'lucide-react';

interface NASAClimateDetailsProps {
  data: any;
  loading: boolean;
}

const num = (v: unknown, digits = 1): string | null =>
  typeof v === 'number' && Number.isFinite(v) && v !== -999 ? v.toFixed(digits) : null;

const formatYmd = (d?: string | null) => d && /^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d || null;

export const NASAClimateDetails: React.FC<NASAClimateDetailsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
        {[1, 2, 3, 4, 5].map(i => <Card key={i} className="h-28 animate-pulse" />)}
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="mt-8 p-5 text-sm text-muted-foreground">
        জলবায়ু তথ্য এখন পাওয়া যাচ্ছে না। কোনো অনুমানভিত্তিক মান দেখানো হচ্ছে না; পরে আবার চেষ্টা করুন।
      </Card>
    );
  }

  const windKmh = typeof data.wind?.current === 'number' ? data.wind.current * 3.6 : null;
  const windAvgKmh = typeof data.wind?.average === 'number' ? data.wind.average * 3.6 : null;
  const obsDate = formatYmd(data.temperature?.observation_date);

  const metrics = [
    { label: 'তাপমাত্রা', value: num(data.temperature?.current), unit: '°C', sub: num(data.temperature?.min) && num(data.temperature?.max) ? `সর্বনিম্ন ${num(data.temperature.min)}° · সর্বোচ্চ ${num(data.temperature.max)}°` : null, icon: Thermometer, trend: data.temperature?.trend },
    { label: 'বৃষ্টিপাত (মোট)', value: num(data.precipitation?.total), unit: 'mm', sub: data.precipitation?.last_rain_date ? `শেষ বৃষ্টি: ${formatYmd(data.precipitation.last_rain_date)}` : 'এই সময়ে উল্লেখযোগ্য বৃষ্টি নেই', icon: CloudRain, trend: data.precipitation?.trend },
    { label: 'আর্দ্রতা', value: num(data.humidity?.current, 0), unit: '%', sub: num(data.humidity?.average, 0) ? `গড়: ${num(data.humidity.average, 0)}%` : null, icon: Droplets },
    { label: 'সৌর বিকিরণ', value: num(data.solar?.current), unit: 'MJ/m²/দিন', sub: num(data.solar?.average) ? `গড়: ${num(data.solar.average)}` : null, icon: Sun },
    { label: 'বাতাস', value: num(windKmh), unit: 'km/h', sub: num(windAvgKmh) ? `গড়: ${num(windAvgKmh)} km/h` : null, icon: Wind },
  ];

  const trendIcon = (t?: string) => t === 'increasing' ? <ArrowUpRight className="w-3.5 h-3.5 text-destructive" /> : t === 'decreasing' ? <ArrowDownRight className="w-3.5 h-3.5 text-primary" /> : <Minus className="w-3.5 h-3.5 text-muted-foreground" />;

  const provenance = data.provenance;
  const downloadProvenance = () => {
    const file = {
      schema: 'agrishokti.climate-cache/v1',
      exported_at: new Date().toISOString(),
      location: { latitude: data.metadata?.latitude, longitude: data.metadata?.longitude, elevation_m: data.metadata?.elevation },
      date_range: data.metadata?.date_range,
      latest_observation_date: obsDate,
      cache: data.cache ?? { hit: false, cached_at: data.metadata?.timestamp },
      provenance,
      units: { T2M: '°C', PRECTOTCORR: 'mm/day', RH2M: '%', WS2M: 'm/s', ALLSKY_SFC_SW_DWN: 'MJ/m²/day', T2MDEW: '°C', PS: 'kPa' },
      summary: { temperature: data.temperature, precipitation: data.precipitation, humidity: data.humidity, wind: data.wind, solar: data.solar },
      daily: data.raw_data,
    };
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrishokti-climate-provenance-${data.metadata?.date_range?.end ?? 'latest'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">জলবায়ু বিশ্লেষণ · গত ৩০ দিন</h2>
          <p className="text-xs text-muted-foreground">
            উৎস: {data.metadata?.source || 'অজানা'}{obsDate ? ` · সর্বশেষ যাচাইকৃত দিন ${obsDate}` : ''}{data.cache?.hit ? ' · ডিভাইস ক্যাশ থেকে' : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadProvenance} className="min-h-11">
          <Download className="w-4 h-4 mr-2" /> প্রুভেন্যান্স JSON
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {metrics.map(m => (
          <Card key={m.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <m.icon className="w-5 h-5 text-primary" />
              {m.trend && trendIcon(m.trend)}
            </div>
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="font-mono text-2xl font-semibold tracking-tight">
              {m.value ?? '—'} {m.value && <span className="text-xs font-normal text-muted-foreground">{m.unit}</span>}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">{m.value ? m.sub : 'তথ্য পাওয়া যায়নি'}</p>
          </Card>
        ))}
      </div>

      {provenance?.sources?.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">তথ্যের উৎস যাচাই</h3>
          </div>
          <ul className="space-y-1.5 text-xs">
            {provenance.sources.map((s: any) => (
              <li key={s.source} className="flex flex-wrap items-center gap-2">
                <Badge variant={s.status === 'ok' ? 'default' : 'outline'} className="text-[10px]">{s.status === 'ok' ? 'ব্যবহৃত' : s.status === 'empty' ? 'খালি' : 'ব্যর্থ'}</Badge>
                <span className="font-medium">{s.source}</span>
                <span className="text-muted-foreground">— {s.attribution}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {data.recommendations?.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-2">তথ্যভিত্তিক সতর্কতা</h3>
          <ul className="grid gap-2 md:grid-cols-2 text-sm">
            {data.recommendations.map((r: string) => <li key={r} className="border-l-2 border-primary pl-3">{r}</li>)}
          </ul>
        </Card>
      )}
    </div>
  );
};
