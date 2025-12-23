import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Download,
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
  Shield,
  Award,
  Heart,
  Phone,
  MapPin,
  Search,
  Building2
} from "lucide-react";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import agriBrainLogo from "@/assets/agri-brain-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface AgriContact {
  id: string;
  division: string;
  district: string;
  upazila: string;
  office_name: string;
  officer_name: string | null;
  phone: string;
  email: string | null;
  address: string | null;
}

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

const pwaSteps = [
  { platform: "Android (Chrome)", steps: [
    "১. Chrome ব্রাউজারে অ্যাপ খুলুন",
    "২. উপরে ডানদিকে ⋮ (তিন ডট) মেনুতে ক্লিক করুন",
    "৩. 'Add to Home screen' বা 'হোম স্ক্রিনে যোগ করুন' অপশনে ক্লিক করুন",
    "৪. নাম দিয়ে 'Add' বাটনে ক্লিক করুন",
    "৫. আপনার হোম স্ক্রিনে অ্যাপ আইকন দেখতে পাবেন!"
  ]},
  { platform: "iPhone (Safari)", steps: [
    "১. Safari ব্রাউজারে অ্যাপ খুলুন",
    "২. নিচে শেয়ার আইকনে (⬆️) ক্লিক করুন",
    "৩. স্ক্রল করে 'Add to Home Screen' অপশন খুঁজুন",
    "৪. নাম দিয়ে 'Add' বাটনে ক্লিক করুন",
    "৫. আপনার হোম স্ক্রিনে অ্যাপ আইকন দেখতে পাবেন!"
  ]},
  { platform: "Desktop (Chrome/Edge)", steps: [
    "১. ব্রাউজারে অ্যাপ খুলুন",
    "২. URL বারে ডানদিকে ইনস্টল আইকন (📥) দেখুন",
    "৩. 'Install' বাটনে ক্লিক করুন",
    "৪. অ্যাপ আপনার ডেস্কটপে ইনস্টল হয়ে যাবে!"
  ]}
];

export default function DemoPage() {
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const [contacts, setContacts] = useState<AgriContact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const { language } = useLanguage();

  const currentChallenge = challenges[activeChallenge];

  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase
        .from('agriculture_contacts')
        .select('*')
        .order('division', { ascending: true });
      
      if (data) setContacts(data);
    };
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(c => 
    c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.upazila.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.division.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-xl font-bold text-foreground">
              {language === 'bn' ? 'অ্যাপ গাইড' : 'App Guide'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {language === 'bn' ? 'সম্পূর্ণ গাইড ও সাহায্য' : 'Complete guide & help'}
            </p>
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
              <span className="text-sm text-primary font-medium">
                {language === 'bn' ? 'স্বাগতম!' : 'Welcome!'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {language === 'bn' ? 'আসসালামু আলাইকুম, কৃষক ভাই!' : 'Welcome, Farmer!'}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {language === 'bn' 
                ? 'agriশক্তি হলো বাংলাদেশের কৃষকদের জন্য তৈরি একটি AI-চালিত স্মার্ট কৃষি অ্যাপ। এই গাইডে আপনি শিখবেন কিভাবে অ্যাপ ইনস্টল ও ব্যবহার করবেন।'
                : 'agriShokti is an AI-powered smart agriculture app for Bangladesh farmers. This guide will help you install and use the app.'}
            </p>
          </div>
        </div>
      </section>

      {/* PWA Install Guide */}
      <section className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          {language === 'bn' ? 'অ্যাপ ইনস্টল করুন (PWA)' : 'Install App (PWA)'}
        </h3>
        <div className="space-y-3">
          {pwaSteps.map((item, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  {item.platform}
                </h4>
              </div>
              <div className="p-4 space-y-2">
                {item.steps.map((step, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    {step}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {language === 'bn' ? 'দ্রুত শুরু করুন' : 'Quick Start'}
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

      {/* Agriculture Department Contacts */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-secondary" />
            {language === 'bn' ? 'কৃষি অধিদপ্তর যোগাযোগ' : 'Agriculture Dept. Contacts'}
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowContacts(!showContacts)}
          >
            {showContacts ? (language === 'bn' ? 'লুকান' : 'Hide') : (language === 'bn' ? 'দেখুন' : 'View')}
          </Button>
        </div>
        
        {showContacts && (
          <div className="space-y-3 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={language === 'bn' ? "জেলা বা উপজেলা খুঁজুন..." : "Search district or upazila..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredContacts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  {language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No results found'}
                </p>
              ) : (
                filteredContacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{contact.office_name}</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{contact.upazila}, {contact.district}, {contact.division}</span>
                        </div>
                        {contact.officer_name && (
                          <p className="text-xs text-muted-foreground mt-1">{contact.officer_name}</p>
                        )}
                      </div>
                      <a 
                        href={`tel:${contact.phone}`}
                        className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0"
                      >
                        <Phone className="w-5 h-5 text-secondary" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <a href={`tel:${contact.phone}`} className="text-sm text-primary">
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* 6 AgriTech Features */}
      <section className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          {language === 'bn' ? '৬টি প্রধান ফিচার' : '6 Main Features'}
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
                    {language === 'bn' ? `ফিচার #${currentChallenge.id}` : `Feature #${currentChallenge.id}`}
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
            <h5 className="text-sm font-semibold text-foreground mb-2">
              {language === 'bn' ? 'এই ফিচারে পাবেন:' : 'Features:'}
            </h5>
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
                {language === 'bn' ? 'কিভাবে ব্যবহার করবেন?' : 'How to use?'}
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
                <Sparkles className="w-4 h-4" />
                {language === 'bn' ? 'এখনই চেষ্টা করুন' : 'Try Now'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="px-4">
        <Link to="/support">
          <div className="bg-gradient-to-br from-chart-5/20 to-primary/20 rounded-2xl p-6 border border-border text-center">
            <h3 className="text-lg font-bold text-foreground mb-2">
              {language === 'bn' ? 'আরও সাহায্য প্রয়োজন?' : 'Need more help?'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'bn' ? 'আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন' : 'Contact our support team'}
            </p>
            <Button variant="outline" className="gap-2">
              <Phone className="w-4 h-4" />
              {language === 'bn' ? 'সাপোর্টে যোগাযোগ' : 'Contact Support'}
            </Button>
          </div>
        </Link>
      </section>
    </div>
  );
}
