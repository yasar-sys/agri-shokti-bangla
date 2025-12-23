import { useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2, LineChart, AlertCircle, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { SEOHead } from "@/components/seo/SEOHead";

const getTrendIcon = (change: number) => {
  if (change > 0) return <TrendingUp className="w-4 h-4" />;
  if (change < 0) return <TrendingDown className="w-4 h-4" />;
  return <Minus className="w-4 h-4" />;
};

const getTrendColor = (change: number) => {
  if (change > 0) return "text-secondary";
  if (change < 0) return "text-destructive";
  return "text-muted-foreground";
};

const getForecastText = (forecast: string | null) => {
  switch (forecast) {
    case 'up': return 'বাড়বে';
    case 'down': return 'কমবে';
    default: return 'স্থিতিশীল';
  }
};

const getForecastColor = (forecast: string | null) => {
  switch (forecast) {
    case 'up': return 'text-secondary bg-secondary/10 border-secondary/30';
    case 'down': return 'text-destructive bg-destructive/10 border-destructive/30';
    default: return 'text-muted-foreground bg-muted/30 border-border';
  }
};

export default function MarketPage() {
  const { prices, loading, refetch } = useMarketPrices();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const generateRecommendations = () => {
    return prices
      .filter(p => p.forecast)
      .slice(0, 3)
      .map(p => {
        const change = p.today_price - p.yesterday_price;
        let action = 'অপেক্ষা করুন';
        let reason = '';
        let timing = '';

        if (p.forecast === 'up' && change >= 0) {
          action = 'অপেক্ষা করুন';
          reason = 'দাম বাড়ার সম্ভাবনা আছে';
          timing = '১-২ সপ্তাহ পর বিক্রি করুন';
        } else if (p.forecast === 'down') {
          action = 'এখনই বিক্রি করুন';
          reason = 'দাম কমতে পারে';
          timing = 'জরুরি';
        } else {
          action = 'বাজার পর্যবেক্ষণ করুন';
          reason = 'দাম স্থিতিশীল থাকবে';
          timing = 'নিয়মিত আপডেট দেখুন';
        }

        return {
          crop: p.crop_name,
          emoji: p.crop_emoji || '🌾',
          action,
          reason,
          timing,
          confidence: p.confidence || 70
        };
      });
  };

  const recommendations = generateRecommendations();

  return (
    <>
      <SEOHead
        title="বাজার দর"
        description="বাংলাদেশের কৃষি পণ্যের আজকের বাজার দর। ধান, আলু, পেঁয়াজ, সবজির দাম এবং AI পূর্বাভাস দেখুন।"
        keywords="বাজার দর, কৃষি পণ্য দাম, ধানের দাম, আলুর দাম, পেঁয়াজের দাম, বাংলাদেশ কৃষি বাজার"
      />
      <div className="min-h-screen pb-28 relative overflow-hidden bg-background">
        {/* Premium Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        </div>

        {/* Header */}
        <header className="relative px-5 pt-6 pb-4 sticky top-0 z-40 glass-strong">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-chart-2/50 to-transparent" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/home"
                className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center border border-border/50 hover:border-chart-2/50 transition-all shadow-soft"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-chart-2/30 to-primary/20 flex items-center justify-center shadow-lg">
                  <LineChart className="w-6 h-6 text-chart-2" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                    বাজার দর
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  </h1>
                  <p className="text-xs text-muted-foreground">লাইভ মূল্য আপডেট</p>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="w-11 h-11 rounded-2xl glass-card border border-border/50"
            >
              <RefreshCw className={cn("w-5 h-5", (refreshing || loading) && "animate-spin")} />
            </Button>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-chart-2/30 border-t-chart-2 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">বাজার দর লোড হচ্ছে...</p>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && !loading && (
          <section className="px-5 py-4">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              AI বিক্রয় পরামর্শ
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={cn(
                    "glass-card rounded-2xl p-4 border animate-slide-up",
                    rec.action === 'এখনই বিক্রি করুন' 
                      ? "border-l-4 border-l-destructive border-destructive/30" 
                      : "border-border/30"
                  )}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{rec.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-foreground">{rec.crop}</h3>
                        <span className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-semibold border",
                          rec.action === 'এখনই বিক্রি করুন' 
                            ? "bg-destructive/10 text-destructive border-destructive/30" 
                            : rec.action === 'অপেক্ষা করুন' 
                              ? "bg-secondary/10 text-secondary border-secondary/30" 
                              : "bg-muted text-muted-foreground border-border"
                        )}>
                          {rec.action}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-muted-foreground">{rec.timing}</span>
                        <span className="text-[11px] text-primary font-medium">{rec.confidence}% আত্মবিশ্বাস</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Market Prices Table */}
        {!loading && (
          <section className="px-5 py-4">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-chart-2/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-chart-2" />
              </div>
              আজকের বাজার দর
            </h2>
            
            {prices.length === 0 && (
              <div className="glass-card rounded-2xl p-8 text-center border border-border/30">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">বাজার দর লোড করতে সমস্যা হয়েছে</p>
                <Button onClick={handleRefresh} variant="outline" className="rounded-xl">
                  আবার চেষ্টা করুন
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {prices.map((item, index) => {
                const change = item.today_price - item.yesterday_price;
                const changePercent = ((change / item.yesterday_price) * 100).toFixed(1);
                
                return (
                  <div 
                    key={item.id}
                    className={cn(
                      "glass-card rounded-2xl p-4 border border-border/30",
                      "hover:border-primary/30 transition-all duration-300",
                      "animate-slide-up"
                    )}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl shadow-soft">
                          {item.crop_emoji || '🌾'}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{item.crop_name}</h3>
                          <p className="text-xs text-muted-foreground">{item.unit || 'টাকা/কেজি'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-foreground">
                          ৳{item.today_price.toLocaleString('bn-BD')}
                        </p>
                        <div className={cn(
                          "flex items-center gap-1.5 text-xs font-semibold justify-end mt-1",
                          getTrendColor(change)
                        )}>
                          {getTrendIcon(change)}
                          <span>{change >= 0 ? '+' : ''}{change}</span>
                          <span className="text-muted-foreground">({changePercent}%)</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        সা. গড়: ৳{(item.weekly_avg || item.today_price).toLocaleString('bn-BD')}
                      </span>
                      {item.forecast && (
                        <span className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-medium border",
                          getForecastColor(item.forecast)
                        )}>
                          পূর্বাভাস: {getForecastText(item.forecast)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Market Insights */}
        {!loading && prices.length > 0 && (
          <section className="px-5 py-4">
            <div className="glass-card rounded-2xl p-5 border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">বাজার বিশ্লেষণ</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    বর্তমানে ধান ও পাটের দাম বাড়ার প্রবণতা দেখা যাচ্ছে। আলুর দাম শীতকালে স্বাভাবিকভাবেই কমতে পারে। 
                    পেঁয়াজের দাম স্থিতিশীল থাকবে বলে ধারণা করা হচ্ছে।
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-3">
                    সর্বশেষ আপডেট: {new Date().toLocaleDateString('bn-BD')}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
