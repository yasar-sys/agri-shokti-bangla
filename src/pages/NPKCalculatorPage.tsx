import { ArrowLeft, Calculator, Leaf, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

const crops = [
  { id: "rice", name: "ধান", emoji: "🌾" },
  { id: "wheat", name: "গম", emoji: "🌿" },
  { id: "potato", name: "আলু", emoji: "🥔" },
  { id: "onion", name: "পেঁয়াজ", emoji: "🧅" },
  { id: "tomato", name: "টমেটো", emoji: "🍅" },
  { id: "corn", name: "ভুট্টা", emoji: "🌽" },
];

const fertilizers = [
  { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", dose: "৮০ কেজি/একর" },
  { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", dose: "৪০ কেজি/একর" },
  { name: "MOP", npk: "০-০-৬০", color: "bg-primary", dose: "৩০ কেজি/একর" },
  { name: "DAP", npk: "১৮-৪৬-০", color: "bg-chart-4", dose: "২৫ কেজি/একর" },
];

const schedule = [
  { stage: "বীজ বপনের সময়", day: "০ দিন", fertilizer: "TSP + MOP সম্পূর্ণ", amount: "৪০+৩০ কেজি" },
  { stage: "প্রথম কিস্তি", day: "১৫-২০ দিন", fertilizer: "ইউরিয়া ১/৩", amount: "২৭ কেজি" },
  { stage: "দ্বিতীয় কিস্তি", day: "৩০-৩৫ দিন", fertilizer: "ইউরিয়া ১/৩", amount: "২৭ কেজি" },
  { stage: "তৃতীয় কিস্তি", day: "৪৫-৫০ দিন", fertilizer: "ইউরিয়া ১/৩", amount: "২৬ কেজি" },
];

const warnings = [
  "ইউরিয়া + TSP একসাথে দেবেন না",
  "ভেজা মাটিতে ইউরিয়া দিলে গ্যাস হয়ে উড়ে যায়",
  "অতিরিক্ত সার ফসলের ক্ষতি করে",
];

export default function NPKCalculatorPage() {
  const [selectedCrop, setSelectedCrop] = useState("rice");

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
              <Calculator className="w-5 h-5 text-primary" />
              সার ক্যালকুলেটর
            </h1>
            <p className="text-xs text-muted-foreground">সরকারি গাইডলাইন + NPK ব্যালেন্স</p>
          </div>
        </div>
      </header>

      {/* Crop Selection */}
      <section className="px-4 py-4">
        <h2 className="text-sm font-semibold text-foreground mb-2">ফসল নির্বাচন করুন</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {crops.map((crop) => (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(crop.id)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-xl border flex items-center gap-2 transition-all backdrop-blur-sm",
                selectedCrop === crop.id 
                  ? "bg-secondary/20 border-secondary text-secondary" 
                  : "bg-card/80 border-border text-foreground"
              )}
            >
              <span>{crop.emoji}</span>
              <span className="text-sm">{crop.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Land Size Input */}
      <section className="px-4 mb-4">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">জমির পরিমাণ</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-lg px-4 py-3 text-center">
              <span className="text-2xl font-bold text-foreground">২.৫</span>
              <span className="text-sm text-muted-foreground ml-1">একর</span>
            </div>
            <Button variant="outline" size="sm">পরিবর্তন</Button>
          </div>
        </div>
      </section>

      {/* NPK Requirement */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-secondary" />
          প্রয়োজনীয় সার (২.৫ একর)
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {fertilizers.map((fert, idx) => (
            <div key={idx} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-3 h-3 rounded-full", fert.color)} />
                <span className="text-sm font-medium text-foreground">{fert.name}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{fert.dose}</p>
              <p className="text-xs text-muted-foreground">NPK: {fert.npk}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Application Schedule */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">প্রয়োগের সময়সূচি</h2>
        <div className="space-y-2">
          {schedule.map((item, idx) => (
            <div key={idx} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary font-bold text-sm">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.stage}</p>
                <p className="text-xs text-muted-foreground">{item.day} • {item.fertilizer}</p>
              </div>
              <span className="text-xs bg-muted text-foreground px-2 py-1 rounded-lg">{item.amount}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Warnings */}
      <section className="px-4 mb-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            সতর্কতা
          </h3>
          <ul className="space-y-1.5">
            {warnings.map((warning, idx) => (
              <li key={idx} className="text-xs text-destructive/80 flex items-start gap-2">
                <span>⚠️</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Government Source */}
      <section className="px-4">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            তথ্যসূত্র: বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) ও DAE
          </p>
        </div>
      </section>
    </div>
  );
}
