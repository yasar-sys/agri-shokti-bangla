import { ArrowLeft, CloudLightning, Thermometer, Droplets, Wind, AlertTriangle, Leaf, Shield, RefreshCw, Sun, Snowflake, Loader2, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { useLiveWeatherAlerts } from "@/hooks/useLiveWeatherAlerts";
import { format } from "date-fns";

const iconMap = {
  thermometer: Thermometer,
  droplets: Droplets,
  wind: Wind,
  'cloud-lightning': CloudLightning,
  snowflake: Snowflake,
  sun: Sun
};

const severityColors = {
  critical: { bg: 'bg-destructive/20', text: 'text-destructive', border: 'border-destructive/50' },
  high: { bg: 'bg-destructive/15', text: 'text-destructive', border: 'border-destructive/40' },
  medium: { bg: 'bg-chart-2/20', text: 'text-chart-2', border: 'border-chart-2/50' },
  low: { bg: 'bg-secondary/20', text: 'text-secondary', border: 'border-secondary/50' }
};

const smartCrops = [
  { name: "তাপ সহনশীল ধান", variety: "BRRI-71", benefit: "৪০° পর্যন্ত সহ্য করে" },
  { name: "খরা সহনশীল গম", variety: "BARI গম-৩০", benefit: "কম পানিতে ফলন ভালো" },
  { name: "বন্যা সহনশীল ধান", variety: "BRRI-51", benefit: "২ সপ্তাহ জলাবদ্ধতা সহ্য করে" },
];

// Convert number to Bengali
const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
};

export default function ClimateAlertPage() {
  const { alerts, forecast, currentTemp, currentHumidity, currentWind, loading, error, lastUpdated, refetch } = useLiveWeatherAlerts();

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
        <div className="flex items-center justify-between">
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
              <p className="text-xs text-muted-foreground">লাইভ আবহাওয়া ডেটা থেকে</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </header>

      {/* Live Status Banner */}
      <div className="px-4 py-2">
        <div className="bg-secondary/10 border border-secondary/30 rounded-lg px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-secondary animate-pulse" />
            <span className="text-xs text-secondary font-medium">লাইভ আবহাওয়া</span>
          </div>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              আপডেট: {format(lastUpdated, 'hh:mm a')}
            </span>
          )}
        </div>
      </div>

      {/* Current Conditions */}
      <section className="px-4 py-2">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">বর্তমান অবস্থা</h3>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-secondary" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Thermometer className="w-5 h-5 text-destructive mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{toBengaliNumber(currentTemp)}°</p>
                <p className="text-xs text-muted-foreground">তাপমাত্রা</p>
              </div>
              <div>
                <Droplets className="w-5 h-5 text-chart-3 mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{toBengaliNumber(currentHumidity)}%</p>
                <p className="text-xs text-muted-foreground">আর্দ্রতা</p>
              </div>
              <div>
                <Wind className="w-5 h-5 text-chart-2 mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{toBengaliNumber(currentWind)}</p>
                <p className="text-xs text-muted-foreground">কি.মি./ঘ.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Active Alerts */}
      <section className="px-4 py-4">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          সক্রিয় সতর্কতা
          {alerts.length > 0 && (
            <span className="ml-auto text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
              {toBengaliNumber(alerts.length)} টি
            </span>
          )}
        </h2>
        
        {loading ? (
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-secondary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">আবহাওয়া ডেটা লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="bg-card/80 backdrop-blur-sm border border-destructive/30 rounded-xl p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              আবার চেষ্টা করুন
            </Button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 text-center">
            <Shield className="w-10 h-10 text-secondary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">কোনো সতর্কতা নেই</p>
            <p className="text-xs text-muted-foreground mt-1">আবহাওয়া অনুকূল আছে</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const IconComponent = iconMap[alert.icon] || AlertTriangle;
              const colors = severityColors[alert.severity];
              
              return (
                <div key={alert.id} className={cn(
                  "bg-card/80 backdrop-blur-sm border-2 rounded-xl p-4",
                  colors.border
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={cn("w-5 h-5", colors.text)} />
                    <span className="text-sm font-semibold text-foreground">{alert.typeBn}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full ml-auto",
                      colors.bg, colors.text
                    )}>
                      {alert.severityBn} ঝুঁকি
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-2">{alert.message}</p>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">
                      <span className="text-secondary font-medium">পরামর্শ:</span> {alert.advice}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5-Day Forecast */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">৫ দিনের পূর্বাভাস</h2>
        {loading ? (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="flex-shrink-0 w-20 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 text-center animate-pulse">
                <div className="h-3 bg-muted rounded mb-2" />
                <div className="h-6 bg-muted rounded mb-1" />
                <div className="h-3 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {forecast.map((day, idx) => {
              const riskColors = severityColors[day.risk];
              
              return (
                <div key={idx} className="flex-shrink-0 w-24 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{day.dayBn}</p>
                  <p className="text-lg font-bold text-foreground">{toBengaliNumber(day.tempHigh)}°</p>
                  <p className="text-xs text-muted-foreground mb-1">{toBengaliNumber(day.tempLow)}°</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-chart-3 mb-1">
                    <Droplets className="w-3 h-3" />
                    {toBengaliNumber(day.rainChance)}%
                  </div>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    riskColors.bg, riskColors.text
                  )}>
                    {day.riskBn}
                  </span>
                </div>
              );
            })}
          </div>
        )}
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
