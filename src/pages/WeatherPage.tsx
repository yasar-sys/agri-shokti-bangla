import { useState } from "react";
import { Cloud, Droplets, Wind, Sun, Thermometer, Gauge, MapPin, ChevronDown, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// বাংলাদেশের বিভাগ ও জেলা সমূহ
const locations = [
  { id: "dhaka", name: "ঢাকা", division: "ঢাকা বিভাগ" },
  { id: "chittagong", name: "চট্টগ্রাম", division: "চট্টগ্রাম বিভাগ" },
  { id: "rajshahi", name: "রাজশাহী", division: "রাজশাহী বিভাগ" },
  { id: "khulna", name: "খুলনা", division: "খুলনা বিভাগ" },
  { id: "sylhet", name: "সিলেট", division: "সিলেট বিভাগ" },
  { id: "barisal", name: "বরিশাল", division: "বরিশাল বিভাগ" },
  { id: "rangpur", name: "রংপুর", division: "রংপুর বিভাগ" },
  { id: "mymensingh", name: "ময়মনসিংহ", division: "ময়মনসিংহ বিভাগ" },
  { id: "comilla", name: "কুমিল্লা", division: "চট্টগ্রাম বিভাগ" },
  { id: "gazipur", name: "গাজীপুর", division: "ঢাকা বিভাগ" },
  { id: "narayanganj", name: "নারায়ণগঞ্জ", division: "ঢাকা বিভাগ" },
  { id: "bogra", name: "বগুড়া", division: "রাজশাহী বিভাগ" },
  { id: "dinajpur", name: "দিনাজপুর", division: "রংপুর বিভাগ" },
  { id: "jessore", name: "যশোর", division: "খুলনা বিভাগ" },
  { id: "coxsbazar", name: "কক্সবাজার", division: "চট্টগ্রাম বিভাগ" },
];

// Mock weather data based on location
const getWeatherData = (locationId: string) => {
  const baseData = {
    dhaka: { temp: 32, humidity: 78, wind: 14, condition: "গরম ও আর্দ্র" },
    chittagong: { temp: 30, humidity: 82, wind: 18, condition: "মেঘলা" },
    rajshahi: { temp: 35, humidity: 55, wind: 10, condition: "রোদ ঝলমলে" },
    khulna: { temp: 31, humidity: 80, wind: 12, condition: "আংশিক মেঘলা" },
    sylhet: { temp: 28, humidity: 88, wind: 8, condition: "বৃষ্টির সম্ভাবনা" },
    barisal: { temp: 30, humidity: 85, wind: 15, condition: "মেঘলা" },
    rangpur: { temp: 29, humidity: 65, wind: 12, condition: "পরিষ্কার" },
    mymensingh: { temp: 31, humidity: 75, wind: 10, condition: "আংশিক মেঘলা" },
    comilla: { temp: 30, humidity: 80, wind: 11, condition: "মেঘলা" },
    gazipur: { temp: 33, humidity: 76, wind: 13, condition: "গরম" },
    narayanganj: { temp: 32, humidity: 79, wind: 12, condition: "আর্দ্র" },
    bogra: { temp: 34, humidity: 58, wind: 9, condition: "রোদ" },
    dinajpur: { temp: 28, humidity: 62, wind: 14, condition: "পরিষ্কার" },
    jessore: { temp: 33, humidity: 68, wind: 11, condition: "গরম" },
    coxsbazar: { temp: 29, humidity: 85, wind: 22, condition: "সামুদ্রিক বাতাস" },
  };
  
  const data = baseData[locationId as keyof typeof baseData] || baseData.dhaka;
  
  return {
    ...data,
    forecast: [
      { day: "আজ", high: data.temp + 2, low: data.temp - 6, icon: "☀️" },
      { day: "আগামীকাল", high: data.temp + 1, low: data.temp - 7, icon: "⛅" },
      { day: "পরশু", high: data.temp - 1, low: data.temp - 8, icon: "🌧️" },
    ],
  };
};

export default function WeatherPage() {
  const [selectedLocation, setSelectedLocation] = useState("dhaka");
  
  const currentLocation = locations.find(l => l.id === selectedLocation);
  const weatherData = getWeatherData(selectedLocation);

  const soilData = {
    moisture: 65,
    ph: 6.5,
    nitrogen: "মধ্যম",
    recommendation: "মাটিতে আর্দ্রতা পর্যাপ্ত। সেচের প্রয়োজন নেই।",
  };

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
        <h1 className="text-2xl font-bold text-foreground">আবহাওয়া ও মাটি</h1>
        <p className="text-muted-foreground">আজকের তথ্য</p>
      </header>

      {/* Location Selector */}
      <section className="px-4 mb-4">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">আপনার এলাকা নির্বাচন করুন</span>
          </div>
          
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full bg-muted/50 border-border">
              <SelectValue placeholder="এলাকা নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border max-h-64">
              {locations.map((location) => (
                <SelectItem 
                  key={location.id} 
                  value={location.id}
                  className="focus:bg-muted"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{location.name}</span>
                    <span className="text-xs text-muted-foreground">{location.division}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {currentLocation && (
            <div className="mt-3 flex items-center gap-2 text-sm text-secondary">
              <Check className="w-4 h-4" />
              <span>{currentLocation.name}, {currentLocation.division}</span>
            </div>
          )}
        </div>
      </section>

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
