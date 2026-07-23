import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Layers, Sprout, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from '@/hooks/useLocation';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';
import { toast } from 'sonner';

const CROPS = ['rice', 'wheat', 'maize', 'potato', 'jute', 'tomato', 'vegetable'];
const CROP_BN: Record<string, string> = {
  rice: 'ধান', wheat: 'গম', maize: 'ভুট্টা', potato: 'আলু',
  jute: 'পাট', tomato: 'টমেটো', vegetable: 'সবজি',
};

export default function PrecisionFarmPage() {
  const nav = useNavigate();
  const { location } = useLocation();
  const { speak, isLoading: ttsLoading } = useElevenLabsTTS();

  // Irrigation state
  const [crop, setCrop] = useState('rice');
  const [soilType, setSoilType] = useState<'sandy' | 'loam' | 'clay'>('loam');
  const [moisture, setMoisture] = useState(0.25);
  const [irrLoading, setIrrLoading] = useState(false);
  const [irr, setIrr] = useState<any>(null);

  // VRF state
  const [vrfCrop, setVrfCrop] = useState('rice');
  const [meanNdvi, setMeanNdvi] = useState(0.55);
  const [areaHa, setAreaHa] = useState(1);
  const [gridSize, setGridSize] = useState(3);
  const [vrfLoading, setVrfLoading] = useState(false);
  const [vrf, setVrf] = useState<any>(null);

  const runIrrigation = async () => {
    if (!location) return toast.error('অবস্থান লোড হচ্ছে...');
    setIrrLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('irrigation-forecast', {
        body: { latitude: location.latitude, longitude: location.longitude, crop, soilType, currentMoisture: moisture, days: 7 },
      });
      if (error) throw error;
      setIrr(data);
    } catch (e: any) {
      toast.error('পূর্বাভাস আনতে ব্যর্থ');
    } finally { setIrrLoading(false); }
  };

  const runVRF = async () => {
    setVrfLoading(true);
    try {
      const perZone = areaHa / (gridSize * gridSize);
      const { data, error } = await supabase.functions.invoke('vrf-map', {
        body: { crop: vrfCrop, meanNdvi, gridSize, zones: undefined,
          // per-zone area override via meta trick: send zones with area
        },
      });
      if (error) throw error;
      // scale totals by user area
      const scaled = { ...data, zones: data.zones.map((z: any) => ({
        ...z, areaHa: perZone,
        N_kg_total: Math.round(z.N_kg_ha * perZone * 10) / 10,
        P_kg_total: Math.round(z.P_kg_ha * perZone * 10) / 10,
        K_kg_total: Math.round(z.K_kg_ha * perZone * 10) / 10,
      })) };
      const t = scaled.zones.reduce((a: any, z: any) => ({
        N: a.N + z.N_kg_total, P: a.P + z.P_kg_total, K: a.K + z.K_kg_total,
      }), { N: 0, P: 0, K: 0 });
      scaled.totals = { ...scaled.totals, ...t, area_ha: areaHa };
      setVrf(scaled);
    } catch (e: any) {
      toast.error('VRF ম্যাপ তৈরি ব্যর্থ');
    } finally { setVrfLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => nav(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">প্রিসিশন ফার্ম</h1>
          <p className="text-xs text-muted-foreground">সেচ পূর্বাভাস + পরিবর্তনশীল হারে সার ম্যাপ</p>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="irrigation">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="irrigation"><Droplets className="w-4 h-4 mr-1" />সেচ পূর্বাভাস</TabsTrigger>
            <TabsTrigger value="vrf"><Layers className="w-4 h-4 mr-1" />VRF ম্যাপ</TabsTrigger>
          </TabsList>

          {/* ─── Irrigation ─── */}
          <TabsContent value="irrigation" className="space-y-4 mt-4">
            <Card className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>ফসল</Label>
                  <select value={crop} onChange={(e) => setCrop(e.target.value)}
                    className="w-full mt-1 rounded-md bg-background border border-border px-2 py-2 text-sm">
                    {CROPS.map(c => <option key={c} value={c}>{CROP_BN[c] || c}</option>)}
                  </select>
                </div>
                <div>
                  <Label>মাটির ধরন</Label>
                  <select value={soilType} onChange={(e) => setSoilType(e.target.value as any)}
                    className="w-full mt-1 rounded-md bg-background border border-border px-2 py-2 text-sm">
                    <option value="sandy">বেলে</option>
                    <option value="loam">দোআঁশ</option>
                    <option value="clay">এঁটেল</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>বর্তমান মাটির আর্দ্রতা: {(moisture * 100).toFixed(0)}%</Label>
                <input type="range" min={0.05} max={0.5} step={0.01} value={moisture}
                  onChange={(e) => setMoisture(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-primary" />
              </div>
              <Button onClick={runIrrigation} disabled={irrLoading} className="w-full">
                {irrLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />পূর্বাভাস তৈরি হচ্ছে...</> : '৭ দিনের পূর্বাভাস দিন'}
              </Button>
            </Card>

            {irr && (
              <Card className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground flex-1">{irr.summary_bn}</p>
                  <Button size="icon" variant="ghost" onClick={() => speak(irr.summary_bn, 'bn')} disabled={ttsLoading}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">মডেল: {irr.model}</div>
                <div className="space-y-2">
                  {irr.forecast.map((d: any) => (
                    <div key={d.date} className="flex items-center justify-between text-xs p-2 rounded bg-muted/40">
                      <div className="font-medium">{d.date}</div>
                      <div className="flex-1 mx-3 h-2 rounded bg-background overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${d.availablePct}%` }} />
                      </div>
                      <div className="w-14 text-right">{d.availablePct}%</div>
                      <div className={`w-24 text-right ${d.stress ? 'text-red-500' : 'text-green-500'}`}>
                        {d.irrigationMm > 0 ? `${d.irrigationMm} মিমি` : d.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* ─── VRF Map ─── */}
          <TabsContent value="vrf" className="space-y-4 mt-4">
            <Card className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>ফসল</Label>
                  <select value={vrfCrop} onChange={(e) => setVrfCrop(e.target.value)}
                    className="w-full mt-1 rounded-md bg-background border border-border px-2 py-2 text-sm">
                    {CROPS.map(c => <option key={c} value={c}>{CROP_BN[c] || c}</option>)}
                  </select>
                </div>
                <div>
                  <Label>জমির আকার (হেক্টর)</Label>
                  <Input type="number" step="0.1" min="0.1" value={areaHa}
                    onChange={(e) => setAreaHa(parseFloat(e.target.value) || 1)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>গড় NDVI (ড্রোন/স্যাটেলাইট): {meanNdvi.toFixed(2)}</Label>
                <input type="range" min={0.2} max={0.85} step={0.01} value={meanNdvi}
                  onChange={(e) => setMeanNdvi(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-primary" />
              </div>
              <div>
                <Label>গ্রিড সাইজ: {gridSize}×{gridSize}</Label>
                <input type="range" min={2} max={5} step={1} value={gridSize}
                  onChange={(e) => setGridSize(parseInt(e.target.value))}
                  className="w-full mt-2 accent-primary" />
              </div>
              <Button onClick={runVRF} disabled={vrfLoading} className="w-full">
                {vrfLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />ম্যাপ তৈরি হচ্ছে...</> : 'VRF ম্যাপ তৈরি করুন'}
              </Button>
            </Card>

            {vrf && (
              <Card className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground flex-1">{vrf.summary_bn}</p>
                  <Button size="icon" variant="ghost" onClick={() => speak(vrf.summary_bn, 'bn')} disabled={ttsLoading}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Field grid */}
                <div className="mx-auto" style={{ maxWidth: 360 }}>
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                    {vrf.zones.map((z: any) => (
                      <div key={z.id} className="aspect-square rounded p-1 flex flex-col items-center justify-center text-[10px] text-white font-medium"
                        style={{ backgroundColor: z.color }}>
                        <div>NDVI</div>
                        <div className="text-sm">{z.ndvi}</div>
                        <div className="opacity-90">N {z.N_kg_ha}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] mt-2 text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600" />দুর্বল</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />মাঝারি</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-lime-500" />ভালো</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600" />চমৎকার</span>
                  </div>
                </div>

                {/* Totals */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">নাইট্রোজেন</div>
                    <div className="text-lg font-bold">{vrf.totals.N} কেজি</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">ফসফরাস</div>
                    <div className="text-lg font-bold">{vrf.totals.P} কেজি</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">পটাশ</div>
                    <div className="text-lg font-bold">{vrf.totals.K} কেজি</div>
                  </div>
                </div>
                <div className="text-center text-xs bg-primary/10 rounded p-2 text-primary font-medium">
                  ইউনিফর্ম প্রয়োগের চেয়ে ~{vrf.savingsPct}% সার সাশ্রয়
                </div>

                {/* Per-zone advice */}
                <div className="space-y-1">
                  {vrf.zones.map((z: any) => (
                    <div key={z.id} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/40">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: z.color }} />
                      <div className="font-medium w-10">{z.id}</div>
                      <div className="flex-1">{z.advice_bn}</div>
                      <div className="text-muted-foreground">N {z.N_kg_ha} · P {z.P_kg_ha} · K {z.K_kg_ha}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground flex items-start gap-2">
          <Sprout className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p>সেচ ইঞ্জিন LSTM-অনুরূপ recurrent মডেল ও FAO-56 water balance ব্যবহার করে। VRF ম্যাপ ড্রোন/স্যাটেলাইট NDVI থেকে জোন-ভিত্তিক পুষ্টি ঘাটতি হিসাব করে।</p>
        </div>
      </div>
    </div>
  );
}
