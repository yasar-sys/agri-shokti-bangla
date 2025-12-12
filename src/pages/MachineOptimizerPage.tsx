import { ArrowLeft, Tractor, Fuel, Gauge, Timer, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

const machines = [
  { id: 1, name: "ট্রাক্টর", emoji: "🚜", status: "ভালো", lastService: "১৫ দিন আগে" },
  { id: 2, name: "পাওয়ার টিলার", emoji: "⚙️", status: "সার্ভিস দরকার", lastService: "৪৫ দিন আগে" },
  { id: 3, name: "পাম্প মেশিন", emoji: "🔧", status: "ভালো", lastService: "১০ দিন আগে" },
];

const optimizationTips = [
  {
    title: "জ্বালানি সাশ্রয়",
    icon: Fuel,
    color: "text-chart-2",
    tips: [
      "২.৫ একরে ৮ লিটার ডিজেল যথেষ্ট",
      "সকাল ৬-৮টায় কাজ করলে ১৫% কম জ্বালানি লাগে",
      "RPM ১৮০০-২০০০ রাখুন",
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
    ]
  },
];

export default function MachineOptimizerPage() {
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
        <h2 className="text-base font-semibold text-foreground mb-3">আমার যন্ত্রপাতি</h2>
        <div className="space-y-2">
          {machines.map((machine) => (
            <div key={machine.id} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 flex items-center gap-3">
              <div className="text-3xl">{machine.emoji}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{machine.name}</p>
                <p className="text-xs text-muted-foreground">শেষ সার্ভিস: {machine.lastService}</p>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                machine.status === "ভালো" ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"
              )}>
                {machine.status === "ভালো" ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {machine.status}
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
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">৮ লিটার</p>
              <p className="text-xs text-muted-foreground">২.৫ একর জমির জন্য</p>
            </div>
            <div className="bg-card/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">৳৮৫৬</p>
              <p className="text-xs text-muted-foreground">আনুমানিক খরচ</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            * নরম মাটি ও সকালের কাজের ভিত্তিতে
          </p>
        </div>
      </section>

      {/* Optimization Tips */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">AI অপ্টিমাইজেশন টিপস</h2>
        <div className="space-y-3">
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

      {/* Soil Condition */}
      <section className="px-4">
        <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/50 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-xl">🌍</span>
            <div>
              <h3 className="font-semibold text-primary text-sm mb-1">আজকের মাটির অবস্থা</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                মাটি <span className="text-secondary font-medium">নরম</span> আছে। গতকাল বৃষ্টি হয়েছে। 
                আজ চাষ করলে ২০% কম জ্বালানি লাগবে। বিকেল ৪টার আগে কাজ শেষ করুন।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
