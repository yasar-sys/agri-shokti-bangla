import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Play, 
  ChevronRight, 
  Camera, 
  Bug, 
  Beaker, 
  LayoutDashboard, 
  TrendingUp, 
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Leaf,
  CloudSun,
  Shield,
  Award,
  Heart
} from "lucide-react";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import agriBrainLogo from "@/assets/agri-brain-logo.png";
import { Button } from "@/components/ui/button";

const challenges = [
  {
    id: 1,
    title: "ফসলের স্বাস্থ্য শনাক্তকরণ",
    titleEn: "Crop Health Detection",
    icon: Camera,
    color: "from-secondary/20 to-chart-3/20",
    iconColor: "text-secondary",
    description: "স্যাটেলাইট ও ক্যামেরা দিয়ে ফসলের রোগ, স্ট্রেস এবং গ্রোথ সমস্যা শনাক্ত করুন",
    features: [
      "📸 ফসলের পাতার ছবি তুলুন",
      "🤖 AI স্বয়ংক্রিয়ভাবে রোগ চিনবে",
      "💊 চিকিৎসার পরামর্শ পাবেন",
      "🛰️ NDVI ম্যাপে জমির স্বাস্থ্য দেখুন"
    ],
    steps: [
      { step: 1, text: "হোমপেজে 'রোগ শনাক্তকরণ' বাটনে ক্লিক করুন" },
      { step: 2, text: "ক্যামেরা দিয়ে আক্রান্ত পাতার ছবি তুলুন" },
      { step: 3, text: "'বিশ্লেষণ করুন' বাটনে ক্লিক করুন" },
      { step: 4, text: "AI রিপোর্ট দেখুন এবং চিকিৎসা অনুসরণ করুন" }
    ],
    link: "/camera"
  },
  {
    id: 2,
    title: "পোকামাকড় পূর্ব সতর্কতা",
    titleEn: "Pest & Disease Early Warning",
    icon: Bug,
    color: "from-destructive/20 to-chart-1/20",
    iconColor: "text-destructive",
    description: "আপনার এলাকায় কোন পোকার আক্রমণ হচ্ছে আগেই জানুন এবং সতর্ক থাকুন",
    features: [
      "🗺️ জেলাভিত্তিক পোকার ম্যাপ",
      "⚠️ আগাম সতর্কতা পান",
      "👨‍🌾 অন্য কৃষকদের রিপোর্ট দেখুন",
      "🛡️ প্রতিরোধমূলক ব্যবস্থা জানুন"
    ],
    steps: [
      { step: 1, text: "'পোকার ম্যাপ' বাটনে ক্লিক করুন" },
      { step: 2, text: "আপনার জেলা নির্বাচন করুন" },
      { step: 3, text: "বর্তমান পোকার অবস্থা দেখুন" },
      { step: 4, text: "প্রতিরোধ পরামর্শ অনুসরণ করুন" }
    ],
    link: "/pest-map"
  },
  {
    id: 3,
    title: "সার ও সেচ সুপারিশ",
    titleEn: "Fertilizer & Irrigation Recommender",
    icon: Beaker,
    color: "from-chart-4/20 to-chart-5/20",
    iconColor: "text-chart-4",
    description: "সঠিক মাত্রায় সার ও সেচ দিন, অপচয় রোধ করুন এবং ফলন বাড়ান",
    features: [
      "🧮 NPK ক্যালকুলেটর",
      "📦 সারের প্যাকেট স্ক্যান",
      "💧 সেচের সময়সূচী",
      "🌱 ফসল অনুযায়ী ডোজ"
    ],
    steps: [
      { step: 1, text: "'সার ক্যালকুলেটর' বাটনে ক্লিক করুন" },
      { step: 2, text: "ফসলের নাম এবং জমির পরিমাণ দিন" },
      { step: 3, text: "AI সার ডোজ এবং সময়সূচী দেবে" },
      { step: 4, text: "সার স্ক্যান দিয়ে আসল সার যাচাই করুন" }
    ],
    link: "/npk-calculator"
  },
  {
    id: 4,
    title: "কৃষক সিদ্ধান্ত ড্যাশবোর্ড",
    titleEn: "Farmer Decision Dashboard",
    icon: LayoutDashboard,
    color: "from-primary/20 to-secondary/20",
    iconColor: "text-primary",
    description: "আবহাওয়া, মাটি, বাজার দর - সব তথ্য এক জায়গায় পান এবং সঠিক সিদ্ধান্ত নিন",
    features: [
      "🌤️ রিয়েল-টাইম আবহাওয়া",
      "📅 ফার্মিং ক্যালেন্ডার",
      "⚡ জলবায়ু সতর্কতা",
      "💡 দৈনিক কৃষি টিপস"
    ],
    steps: [
      { step: 1, text: "হোমপেজে আবহাওয়া ও টিপস দেখুন" },
      { step: 2, text: "'ফার্মিং ক্যালেন্ডার' এ কাজের সময়সূচী দেখুন" },
      { step: 3, text: "'জলবায়ু সতর্কতা' এ দুর্যোগ সতর্কতা পান" },
      { step: 4, text: "AI এর পরামর্শ অনুযায়ী কাজ করুন" }
    ],
    link: "/home"
  },
  {
    id: 5,
    title: "বাজার মূল্য পূর্বাভাস",
    titleEn: "Farm-to-Market Price Forecasting",
    icon: TrendingUp,
    color: "from-chart-2/20 to-chart-3/20",
    iconColor: "text-chart-2",
    description: "AI দিয়ে ফসলের দাম পূর্বাভাস পান, সঠিক সময়ে বিক্রি করে বেশি লাভ করুন",
    features: [
      "📊 লাইভ বাজার দর",
      "🔮 ৭ দিনের দাম পূর্বাভাস",
      "💰 বিক্রি কৌশল সুপারিশ",
      "🚛 সাপ্লাই চেইন টিপস"
    ],
    steps: [
      { step: 1, text: "'বাজার দর' বাটনে ক্লিক করুন" },
      { step: 2, text: "'AI পূর্বাভাস' ট্যাবে দাম দেখুন" },
      { step: 3, text: "'বিক্রি কৌশল' ট্যাবে সুপারিশ পড়ুন" },
      { step: 4, text: "AI এর পরামর্শ অনুযায়ী বিক্রি করুন" }
    ],
    link: "/market"
  },
  {
    id: 6,
    title: "AI কৃষি সহায়ক",
    titleEn: "Custom AgriTech - AI Assistant",
    icon: MessageSquare,
    color: "from-chart-5/20 to-primary/20",
    iconColor: "text-chart-5",
    description: "বাংলায় যেকোনো কৃষি প্রশ্ন করুন, AI তাৎক্ষণিক উত্তর দেবে",
    features: [
      "💬 বাংলায় কথা বলুন",
      "🎤 ভয়েস ইনপুট সাপোর্ট",
      "🧠 স্মার্ট AI উত্তর",
      "📚 কৃষি জ্ঞানভাণ্ডার"
    ],
    steps: [
      { step: 1, text: "'AI সহায়ক' বাটনে ক্লিক করুন" },
      { step: 2, text: "বাংলায় আপনার প্রশ্ন লিখুন বা বলুন" },
      { step: 3, text: "AI এর উত্তর পড়ুন" },
      { step: 4, text: "আরও প্রশ্ন করুন বা সাজেশন ফলো করুন" }
    ],
    link: "/chat"
  }
];

