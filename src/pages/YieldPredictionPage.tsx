import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Sprout,
  Loader2,
  Volume2,
  VolumeX,
  Save,
  History as HistoryIcon,
  TrendingUp,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocation } from "@/hooks/useLocation";
import { useWeather } from "@/hooks/useWeather";
import { useElevenLabsTTS } from "@/hooks/useElevenLabsTTS";

interface ScenarioInputs {
  irrigation: "low" | "normal" | "high";
  fertilizerTiming: "early" | "onTime" | "late";
  ndvi: number;
}

interface PredictionResult {
  min: number;
  max: number;
  avg: number;
  unit: string;
  confidence: number;
  reasoning_bn: string;
  totalAvg: number | null;
}

interface HistoryRow {
  id: string;
  crop_name: string;
  field_name: string | null;
  estimated_yield_min: number;
  estimated_yield_max: number;
  estimated_yield_avg: number;
  yield_unit: string;
  confidence: number;
  reasoning_bn: string | null;
  scenario_label: string | null;
  created_at: string;
}

const CROPS = [
  { key: "rice", label: "ধান 🌾" },
  { key: "wheat", label: "গম 🌾" },
  { key: "maize", label: "ভুট্টা 🌽" },
  { key: "jute", label: "পাট 🌿" },
  { key: "potato", label: "আলু 🥔" },
  { key: "onion", label: "পেঁয়াজ 🧅" },
  { key: "tomato", label: "টমেটো 🍅" },
  { key: "mustard", label: "সরিষা 🌼" },
  { key: "lentil", label: "মসুর 🫘" },
  { key: "sugarcane", label: "আখ 🎋" },
];

const defaultScenario = (): ScenarioInputs => ({
  irrigation: "normal",
  fertilizerTiming: "onTime",
  ndvi: 0.55,
});

