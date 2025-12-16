import { ArrowLeft, Warehouse, Plus, Package, Thermometer, Droplets, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { useState } from "react";

const storageData = [
  {
    id: 1,
    crop: "ধান (আমন)",
    quantity: "২০ মণ",
    location: "বাড়ির গোলা",
    type: "ঐতিহ্যবাহী",
    storedDate: "১৫ নভেম্বর ২০২৪",
    condition: "good",
    moisture: "১২%",
    temperature: "২৫°C"
  },
  {
    id: 2,
    crop: "গম",
    quantity: "১০ মণ",
    location: "সমবায় গুদাম",
    type: "আধুনিক",
    storedDate: "২০ অক্টোবর ২০২৪",
    condition: "excellent",
    moisture: "১০%",
    temperature: "২২°C"
  },
  {
    id: 3,
    crop: "আলু",
    quantity: "৫০ কেজি",
    location: "কোল্ড স্টোরেজ",
    type: "কোল্ড স্টোরেজ",
    storedDate: "০১ ডিসেম্বর ২০২৪",
    condition: "warning",
    moisture: "৮৫%",
    temperature: "৪°C"
  }
];

const storageTips = [
  { emoji: "🌾", tip: "ধান সংরক্ষণের আগে ভালোভাবে শুকিয়ে নিন (আর্দ্রতা ১২% এর নিচে)" },
  { emoji: "🥔", tip: "আলু ঠান্ডা ও অন্ধকার জায়গায় রাখুন, আলো থেকে দূরে রাখুন" },
  { emoji: "🧅", tip: "পেঁয়াজ শুষ্ক ও বাতাস চলাচল করে এমন জায়গায় রাখুন" },
  { emoji: "🏠", tip: "গুদামে ইঁদুর ও পোকামাকড় প্রতিরোধ ব্যবস্থা রাখুন" }
];

export default function StoragePage() {
  const [showAddForm, setShowAddForm] = useState(false);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-secondary bg-secondary/20';
      case 'good': return 'text-chart-4 bg-chart-4/20';
      case 'warning': return 'text-primary bg-primary/20';
      default: return 'text-destructive bg-destructive/20';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'চমৎকার';
      case 'good': return 'ভালো';
      case 'warning': return 'সতর্কতা';
      default: return 'ঝুঁকিপূর্ণ';
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
            <h1 className="text-xl font-bold text-foreground">গুদাম ব্যবস্থাপনা</h1>
            <p className="text-xs text-muted-foreground">ফসল সংরক্ষণ ট্র্যাকিং</p>
          </div>
          <Button size="icon" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Summary */}
      <section className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Package className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">৩</p>
            <p className="text-xs text-muted-foreground">মোট ফসল</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Warehouse className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">২</p>
            <p className="text-xs text-muted-foreground">গুদাম</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">১</p>
            <p className="text-xs text-muted-foreground">সতর্কতা</p>
          </div>
        </div>
      </section>

      {/* Storage List */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">সংরক্ষিত ফসল</h2>
        <div className="space-y-3">
          {storageData.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.crop}</h3>
                    <p className="text-xs text-muted-foreground">{item.quantity} • {item.location}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                  {getConditionText(item.condition)}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-background/50 rounded-lg p-2">
                  <Droplets className="w-4 h-4 text-chart-3 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">আর্দ্রতা</p>
                  <p className="text-sm font-medium text-foreground">{item.moisture}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-2">
                  <Thermometer className="w-4 h-4 text-destructive mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">তাপমাত্রা</p>
                  <p className="text-sm font-medium text-foreground">{item.temperature}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-2">
                  <CheckCircle2 className="w-4 h-4 text-chart-4 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">সংরক্ষণ</p>
                  <p className="text-sm font-medium text-foreground">{item.type}</p>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-3">
                সংরক্ষণের তারিখ: {item.storedDate}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Storage Tips */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">সংরক্ষণ টিপস</h2>
        <div className="space-y-2">
          {storageTips.map((item, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-3 flex items-start gap-3">
              <span className="text-xl">{item.emoji}</span>
              <p className="text-sm text-foreground">{item.tip}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
