import { RefreshCw, TrendingUp, ArrowLeft, Brain, TrendingDown, Minus, Calendar, AlertTriangle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { MarketPriceRow } from "@/components/ui/MarketPriceRow";
import { Button } from "@/components/ui/button";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { useState } from "react";

const marketData = [
  { crop: "ধান (আমন)", today: 1250, yesterday: 1200, weeklyAvg: 1220, forecast: "up", forecastPrice: 1320, confidence: 78 },
  { crop: "ধান (বোরো)", today: 1180, yesterday: 1190, weeklyAvg: 1175, forecast: "stable", forecastPrice: 1185, confidence: 82 },
  { crop: "গম", today: 1450, yesterday: 1420, weeklyAvg: 1400, forecast: "up", forecastPrice: 1520, confidence: 71 },
  { crop: "পাট", today: 2800, yesterday: 2750, weeklyAvg: 2700, forecast: "up", forecastPrice: 2950, confidence: 85 },
  { crop: "আলু", today: 25, yesterday: 28, weeklyAvg: 27, forecast: "down", forecastPrice: 22, confidence: 76 },
  { crop: "পেঁয়াজ", today: 45, yesterday: 42, weeklyAvg: 40, forecast: "up", forecastPrice: 52, confidence: 68 },
  { crop: "রসুন", today: 180, yesterday: 175, weeklyAvg: 172, forecast: "stable", forecastPrice: 182, confidence: 80 },
  { crop: "মরিচ", today: 250, yesterday: 260, weeklyAvg: 255, forecast: "down", forecastPrice: 235, confidence: 73 },
];

const aiRecommendations = [
  {
    crop: "ধান (আমন)",
    action: "বিক্রি করুন",
    reason: "আগামী ২ সপ্তাহে দাম বাড়বে, তারপর কমতে পারে",
    timing: "১৫-২০ দিন পর",
    icon: "🌾"
  },
  {
    crop: "পেঁয়াজ",
    action: "অপেক্ষা করুন",
    reason: "শীতকালে দাম আরও বাড়বে",
    timing: "১ মাস পর",
    icon: "🧅"
  },
  {
    crop: "আলু",
    action: "এখনই বিক্রি করুন",
    reason: "নতুন ফসল আসছে, দাম কমবে",
    timing: "জরুরি",
    icon: "🥔"
  }
];

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<'prices' | 'forecast' | 'strategy'>('prices');

  const getForecastIcon = (forecast: string) => {
    switch (forecast) {
      case 'up': return <TrendingUp className="w-4 h-4 text-secondary" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getForecastText = (forecast: string) => {
    switch (forecast) {
      case 'up': return 'বাড়বে';
      case 'down': return 'কমবে';
      default: return 'স্থিতিশীল';
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
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">বাজারদর ও পূর্বাভাস</h1>
            <p className="text-xs text-muted-foreground">AI-চালিত মূল্য বিশ্লেষণ</p>
          </div>
          <Button variant="outline" size="icon" className="border-border">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>

        {/* API Status */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span>AI Market Analysis • সর্বশেষ আপডেট: ১০ মিনিট আগে</span>
        </div>
      </header>

      {/* Tab Navigation */}
      <section className="px-4 mb-4">
        <div className="flex gap-2 bg-card/50 p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('prices')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'prices' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-1" />
            বাজার দর
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'forecast' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Brain className="w-4 h-4 inline mr-1" />
            AI পূর্বাভাস
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'strategy' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-1" />
            বিক্রি কৌশল
          </button>
        </div>
      </section>

      {activeTab === 'prices' && (
        <>
          {/* Summary Card */}
          <section className="px-4 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-secondary/20 to-primary/20 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">আজকের বাজার সারসংক্ষেপ</p>
                  <p className="font-semibold text-foreground">বেশিরভাগ ফসলের দাম স্থিতিশীল</p>
                </div>
              </div>
            </div>
          </section>

          {/* Table Header */}
          <section className="px-4 mb-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-4">
              <span>ফসল</span>
              <div className="flex gap-4">
                <span>আজ</span>
                <span>সা. গড়</span>
                <span>পরিবর্তন</span>
              </div>
            </div>
          </section>

          {/* Price List */}
          <section className="px-4 space-y-2">
            {marketData.map((item) => (
              <MarketPriceRow
                key={item.crop}
                crop={item.crop}
                todayPrice={item.today}
                yesterdayPrice={item.yesterday}
                weeklyAvg={item.weeklyAvg}
              />
            ))}
          </section>
        </>
      )}

      {activeTab === 'forecast' && (
        <>
          {/* AI Forecast Header */}
          <section className="px-4 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-chart-4/20 to-chart-5/20 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-chart-4/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AI মূল্য পূর্বাভাস</p>
                  <p className="font-semibold text-foreground">আগামী ৭ দিনের সম্ভাব্য দাম</p>
                </div>
              </div>
            </div>
          </section>

          {/* Forecast Cards */}
          <section className="px-4 space-y-3">
            {marketData.map((item) => (
              <div key={item.crop} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌾</span>
                    <span className="font-medium text-foreground">{item.crop}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getForecastIcon(item.forecast)}
                    <span className={`text-sm ${
                      item.forecast === 'up' ? 'text-secondary' : 
                      item.forecast === 'down' ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {getForecastText(item.forecast)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-background/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">বর্তমান</p>
                    <p className="font-bold text-foreground">৳{item.today}</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">পূর্বাভাস</p>
                    <p className={`font-bold ${
                      item.forecast === 'up' ? 'text-secondary' : 
                      item.forecast === 'down' ? 'text-destructive' : 'text-foreground'
                    }`}>৳{item.forecastPrice}</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">নির্ভুলতা</p>
                    <p className="font-bold text-chart-4">{item.confidence}%</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="px-4 mt-4">
            <div className="bg-chart-4/10 border border-chart-4/30 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-chart-4 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  এই পূর্বাভাস AI মডেল দ্বারা তৈরি। আবহাওয়া ও বাজার পরিস্থিতির উপর নির্ভর করে দাম ভিন্ন হতে পারে।
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'strategy' && (
        <>
          {/* Strategy Header */}
          <section className="px-4 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AI বিক্রি কৌশল</p>
                  <p className="font-semibold text-foreground">সর্বোচ্চ মুনাফার জন্য সুপারিশ</p>
                </div>
              </div>
            </div>
          </section>

          {/* Strategy Cards */}
          <section className="px-4 space-y-3">
            {aiRecommendations.map((rec, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-2xl">
                    {rec.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{rec.crop}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        rec.action === 'এখনই বিক্রি করুন' 
                          ? 'bg-destructive/20 text-destructive' 
                          : rec.action === 'বিক্রি করুন'
                          ? 'bg-secondary/20 text-secondary'
                          : 'bg-chart-4/20 text-chart-4'
                      }`}>
                        {rec.action}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                    <div className="flex items-center gap-1 text-xs text-chart-3">
                      <Calendar className="w-3 h-3" />
                      <span>সেরা সময়: {rec.timing}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Supply Chain Tips */}
          <section className="px-4 mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">সরবরাহ শৃঙ্খলা টিপস</h3>
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-lg">🏪</span>
                <div>
                  <p className="text-sm font-medium text-foreground">পাইকারি বাজার</p>
                  <p className="text-xs text-muted-foreground">কারওয়ান বাজার, ঢাকা - সবচেয়ে ভালো দাম</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">🚛</span>
                <div>
                  <p className="text-sm font-medium text-foreground">পরিবহন খরচ</p>
                  <p className="text-xs text-muted-foreground">প্রতি মণ ৳৫০-৮০ (দূরত্ব অনুযায়ী)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">📦</span>
                <div>
                  <p className="text-sm font-medium text-foreground">সংরক্ষণ পরামর্শ</p>
                  <p className="text-xs text-muted-foreground">শুষ্ক ও ঠান্ডা জায়গায় রাখুন, আর্দ্রতা এড়িয়ে চলুন</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Disclaimer */}
      <section className="px-4 mt-6">
        <p className="text-xs text-muted-foreground text-center">
          * দাম স্থানীয় বাজার অনুযায়ী ভিন্ন হতে পারে
        </p>
      </section>
    </div>
  );
}
