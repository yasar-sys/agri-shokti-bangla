import { ArrowLeft, CloudLightning, Thermometer, Droplets, Wind, AlertTriangle, Leaf, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

const activeAlerts = [
  { 
    type: "তাপপ্রবাহ", 
    severity: "উচ্চ", 
    icon: Thermometer, 
    color: "text-destructive",
    message: "আগামী ৩ দিন তাপমাত্রা ৩৮°+ থাকবে",
    advice: "সকাল ১০টার পর সেচ দেবেন না। চারা ঢেকে রাখুন।"
  },
  { 
    type: "খরা ঝুঁকি", 
    severity: "মাঝারি", 
    icon: Droplets, 
    color: "text-chart-2",
    message: "আগামী ১০ দিন বৃষ্টির সম্ভাবনা কম",
    advice: "পানি সংরক্ষণ করুন। মালচিং ব্যবহার করুন।"
  },
];

const forecast = [
  { day: "আজ", temp: "৩৫°", rain: "১০%", risk: "মাঝারি" },
  { day: "আগামীকাল", temp: "৩৮°", rain: "৫%", risk: "উচ্চ" },
  { day: "পরশু", temp: "৩৯°", rain: "০%", risk: "উচ্চ" },
  { day: "৩ দিন পর", temp: "৩৬°", rain: "২০%", risk: "মাঝারি" },
  { day: "৪ দিন পর", temp: "৩৪°", rain: "৪০%", risk: "নিম্ন" },
];

const smartCrops = [
  { name: "তাপ সহনশীল ধান", variety: "BRRI-71", benefit: "৪০° পর্যন্ত সহ্য করে" },
  { name: "খরা সহনশীল গম", variety: "BARI গম-৩০", benefit: "কম পানিতে ফলন ভালো" },
  { name: "বন্যা সহনশীল ধান", variety: "BRRI-51", benefit: "২ সপ্তাহ জলাবদ্ধতা সহ্য করে" },
];

export default function ClimateAlertPage() {
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
              <CloudLightning className="w-5 h-5 text-destructive" />
              জলবায়ু সতর্কতা
            </h1>
            <p className="text-xs text-muted-foreground">দুর্যোগ পূর্বাভাস ও প্রস্তুতি</p>
          </div>
        </div>
      </header>

      {/* Active Alerts */}
      <section className="px-4 py-4">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          সক্রিয় সতর্কতা
        </h2>
        <div className="space-y-3">
          {activeAlerts.map((alert, idx) => (
            <div key={idx} className={cn(
              "bg-card/80 backdrop-blur-sm border-2 rounded-xl p-4",
              alert.severity === "উচ্চ" ? "border-destructive/50" : "border-chart-2/50"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <alert.icon className={cn("w-5 h-5", alert.color)} />
                <span className="text-sm font-semibold text-foreground">{alert.type}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full ml-auto",
                  alert.severity === "উচ্চ" ? "bg-destructive/20 text-destructive" : "bg-chart-2/20 text-chart-2"
                )}>
                  {alert.severity} ঝুঁকি
                </span>
              </div>
              <p className="text-sm text-foreground mb-2">{alert.message}</p>
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-xs text-muted-foreground">
                  <span className="text-secondary font-medium">পরামর্শ:</span> {alert.advice}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5-Day Forecast */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">৫ দিনের পূর্বাভাস</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {forecast.map((day, idx) => (
            <div key={idx} className="flex-shrink-0 w-20 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
              <p className="text-lg font-bold text-foreground">{day.temp}</p>
              <div className="flex items-center justify-center gap-1 text-xs text-chart-3 mb-1">
                <Droplets className="w-3 h-3" />
                {day.rain}
              </div>
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                day.risk === "উচ্চ" && "bg-destructive/20 text-destructive",
                day.risk === "মাঝারি" && "bg-chart-2/20 text-chart-2",
                day.risk === "নিম্ন" && "bg-secondary/20 text-secondary"
              )}>
                {day.risk}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Climate Smart Crops */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-secondary" />
          জলবায়ু-স্মার্ট ফসল
        </h2>
        <div className="space-y-2">
          {smartCrops.map((crop, idx) => (
            <div key={idx} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{crop.name}</p>
                <p className="text-xs text-muted-foreground">{crop.variety} • {crop.benefit}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="px-4">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">জরুরি যোগাযোগ</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">কৃষি হটলাইন</span>
              <span className="text-secondary font-medium">১৬১২৩</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">দুর্যোগ ব্যবস্থাপনা</span>
              <span className="text-secondary font-medium">১০৯০</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">আবহাওয়া অফিস</span>
              <span className="text-secondary font-medium">০২-৯১৪৩৬৫৭</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