async function callPredict(input: any): Promise<PredictionResult> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-yield`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Predict failed");
  return res.json();
}

export default function YieldPredictionPage() {
  const [crop, setCrop] = useState("rice");
  const [fieldName, setFieldName] = useState("");
  const [area, setArea] = useState<number>(1);
  const [scenarioA, setScenarioA] = useState<ScenarioInputs>(defaultScenario());
  const [scenarioB, setScenarioB] = useState<ScenarioInputs>({
    ...defaultScenario(),
    irrigation: "high",
    fertilizerTiming: "onTime",
  });
  const [resultA, setResultA] = useState<PredictionResult | null>(null);
  const [resultB, setResultB] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const location = useLocation();
  const weather = useWeather(location.latitude, location.longitude);
  const { speak, stop, isSpeaking, isLoading: ttsLoading } = useElevenLabsTTS();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    (supabase as any)
      .from("yield_predictions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }: any) => setHistory(data || []));
  }, [userId]);

  const rainfallMm = 800;
  const avgTempC = weather?.temp ?? 28;
  const humidity = weather?.humidity ?? 70;

  const runPrediction = async () => {
    setLoading(true);
    try {
      const common = {
        crop,
        areaHectares: area,
        latitude: location.latitude,
        longitude: location.longitude,
        rainfallMm,
        avgTempC,
        humidity,
      };
      const [a, b] = await Promise.all([
        callPredict({ ...common, ...scenarioA, scenarioLabel: "বর্তমান পদ্ধতি" }),
        callPredict({ ...common, ...scenarioB, scenarioLabel: "উন্নত পদ্ধতি" }),
      ]);
      setResultA(a);
      setResultB(b);
    } catch (e) {
      console.error(e);
      toast.error("ফলন অনুমান করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  const savePrediction = async (result: PredictionResult, scenarioLabel: string, scenarioInputs: ScenarioInputs) => {
    if (!userId) {
      toast.error("লগইন করুন");
      return;
    }
    const { error } = await (supabase as any).from("yield_predictions").insert({
      user_id: userId,
      crop_name: crop,
      field_name: fieldName || null,
      latitude: location.latitude ?? null,
      longitude: location.longitude ?? null,
      area_hectares: area,
      estimated_yield_min: result.min,
      estimated_yield_max: result.max,
      estimated_yield_avg: result.avg,
      yield_unit: result.unit,
      confidence: result.confidence,
      reasoning_bn: result.reasoning_bn,
      signals: { rainfallMm, avgTempC, humidity, ndvi: scenarioInputs.ndvi },
      scenario_label: scenarioLabel,
      scenario_inputs: scenarioInputs,
    });
    if (error) {
      toast.error("সংরক্ষণ ব্যর্থ");
    } else {
      toast.success("সংরক্ষিত হয়েছে");
      const { data } = await (supabase as any)
        .from("yield_predictions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      setHistory(data || []);
    }
  };

  const handleSpeak = (result: PredictionResult) => {
    if (isSpeaking) {
      stop();
      return;
    }
    const label = CROPS.find((c) => c.key === crop)?.label || crop;
    const summary = `${label} ফসলের অনুমানিক ফলন প্রতি হেক্টরে ${result.min} থেকে ${result.max} টন। ${result.reasoning_bn}`;
    speak(summary);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Link to="/home" className="p-2 -ml-2 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Sprout className="w-5 h-5 text-secondary" />
              ইয়েল্ডম্যাক্স – ফলন পূর্বাভাস
            </h1>
            <p className="text-xs text-muted-foreground">স্যাটেলাইট ও আবহাওয়া ভিত্তিক আনুমানিক ফলন</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        {/* Inputs */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><Info className="w-4 h-4 text-secondary" /> আপনার ফসল ও জমি</h2>

          <div>
            <label className="text-sm text-muted-foreground">ফসল</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full mt-1 rounded-lg border border-border bg-background p-2"
            >
              {CROPS.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">জমির নাম</label>
              <input
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="উত্তরের জমি"
                className="w-full mt-1 rounded-lg border border-border bg-background p-2"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">আয়তন (হেক্টর)</label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={area}
                onChange={(e) => setArea(Number(e.target.value) || 0)}
                className="w-full mt-1 rounded-lg border border-border bg-background p-2"
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2">
            🌤️ বর্তমান আবহাওয়া: {avgTempC.toFixed(1)}°C, আর্দ্রতা {humidity}% •
            মৌসুমি বৃষ্টি (আনুমানিক): {rainfallMm} মিমি
          </div>
        </div>

        {/* Scenarios */}
        <div className="grid md:grid-cols-2 gap-4">
          <ScenarioCard
            title="দৃশ্যপট A – বর্তমান পদ্ধতি"
            value={scenarioA}
            onChange={setScenarioA}
            accent="text-blue-400"
          />
          <ScenarioCard
            title="দৃশ্যপট B – উন্নত পদ্ধতি"
            value={scenarioB}
            onChange={setScenarioB}
            accent="text-secondary"
          />
        </div>

        <button
          onClick={runPrediction}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
          {loading ? "গণনা হচ্ছে..." : "ফলন অনুমান করুন"}
        </button>

        {/* Results */}
        {(resultA || resultB) && (
          <div className="grid md:grid-cols-2 gap-4">
            {resultA && (
              <ResultCard
                title="দৃশ্যপট A"
                result={resultA}
                area={area}
                onSpeak={() => handleSpeak(resultA)}
                onSave={() => savePrediction(resultA, "বর্তমান পদ্ধতি", scenarioA)}
                speaking={isSpeaking}
                ttsLoading={ttsLoading}
                accent="border-blue-500/40"
              />
            )}
            {resultB && (
              <ResultCard
                title="দৃশ্যপট B"
                result={resultB}
                area={area}
                onSpeak={() => handleSpeak(resultB)}
                onSave={() => savePrediction(resultB, "উন্নত পদ্ধতি", scenarioB)}
                speaking={isSpeaking}
                ttsLoading={ttsLoading}
                accent="border-secondary/50"
              />
            )}
          </div>
        )}

        {resultA && resultB && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-semibold mb-2">📊 তুলনা</h3>
            <p className="text-sm">
              দৃশ্যপট B দৃশ্যপট A এর তুলনায় প্রতি হেক্টরে{" "}
              <span className="font-bold text-secondary">
                {(resultB.avg - resultA.avg >= 0 ? "+" : "") +
                  (resultB.avg - resultA.avg).toFixed(2)} টন
              </span>{" "}
              ({((resultB.avg - resultA.avg) / Math.max(resultA.avg, 0.01) * 100).toFixed(1)}%) পার্থক্য।
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <HistoryIcon className="w-4 h-4" /> পূর্বের পূর্বাভাস
            </h3>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="text-sm border-b border-border/60 last:border-0 pb-2 last:pb-0">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {CROPS.find((c) => c.key === h.crop_name)?.label || h.crop_name}
                      {h.field_name ? ` • ${h.field_name}` : ""}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(h.created_at).toLocaleDateString("bn-BD")}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {h.scenario_label || "—"} • {h.estimated_yield_min}–{h.estimated_yield_max} {h.yield_unit} • আত্মবিশ্বাস {h.confidence}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScenarioCard({
  title,
  value,
  onChange,
  accent,
}: {
  title: string;
  value: ScenarioInputs;
  onChange: (v: ScenarioInputs) => void;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <h3 className={`font-semibold ${accent}`}>{title}</h3>

      <div>
        <label className="text-sm text-muted-foreground">সেচ</label>
        <select
          value={value.irrigation}
          onChange={(e) => onChange({ ...value, irrigation: e.target.value as any })}
          className="w-full mt-1 rounded-lg border border-border bg-background p-2"
        >
          <option value="low">কম</option>
          <option value="normal">স্বাভাবিক</option>
          <option value="high">বেশি</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-muted-foreground">সার প্রয়োগের সময়</label>
        <select
          value={value.fertilizerTiming}
          onChange={(e) => onChange({ ...value, fertilizerTiming: e.target.value as any })}
          className="w-full mt-1 rounded-lg border border-border bg-background p-2"
        >
          <option value="early">আগেভাগে</option>
          <option value="onTime">সময়মতো</option>
          <option value="late">দেরিতে</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-muted-foreground">
          NDVI (স্যাটেলাইট সবুজতা): {value.ndvi.toFixed(2)}
        </label>
        <input
          type="range"
          min={0.1}
          max={0.9}
          step={0.05}
          value={value.ndvi}
          onChange={(e) => onChange({ ...value, ndvi: Number(e.target.value) })}
          className="w-full mt-2"
        />
      </div>
    </div>
  );
}

function ResultCard({
  title,
  result,
  area,
  onSpeak,
  onSave,
  speaking,
  ttsLoading,
  accent,
}: {
  title: string;
  result: PredictionResult;
  area: number;
  onSpeak: () => void;
  onSave: () => void;
  speaking: boolean;
  ttsLoading: boolean;
  accent: string;
}) {
  return (
    <div className={`rounded-2xl border-2 ${accent} bg-card p-4 space-y-3`}>
      <h3 className="font-semibold">{title}</h3>
      <div>
        <p className="text-3xl font-bold text-secondary">
          {result.min}–{result.max}
        </p>
        <p className="text-xs text-muted-foreground">টন / হেক্টর</p>
      </div>
      {area > 0 && (
        <p className="text-sm">
          মোট আনুমানিক ফলন: <span className="font-semibold">{(result.avg * area).toFixed(2)} টন</span>
        </p>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-secondary"
            style={{ width: `${result.confidence}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{result.confidence}%</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{result.reasoning_bn}</p>
      <div className="flex gap-2">
        <button
          onClick={onSpeak}
          disabled={ttsLoading}
          className="flex-1 py-2 rounded-lg border border-border hover:bg-muted flex items-center justify-center gap-2 text-sm disabled:opacity-60"
        >
          {ttsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {speaking ? "থামান" : "শুনুন"}
        </button>
        <button
          onClick={onSave}
          className="flex-1 py-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 flex items-center justify-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" /> সংরক্ষণ
        </button>
      </div>
    </div>
  );
}
