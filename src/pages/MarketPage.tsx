import { RefreshCw, TrendingUp, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { MarketPriceRow } from "@/components/ui/MarketPriceRow";
import { Button } from "@/components/ui/button";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

const marketData = [
  { crop: "ধান (আমন)", today: 1250, yesterday: 1200, weeklyAvg: 1220 },
  { crop: "ধান (বোরো)", today: 1180, yesterday: 1190, weeklyAvg: 1175 },
  { crop: "গম", today: 1450, yesterday: 1420, weeklyAvg: 1400 },
  { crop: "পাট", today: 2800, yesterday: 2750, weeklyAvg: 2700 },
  { crop: "আলু", today: 25, yesterday: 28, weeklyAvg: 27 },
  { crop: "পেঁয়াজ", today: 45, yesterday: 42, weeklyAvg: 40 },
  { crop: "রসুন", today: 180, yesterday: 175, weeklyAvg: 172 },
  { crop: "মরিচ", today: 250, yesterday: 260, weeklyAvg: 255 },
];

export default function MarketPage() {
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
            <h1 className="text-xl font-bold text-foreground">বাজারদর</h1>
            <p className="text-xs text-muted-foreground">লাইভ ফসলের দাম</p>
          </div>
          <Button variant="outline" size="icon" className="border-border">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>

        {/* API Status */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span>GET /api/market-prices • সর্বশেষ আপডেট: ১০ মিনিট আগে</span>
        </div>
      </header>

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

      {/* Disclaimer */}
      <section className="px-4 mt-6">
        <p className="text-xs text-muted-foreground text-center">
          * দাম স্থানীয় বাজার অনুযায়ী ভিন্ন হতে পারে
        </p>
      </section>
    </div>
  );
}
