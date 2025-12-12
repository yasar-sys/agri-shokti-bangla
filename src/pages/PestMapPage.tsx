import { useState } from "react";
import { 
  ArrowLeft, 
  Bug, 
  MapPin, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  Shield,
  Users,
  ChevronRight,
  Flame,
  ThermometerSun
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Mock pest data by district
const districtPestData = [
  { 
    id: "mymensingh", 
    name: "ময়মনসিংহ", 
    level: "high", 
    reports: 45, 
    mainPest: "ধানের মাজরা পোকা",
    trend: "increasing",
    lastReport: "২ ঘন্টা আগে"
  },
  { 
    id: "dhaka", 
    name: "ঢাকা", 
    level: "medium", 
    reports: 28, 
    mainPest: "জাব পোকা",
    trend: "stable",
    lastReport: "৫ ঘন্টা আগে"
  },
  { 
    id: "rajshahi", 
    name: "রাজশাহী", 
    level: "high", 
    reports: 52, 
    mainPest: "আম এর ফলছিদ্রকারী পোকা",
    trend: "increasing",
    lastReport: "১ ঘন্টা আগে"
  },
  { 
    id: "rangpur", 
    name: "রংপুর", 
    level: "low", 
    reports: 12, 
    mainPest: "আলুর কাটুই পোকা",
    trend: "decreasing",
    lastReport: "১২ ঘন্টা আগে"
  },
  { 
    id: "khulna", 
    name: "খুলনা", 
    level: "medium", 
    reports: 31, 
    mainPest: "ধানের বাদামী গাছ ফড়িং",
    trend: "stable",
    lastReport: "৩ ঘন্টা আগে"
  },
  { 
    id: "sylhet", 
    name: "সিলেট", 
    level: "low", 
    reports: 8, 
    mainPest: "চা এর লাল মাকড়",
    trend: "stable",
    lastReport: "১ দিন আগে"
  },
  { 
    id: "chittagong", 
    name: "চট্টগ্রাম", 
    level: "medium", 
    reports: 24, 
    mainPest: "সবজির সাদা মাছি",
    trend: "increasing",
    lastReport: "৪ ঘন্টা আগে"
  },
  { 
    id: "barisal", 
    name: "বরিশাল", 
    level: "high", 
    reports: 38, 
    mainPest: "ধানের পামরি পোকা",
    trend: "increasing",
    lastReport: "৩০ মিনিট আগে"
  },
];

// Recent farmer reports
const recentReports = [
  { 
    farmer: "করিম উদ্দিন", 
    location: "ময়মনসিংহ সদর", 
    pest: "মাজরা পোকা", 
    crop: "ধান",
    time: "২ ঘন্টা আগে",
    severity: "high"
  },
  { 
    farmer: "জামাল হোসেন", 
    location: "বগুড়া", 
    pest: "জাব পোকা", 
    crop: "সরিষা",
    time: "৩ ঘন্টা আগে",
    severity: "medium"
  },
  { 
    farmer: "রহিমা বেগম", 
    location: "রাজশাহী", 
    pest: "ফলছিদ্রকারী", 
    crop: "আম",
    time: "৪ ঘন্টা আগে",
    severity: "high"
  },
  { 
    farmer: "আব্দুল করিম", 
    location: "বরিশাল", 
    pest: "পামরি পোকা", 
    crop: "ধান",
    time: "৫ ঘন্টা আগে",
    severity: "medium"
  },
];

// Pest alerts
const pestAlerts = [
  {
    title: "মাজরা পোকার আক্রমণ বাড়ছে",
    description: "ময়মনসিংহ ও বরিশাল বিভাগে ধানের মাজরা পোকার আক্রমণ বৃদ্ধি পাচ্ছে। সাবধানতা অবলম্বন করুন।",
    severity: "high",
    affectedAreas: ["ময়মনসিংহ", "বরিশাল", "কিশোরগঞ্জ"],
    precautions: [
      "আলোর ফাঁদ ব্যবহার করুন",
      "ট্রাইকোগ্রামা কার্ড স্থাপন করুন",
      "অনুমোদিত কীটনাশক স্প্রে করুন"
    ]
  },
  {
    title: "আমের ফলছিদ্রকারী পোকা সক্রিয়",
    description: "রাজশাহী বিভাগে আমের ফলছিদ্রকারী পোকার প্রাদুর্ভাব দেখা দিয়েছে।",
    severity: "medium",
    affectedAreas: ["রাজশাহী", "চাঁপাইনবাবগঞ্জ", "নওগাঁ"],
    precautions: [
      "আক্রান্ত ফল সংগ্রহ করে মাটিতে পুঁতে ফেলুন",
      "ফেরোমন ফাঁদ ব্যবহার করুন",
      "ফল ব্যাগিং করুন"
    ]
  },
];

export default function PestMapPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"map" | "alerts" | "reports">("map");

  const selectedData = districtPestData.find(d => d.id === selectedDistrict);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "high": return "bg-destructive";
      case "medium": return "bg-primary";
      case "low": return "bg-secondary";
      default: return "bg-muted";
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "high": return "উচ্চ ঝুঁকি";
      case "medium": return "মাঝারি ঝুঁকি";
      case "low": return "কম ঝুঁকি";
      default: return "তথ্য নেই";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="w-4 h-4 text-destructive" />;
      case "decreasing": return <TrendingUp className="w-4 h-4 text-secondary rotate-180" />;
      default: return <div className="w-4 h-4 border-t-2 border-muted-foreground" />;
    }
  };

  const highRiskCount = districtPestData.filter(d => d.level === "high").length;
  const totalReports = districtPestData.reduce((sum, d) => sum + d.reports, 0);

  return (
    <div 
      className="mobile-container min-h-screen pb-24"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10, 31, 23, 0.92), rgba(10, 31, 23, 0.98)), url(/src/assets/bangladesh-village-bg.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">পোকার আক্রমণ ম্যাপ</h1>
            <p className="text-sm text-muted-foreground">জেলাভিত্তিক পোকার প্রাদুর্ভাব</p>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <section className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-destructive/20 border border-destructive/30 rounded-xl p-3 text-center">
            <Flame className="w-5 h-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{highRiskCount}</p>
            <p className="text-xs text-muted-foreground">ঝুঁকিপূর্ণ জেলা</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Bug className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{totalReports}</p>
            <p className="text-xs text-muted-foreground">রিপোর্ট (৭ দিনে)</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Users className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">১,২৫০+</p>
            <p className="text-xs text-muted-foreground">সক্রিয় কৃষক</p>
          </div>
        </div>
      </section>

      {/* Tab Switcher */}
      <section className="px-4 mb-4">
        <div className="flex bg-muted rounded-xl p-1">
          {[
            { id: "map", label: "ম্যাপ", icon: MapPin },
            { id: "alerts", label: "সতর্কতা", icon: AlertTriangle },
            { id: "reports", label: "রিপোর্ট", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.id 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Map View */}
      {activeTab === "map" && (
        <section className="px-4 space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">উচ্চ</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">মাঝারি</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-muted-foreground">কম</span>
            </div>
          </div>

          {/* District Grid (Visual Map Representation) */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="grid grid-cols-4 gap-2 mb-4">
              {districtPestData.map((district) => (
                <button
                  key={district.id}
                  onClick={() => setSelectedDistrict(district.id)}
                  className={cn(
                    "relative p-3 rounded-xl border-2 transition-all",
                    selectedDistrict === district.id 
                      ? "border-foreground scale-105" 
                      : "border-transparent",
                    district.level === "high" && "bg-destructive/20",
                    district.level === "medium" && "bg-primary/20",
                    district.level === "low" && "bg-secondary/20"
                  )}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full mx-auto mb-1",
                    getLevelColor(district.level)
                  )} />
                  <p className="text-[10px] text-foreground font-medium text-center truncate">
                    {district.name}
                  </p>
                  <p className="text-[9px] text-muted-foreground text-center">
                    {district.reports} রিপোর্ট
                  </p>
                  {district.trend === "increasing" && (
                    <div className="absolute -top-1 -right-1">
                      <TrendingUp className="w-3 h-3 text-destructive" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Selected District Details */}
            {selectedData && (
              <div className={cn(
                "p-4 rounded-xl border",
                selectedData.level === "high" && "bg-destructive/10 border-destructive/30",
                selectedData.level === "medium" && "bg-primary/10 border-primary/30",
                selectedData.level === "low" && "bg-secondary/10 border-secondary/30"
              )}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-foreground" />
                    <h3 className="font-semibold text-foreground">{selectedData.name}</h3>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    selectedData.level === "high" && "bg-destructive text-destructive-foreground",
                    selectedData.level === "medium" && "bg-primary text-primary-foreground",
                    selectedData.level === "low" && "bg-secondary text-secondary-foreground"
                  )}>
                    {getLevelText(selectedData.level)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">প্রধান পোকা</p>
                    <p className="text-sm font-medium text-foreground">{selectedData.mainPest}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">রিপোর্ট সংখ্যা</p>
                    <p className="text-sm font-medium text-foreground">{selectedData.reports} টি</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">প্রবণতা</p>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(selectedData.trend)}
                      <span className="text-sm font-medium text-foreground">
                        {selectedData.trend === "increasing" && "বাড়ছে"}
                        {selectedData.trend === "decreasing" && "কমছে"}
                        {selectedData.trend === "stable" && "স্থির"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">সর্বশেষ রিপোর্ট</p>
                    <p className="text-sm font-medium text-foreground">{selectedData.lastReport}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ThermometerSun className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold text-secondary">AI বিশ্লেষণ</h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              বর্তমান আবহাওয়া ও আর্দ্রতার কারণে <span className="font-semibold text-destructive">মাজরা পোকা</span> ও <span className="font-semibold text-destructive">বাদামী গাছ ফড়িং</span> এর আক্রমণ বাড়ার সম্ভাবনা রয়েছে। 
              আগামী ৭ দিনে <span className="font-semibold">ময়মনসিংহ</span> ও <span className="font-semibold">বরিশাল</span> বিভাগে বিশেষ সতর্কতা অবলম্বন করুন।
            </p>
          </div>
        </section>
      )}

      {/* Alerts View */}
      {activeTab === "alerts" && (
        <section className="px-4 space-y-4">
          {pestAlerts.map((alert, index) => (
            <div 
              key={index}
              className={cn(
                "rounded-2xl p-4 border",
                alert.severity === "high" 
                  ? "bg-destructive/10 border-destructive/30" 
                  : "bg-primary/10 border-primary/30"
              )}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  alert.severity === "high" ? "bg-destructive/20" : "bg-primary/20"
                )}>
                  <AlertTriangle className={cn(
                    "w-5 h-5",
                    alert.severity === "high" ? "text-destructive" : "text-primary"
                  )} />
                </div>
                <div className="flex-1">
                  <h3 className={cn(
                    "font-semibold",
                    alert.severity === "high" ? "text-destructive" : "text-primary"
                  )}>
                    {alert.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">আক্রান্ত এলাকা:</p>
                <div className="flex flex-wrap gap-1">
                  {alert.affectedAreas.map((area, i) => (
                    <span 
                      key={i}
                      className="px-2 py-1 bg-muted rounded-full text-xs text-foreground"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-background/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-secondary" />
                  <p className="text-sm font-medium text-foreground">সাবধানতা:</p>
                </div>
                <ul className="space-y-1">
                  {alert.precautions.map((precaution, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-secondary mt-1">•</span>
                      {precaution}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Reports View */}
      {activeTab === "reports" && (
        <section className="px-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">সাম্প্রতিক রিপোর্ট</h3>
            <span className="text-xs text-muted-foreground">গত ২৪ ঘন্টা</span>
          </div>

          {recentReports.map((report, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-sm">👨‍🌾</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{report.farmer}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {report.location}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{report.time}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  report.severity === "high" 
                    ? "bg-destructive/20 text-destructive" 
                    : "bg-primary/20 text-primary"
                )}>
                  <Bug className="w-3 h-3 inline mr-1" />
                  {report.pest}
                </span>
                <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                  🌾 {report.crop}
                </span>
              </div>
            </div>
          ))}

          {/* CTA to Report */}
          <Link to="/camera">
            <div className="bg-secondary text-secondary-foreground rounded-xl p-4 text-center font-semibold flex items-center justify-center gap-2 mt-4">
              <Bug className="w-5 h-5" />
              পোকার ছবি রিপোর্ট করুন
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}