const quickStartSteps = [
  { icon: Smartphone, title: "অ্যাপ ইনস্টল", description: "ফোনে অ্যাপ খুলুন বা ওয়েবসাইট ভিজিট করুন" },
  { icon: Shield, title: "অ্যাকাউন্ট তৈরি", description: "ইমেইল দিয়ে রেজিস্টার করুন (ফ্রি!)" },
  { icon: Leaf, title: "ফিচার ব্যবহার", description: "হোমপেজ থেকে যেকোনো সেবা নির্বাচন করুন" },
  { icon: Award, title: "পয়েন্ট অর্জন", description: "ব্যবহার করে পয়েন্ট ও র‍্যাংক অর্জন করুন" }
];

export default function DemoPage() {
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [showSteps, setShowSteps] = useState(false);

  const currentChallenge = challenges[activeChallenge];

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
        <div className="absolute inset-0 bg-background/92 backdrop-blur-sm" />
      </div>

      {/* Header */}
      <header className="px-4 pt-6 pb-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">অ্যাপ টিউটোরিয়াল</h1>
            <p className="text-xs text-muted-foreground">নতুন কৃষকদের জন্য সম্পূর্ণ গাইড</p>
          </div>
          <img src={agriBrainLogo} alt="Logo" className="w-10 h-10 rounded-xl" />
        </div>
      </header>

      {/* Welcome Section */}
      <section className="px-4 py-6">
        <div className="bg-gradient-to-br from-primary/20 via-secondary/10 to-chart-4/20 rounded-2xl p-6 border border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-destructive animate-pulse" />
              <span className="text-sm text-primary font-medium">স্বাগতম!</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              আসসালামু আলাইকুম, কৃষক ভাই!
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              agriশক্তি হলো বাংলাদেশের কৃষকদের জন্য তৈরি একটি AI-চালিত স্মার্ট কৃষি অ্যাপ। 
              এই টিউটোরিয়ালে আপনি শিখবেন কিভাবে সব ফিচার ব্যবহার করবেন।
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          দ্রুত শুরু করুন
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {quickStartSteps.map((item, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-xl p-3 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 AgriTech Challenges */}
      <section className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Play className="w-5 h-5 text-secondary" />
          ৬টি প্রধান ফিচার
        </h3>
        
        {/* Challenge Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {challenges.map((challenge, index) => (
            <button
              key={challenge.id}
              onClick={() => {
                setActiveChallenge(index);
                setShowSteps(false);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeChallenge === index
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {challenge.id}. {challenge.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Active Challenge Card */}
        <div className={`bg-gradient-to-br ${currentChallenge.color} rounded-2xl border border-border overflow-hidden animate-scale-in`}>
          {/* Challenge Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-start gap-3">
              <div className={`w-14 h-14 rounded-xl bg-card flex items-center justify-center`}>
                <currentChallenge.icon className={`w-7 h-7 ${currentChallenge.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
                    চ্যালেঞ্জ #{currentChallenge.id}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-foreground mt-1">{currentChallenge.title}</h4>
                <p className="text-xs text-muted-foreground">{currentChallenge.titleEn}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              {currentChallenge.description}
            </p>
          </div>

          {/* Features */}
          <div className="p-4 bg-card/30">
            <h5 className="text-sm font-semibold text-foreground mb-2">এই ফিচারে পাবেন:</h5>
            <div className="grid grid-cols-2 gap-2">
              {currentChallenge.features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-card/50 rounded-lg px-3 py-2 text-xs text-foreground animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Steps Toggle */}
          <div className="p-4 border-t border-border/50">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowSteps(!showSteps)}
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                কিভাবে ব্যবহার করবেন?
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showSteps ? 'rotate-90' : ''}`} />
            </Button>

            {showSteps && (
              <div className="mt-4 space-y-3 animate-fade-in">
                {currentChallenge.steps.map((step, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 bg-card/50 rounded-xl p-3 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-foreground">{step.step}</span>
                    </div>
                    <p className="text-sm text-foreground pt-1">{step.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Try Now Button */}
          <div className="p-4 bg-card/50">
            <Link to={currentChallenge.link}>
              <Button className="w-full gap-2">
                <Play className="w-4 h-4" />
                এখনই চেষ্টা করুন
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Placeholder */}
      <section className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Play className="w-5 h-5 text-chart-4" />
          ভিডিও টিউটোরিয়াল
        </h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-chart-4/20 to-chart-5/20 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
            <div className="text-center z-10">
              <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-primary/30">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-foreground font-medium">ভিডিও শীঘ্রই আসছে</p>
              <p className="text-xs text-muted-foreground">সম্পূর্ণ অ্যাপ ডেমো</p>
            </div>
          </div>
          <div className="p-4">
            <h4 className="font-semibold text-foreground mb-1">agriশক্তি সম্পূর্ণ গাইড</h4>
            <p className="text-xs text-muted-foreground">৫ মিনিটে শিখুন সব ফিচার ব্যবহার করতে</p>
          </div>
        </div>
      </section>

      {/* Pro Tips */}
      <section className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-chart-3" />
          সেরা টিপস
        </h3>
        <div className="space-y-2">
          {[
            { emoji: "💡", tip: "প্রতিদিন অ্যাপ ব্যবহার করুন, XP পয়েন্ট পাবেন" },
            { emoji: "📸", tip: "পরিষ্কার ছবি তুলুন, AI ভালো ফলাফল দেবে" },
            { emoji: "🔔", tip: "নোটিফিকেশন চালু রাখুন, সতর্কতা মিস হবে না" },
            { emoji: "👨‍🌾", tip: "কমিউনিটিতে যোগ দিন, অন্য কৃষকদের থেকে শিখুন" },
            { emoji: "📊", tip: "বাজার দর নিয়মিত চেক করুন, সঠিক সময়ে বিক্রি করুন" }
          ].map((item, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-xl">{item.emoji}</span>
              <p className="text-sm text-foreground">{item.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Credit */}
      <section className="px-4 mb-6">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 border border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">তৈরি করেছে</p>
          <p className="text-lg font-bold text-foreground">TEAM_NEWBIES</p>
        </div>
      </section>

      {/* Start Using Button */}
      <section className="px-4 pb-6">
        <Link to="/home">
          <Button className="w-full h-14 text-lg gap-2" size="lg">
            <Sparkles className="w-5 h-5" />
            অ্যাপ ব্যবহার শুরু করুন
          </Button>
        </Link>
      </section>
    </div>
  );
}
