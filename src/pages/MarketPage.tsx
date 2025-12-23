import { useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2, LineChart, AlertCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { SEOHead } from "@/components/seo/SEOHead";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

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

const getTrendBg = (change: number) => {
  if (change > 0) return "bg-secondary/10";
  if (change < 0) return "bg-destructive/10";
  return "bg-muted/30";
};

const getForecastText = (forecast: string | null) => {
  switch (forecast) {
    case 'up': return 'বাড়বে';
    case 'down': return 'কমবে';
    default: return 'স্থিতিশীল';
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

  // Generate AI recommendations based on real data
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
      <div 
        className="min-h-screen pb-24"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10, 31, 23, 0.92), rgba(10, 31, 23, 0.98)), url(${villageBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Header */}
        <header className="px-4 pt-8 pb-4 sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/home"
                className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </Link>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-chart-2/30 to-primary/20 flex items-center justify-center shadow-lg">
                <LineChart className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">বাজার দর</h1>
                <p className="text-sm text-muted-foreground">আজকের লাইভ মূল্য</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="rounded-xl"
            >
              <RefreshCw className={cn("w-5 h-5", (refreshing || loading) && "animate-spin")} />
            </Button>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <section className="px-4 py-4">
            <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI বিক্রয় পরামর্শ
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <Card 
                  key={index}
                  className={cn(
                    "bg-card/80 border-border overflow-hidden",
                    rec.action === 'এখনই বিক্রি করুন' && "border-l-4 border-l-destructive"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{rec.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-foreground">{rec.crop}</h3>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            rec.action === 'এখনই বিক্রি করুন' ? "bg-destructive/20 text-destructive" :
                            rec.action === 'অপেক্ষা করুন' ? "bg-secondary/20 text-secondary" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {rec.action}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">{rec.timing}</span>
                          <span className="text-xs text-primary">{rec.confidence}% আত্মবিশ্বাস</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Market Prices Table */}
        <section className="px-4 py-4">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-chart-2" />
            আজকের বাজার দর
          </h2>
          
          {!loading && prices.length === 0 && (
            <Card className="bg-card/50 border-border">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">বাজার দর লোড করতে সমস্যা হয়েছে</p>
                <Button onClick={handleRefresh} className="mt-4" variant="outline">
                  আবার চেষ্টা করুন
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {prices.map((item, index) => {
              const change = item.today_price - item.yesterday_price;
              const changePercent = ((change / item.yesterday_price) * 100).toFixed(1);
              
              return (
                <div 
                  key={item.id}
                  className={cn(
                    "bg-card border border-border rounded-xl p-4 hover:border-secondary/30 transition-all",
                    "animate-slide-up"
                  )}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.crop_emoji || '🌾'}</span>
                      <div>
                        <h3 className="font-medium text-foreground">{item.crop_name}</h3>
                        <p className="text-xs text-muted-foreground">{item.unit || 'টাকা/কেজি'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground">
                        ৳{item.today_price.toLocaleString('bn-BD')}
                      </p>
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-medium justify-end",
                        getTrendColor(change)
                      )}>
                        {getTrendIcon(change)}
                        <span>{change >= 0 ? '+' : ''}{change.toLocaleString('bn-BD')} ({changePercent}%)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      সাপ্তাহিক গড়: ৳{(item.weekly_avg || item.today_price).toLocaleString('bn-BD')}
                    </span>
                    {item.forecast && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full",
                        getTrendBg(item.forecast === 'up' ? 1 : item.forecast === 'down' ? -1 : 0),
                        getTrendColor(item.forecast === 'up' ? 1 : item.forecast === 'down' ? -1 : 0)
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

        {/* Market Insights */}
        <section className="px-4 py-4">
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                বাজার বিশ্লেষণ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">
                বর্তমানে ধান ও পাটের দাম বাড়ার প্রবণতা দেখা যাচ্ছে। আলুর দাম শীতকালে স্বাভাবিকভাবেই কমতে পারে। 
                পেঁয়াজের দাম স্থিতিশীল থাকবে বলে ধারণা করা হচ্ছে।
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                সর্বশেষ আপডেট: {new Date().toLocaleDateString('bn-BD')}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
