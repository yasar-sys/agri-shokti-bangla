import { ArrowLeft, Tractor, Fuel, Gauge, Timer, AlertCircle, CheckCircle2, Wrench, Droplets, Zap, Settings, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { Input } from "@/components/ui/input";

const machines = [
  { id: 1, name: "ট্রাক্টর", emoji: "🚜", status: "ভালো", lastService: "১৫ দিন আগে", type: "tractor" },
  { id: 2, name: "পাওয়ার টিলার", emoji: "⚙️", status: "সার্ভিস দরকার", lastService: "৪৫ দিন আগে", type: "tiller" },
  { id: 3, name: "পাম্প মেশিন", emoji: "💧", status: "ভালো", lastService: "১০ দিন আগে", type: "pump" },
  { id: 4, name: "হারভেস্টার", emoji: "🌾", status: "ভালো", lastService: "৭ দিন আগে", type: "harvester" },
  { id: 5, name: "স্প্রেয়ার মেশিন", emoji: "🔫", status: "সার্ভিস দরকার", lastService: "৬০ দিন আগে", type: "sprayer" },
  { id: 6, name: "থ্রেশার", emoji: "🌀", status: "ভালো", lastService: "২০ দিন আগে", type: "thresher" },
  { id: 7, name: "সিডার/বপন যন্ত্র", emoji: "🌱", status: "ভালো", lastService: "৩০ দিন আগে", type: "seeder" },
  { id: 8, name: "কাল্টিভেটর", emoji: "🔧", status: "সার্ভিস দরকার", lastService: "৫৫ দিন আগে", type: "cultivator" },
  { id: 9, name: "রোটাভেটর", emoji: "⚡", status: "ভালো", lastService: "১২ দিন আগে", type: "rotavator" },
  { id: 10, name: "ধান কাটার যন্ত্র (রিপার)", emoji: "✂️", status: "ভালো", lastService: "৫ দিন আগে", type: "reaper" },
];

const optimizationTips = [
  {
    title: "জ্বালানি সাশ্রয়",
    icon: Fuel,
    color: "text-chart-2",
    tips: [
      "জ্বালানি খরচের হিসাব নিয়মিত লিখে রাখুন",
      "যন্ত্রের নির্দেশনা অনুযায়ী উপযুক্ত সময়ে কাজ করুন",
      "RPM ১৮০০-২০০০ রাখুন",
      "এয়ার ফিল্টার পরিষ্কার রাখুন",
    ]
  },
  {
    title: "গতি অপ্টিমাইজেশন",
    icon: Gauge,
    color: "text-chart-3",
    tips: [
      "নরম মাটিতে: ৩-৪ কিমি/ঘণ্টা",
      "শক্ত মাটিতে: ২-৩ কিমি/ঘণ্টা",
      "ভেজা মাটিতে চাষ করবেন না",
      "হারভেস্টার: ২-৩ কিমি/ঘণ্টা সেরা",
    ]
  },
  {
    title: "সময় ব্যবস্থাপনা",
    icon: Timer,
    color: "text-chart-4",
    tips: [
      "প্রতি ঘণ্টায় ১০ মিনিট বিশ্রাম",
      "একটানা ৪ ঘণ্টার বেশি না চালানো",
      "সন্ধ্যার আগে কাজ শেষ করুন",
      "সপ্তাহে একদিন রক্ষণাবেক্ষণ",
    ]
  },
  {
    title: "রক্ষণাবেক্ষণ",
    icon: Wrench,
    color: "text-primary",
    tips: [
      "প্রতি ১০০ ঘণ্টায় তেল বদলান",
      "প্রতি সপ্তাহে ফিল্টার চেক করুন",
      "বেল্ট টান ঠিক রাখুন",
      "ব্যাটারি টার্মিনাল পরিষ্কার রাখুন",
    ]
  },
];


export default function MachineOptimizerPage() {
  const [dieselLiters, setDieselLiters] = useState("");
  const [dieselPrice, setDieselPrice] = useState("");
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);

  const handleCalculate = () => {
    const liters = parseFloat(dieselLiters);
    const price = Number(dieselPrice);
    setCalculatedCost(null);
    setCalculatedArea(null);
    if (Number.isFinite(liters) && liters > 0 && Number.isFinite(price) && price > 0) {
      setCalculatedCost(liters * price);
      // Approximately 3.2 liters per acre for standard tractor
      setCalculatedArea(liters / 3.2);
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${villageBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/home">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Tractor className="w-5 h-5 text-chart-1" />
              যন্ত্র অপ্টিমাইজার
            </h1>
            <p className="text-xs text-muted-foreground">ট্রাক্টর, টিলার ও পাম্প গাইড</p>
          </div>
        </div>
      </header>

      {/* My Machines */}
      <section className="px-4 py-4">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          যন্ত্রপাতির ধরন ({machines.length}টি)
        </h2>
        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
          {machines.map((machine) => (
            <div key={machine.id} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center text-2xl">
                {machine.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{machine.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Calculator */}
      <section className="px-4 mb-4">
        <div className="bg-gradient-to-r from-chart-1/20 to-chart-2/20 border border-chart-1/30 rounded-xl p-4 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Fuel className="w-4 h-4 text-chart-2" />
            দ্রুত ডিজেল হিসাব
          </h3>
          
          <div className="mb-3">
            <label htmlFor="dieselPrice" className="text-xs text-muted-foreground mb-1 block">ডিজেলের ক্রয়মূল্য (টাকা/লিটার)</label>
            <Input id="dieselPrice" type="number" min="0.1" step="0.1" value={dieselPrice} onChange={(e) => { setDieselPrice(e.target.value); setCalculatedCost(null); setCalculatedArea(null); }} />
          </div>
          {/* Input for liters */}
          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1 block">ডিজেলের পরিমাণ (লিটার)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={dieselLiters}
                onChange={(e) => { setDieselLiters(e.target.value); setCalculatedCost(null); setCalculatedArea(null); }}
                placeholder="যেমন: ৮"
                className="flex-1"
                min="0.1"
                step="0.1"
              />
              <Button 
                onClick={handleCalculate}
                disabled={!(Number(dieselLiters) > 0 && Number(dieselPrice) > 0)}
                className="bg-secondary text-secondary-foreground"
              >
                হিসাব করুন
              </Button>
            </div>
          </div>

          {/* Results */}
          {calculatedCost !== null && calculatedArea !== null && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">৳{calculatedCost.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">মোট খরচ</p>
              </div>
              <div className="bg-card/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{calculatedArea.toFixed(1)} একর</p>
                <p className="text-xs text-muted-foreground">আনুমানিক জমি</p>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2 text-center">
            জমির হিসাব আনুমানিক ৩.২ লিটার/একর ধরে; প্রকৃত খরচ যন্ত্র ও মাটিভেদে পরিবর্তিত হয়।
          </p>
        </div>
      </section>

      {/* Optimization Tips */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-chart-2" />
          সাধারণ রক্ষণাবেক্ষণ পরামর্শ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {optimizationTips.map((section, idx) => (
            <div key={idx} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <section.icon className={cn("w-4 h-4", section.color)} />
                {section.title}
              </h3>
              <ul className="space-y-1.5">
                {section.tips.map((tip, tipIdx) => (
                  <li key={tipIdx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Machine-specific tips */}
      <section className="px-4 mb-4">
        <div className="bg-gradient-to-r from-chart-3/20 to-chart-4/20 border border-chart-3/30 rounded-xl p-4 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-chart-3" />
            যন্ত্র অনুযায়ী পরামর্শ
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-card/50 rounded-lg p-2">
              <span className="font-medium">🚜 ট্রাক্টর:</span>
              <p className="text-muted-foreground">৫০ ঘণ্টায় গ্রিস দিন</p>
            </div>
            <div className="bg-card/50 rounded-lg p-2">
              <span className="font-medium">⚙️ টিলার:</span>
              <p className="text-muted-foreground">ব্লেড মাসে ১ বার চেক</p>
            </div>
            <div className="bg-card/50 rounded-lg p-2">
              <span className="font-medium">💧 পাম্প:</span>
              <p className="text-muted-foreground">সিল প্রতি ৬ মাসে বদলান</p>
            </div>
            <div className="bg-card/50 rounded-lg p-2">
              <span className="font-medium">🌾 হারভেস্টার:</span>
              <p className="text-muted-foreground">চেইন টেনশন নিয়মিত চেক</p>
            </div>
          </div>
        </div>
      </section>

      {/* Soil Condition */}
      <section className="px-4">
        <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/50 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-xl">🌍</span>
            <div>
              <h3 className="font-semibold text-primary text-sm mb-1">মাটির অবস্থা ও কাজের প্রস্তুতি</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                জমির প্রকৃত আর্দ্রতা পরীক্ষা করুন। অতিরিক্ত ভেজা মাটিতে চাষ এড়িয়ে চলুন এবং যন্ত্রের ব্যবহারবিধি অনুসরণ করুন।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}