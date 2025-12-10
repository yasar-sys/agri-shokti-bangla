import { Cloud, Droplets, Wind, Sun, Thermometer, Gauge } from "lucide-react";

export default function WeatherPage() {
  // Mock data - would come from GET /api/weather and GET /api/soil
  const weatherData = {
    temp: 28,
    humidity: 75,
    wind: 12,
    condition: "আংশিক মেঘলা",
    forecast: [
      { day: "আজ", high: 32, low: 24, icon: "☀️" },
      { day: "আগামীকাল", high: 30, low: 23, icon: "⛅" },
      { day: "পরশু", high: 28, low: 22, icon: "🌧️" },
    ],
  };

  const soilData = {
    moisture: 65,
    ph: 6.5,
    nitrogen: "মধ্যম",
    recommendation: "মাটিতে আর্দ্রতা পর্যাপ্ত। সেচের প্রয়োজন নেই।",
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-foreground">আবহাওয়া ও মাটি</h1>
        <p className="text-muted-foreground">আজকের তথ্য</p>
      </header>

      {/* Current Weather */}
      <section className="px-4 mb-6">
        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-card to-muted/50 border border-border overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <Sun className="w-full h-full text-primary" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>GET /api/weather • লাইভ</span>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-start">
                  <span className="text-6xl font-bold text-foreground">{weatherData.temp}</span>
                  <span className="text-2xl text-muted-foreground mt-2">°C</span>
                </div>
                <p className="text-lg text-muted-foreground mt-1">{weatherData.condition}</p>
              </div>
              <Cloud className="w-20 h-20 text-secondary" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Droplets className="w-6 h-6 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">আর্দ্রতা</p>
                  <p className="font-semibold text-foreground">{weatherData.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Wind className="w-6 h-6 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">বাতাস</p>
                  <p className="font-semibold text-foreground">{weatherData.wind} কি.মি./ঘ.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forecast */}
      <section className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">আগামী দিনের পূর্বাভাস</h2>
        <div className="flex gap-3">
          {weatherData.forecast.map((day, index) => (
            <div
              key={index}
              className="flex-1 p-4 rounded-xl bg-card border border-border text-center"
            >
              <p className="text-sm text-muted-foreground mb-2">{day.day}</p>
              <span className="text-2xl">{day.icon}</span>
              <div className="mt-2">
                <p className="font-semibold text-foreground">{day.high}°</p>
                <p className="text-sm text-muted-foreground">{day.low}°</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Soil Data */}
      <section className="px-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">মাটির তথ্য</h2>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>GET /api/soil</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <Droplets className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">আর্দ্রতা</p>
              <p className="font-semibold text-foreground">{soilData.moisture}%</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <Gauge className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">pH</p>
              <p className="font-semibold text-foreground">{soilData.ph}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <Thermometer className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">নাইট্রোজেন</p>
              <p className="font-semibold text-foreground">{soilData.nitrogen}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
            <p className="text-sm text-foreground">
              <strong>AI পরামর্শ:</strong> {soilData.recommendation}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
