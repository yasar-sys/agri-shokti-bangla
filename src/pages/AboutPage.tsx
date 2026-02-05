import { ArrowLeft, Leaf, Target, Users, Zap, Shield, Globe, Brain, Camera, MessageSquare, TrendingUp, CloudLightning, Sparkles, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import logo from "@/assets/agri-brain-logo.png";

const features = [
  {
    icon: Camera,
    title: "AI রোগ শনাক্তকরণ",
    titleEn: "AI Disease Detection",
    description: "Google Gemini AI দিয়ে ফসলের ছবি বিশ্লেষণ করে ৩ সেকেন্ডে রোগ শনাক্ত ও চিকিৎসা পরামর্শ",
    color: "text-destructive"
  },
  {
    icon: MessageSquare,
    title: "RAG চ্যাটবট",
    titleEn: "RAG-Powered Chatbot",
    description: "কৃষি জ্ঞানভাণ্ডার থেকে সঠিক তথ্য সহ বাংলায় AI চ্যাট সহায়তা",
    color: "text-secondary"
  },
  {
    icon: TrendingUp,
    title: "বাজার দর পূর্বাভাস",
    titleEn: "Market Price Forecast",
    description: "AI-চালিত বাজার দামের বিশ্লেষণ ও ভবিষ্যৎ দামের পূর্বাভাস",
    color: "text-chart-3"
  },
  {
    icon: CloudLightning,
    title: "জলবায়ু সতর্কতা",
    titleEn: "Climate Alerts",
    description: "লাইভ আবহাওয়া ডেটা থেকে স্বয়ংক্রিয় দুর্যোগ সতর্কতা ও পরামর্শ",
    color: "text-chart-2"
  },
  {
    icon: Leaf,
    title: "স্যাটেলাইট NDVI",
    titleEn: "Satellite NDVI",
    description: "NASA স্যাটেলাইট থেকে ফসলের স্বাস্থ্য বিশ্লেষণ ও হিটম্যাপ",
    color: "text-primary"
  },
  {
    icon: Users,
    title: "ফসল বিনিময়",
    titleEn: "Crop Barter",
    description: "কৃষকদের মধ্যে সরাসরি ফসল বিনিময় প্ল্যাটফর্ম",
    color: "text-accent"
  }
];

 const teamMembers = [
   { name: "সামিন ইয়াসার", role: "টিম মেম্বার", roleEn: "Team Member" },
   { name: "রাহিয়াতুল জান্নাত", role: "টিম মেম্বার", roleEn: "Team Member" },
   { name: "মাজহারুল ইসলাম আবিদ", role: "টিম মেম্বার", roleEn: "Team Member" }
 ];

const impactStats = [
  { label: "টার্গেট কৃষক", value: "৩.৫ কোটি+", icon: Users },
  { label: "রোগ শনাক্তকরণ সময়", value: "< ১ মিনিট", icon: Zap },
  { label: "ফসল ক্ষতি হ্রাস", value: "১৫-২৫%", icon: Shield },
  { label: "সাশ্রয়", value: "৳৫-১০ হাজার/বছর", icon: TrendingUp }
];

export default function AboutPage() {
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
        <div className="flex items-center gap-3">
          <Link to="/home">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              অ্যাপ সম্পর্কে
            </h1>
            <p className="text-xs text-muted-foreground">AgriShokti - AI কৃষি সহায়তা</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-6">
        <div className="bg-gradient-to-br from-secondary/20 to-primary/10 rounded-2xl p-6 border border-border text-center">
          <img src={logo} alt="AgriShokti Logo" className="w-20 h-20 mx-auto mb-4 rounded-2xl" />
          <h2 className="text-2xl font-bold text-foreground mb-2">agriশক্তি</h2>
          <p className="text-sm text-muted-foreground mb-4">AI-Powered Agricultural Assistant for Bangladesh</p>
          <div className="flex items-center justify-center gap-2 text-xs text-secondary">
            <Globe className="w-4 h-4" />
            <span>বাংলাদেশের কৃষকদের জন্য তৈরি</span>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="px-4 mb-6">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">আমাদের ভিশন</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            বাংলাদেশের ৩.৫ কোটি কৃষক পরিবারকে AI প্রযুক্তি দিয়ে ক্ষমতায়িত করা। 
            ফসলের রোগ শনাক্তকরণ, আবহাওয়া পূর্বাভাস, বাজার দর বিশ্লেষণ এবং 
            কৃষি পরামর্শ - সব কিছু একটি অ্যাপে, বাংলা ভাষায়।
          </p>
          <div className="bg-primary/10 rounded-lg p-3">
            <p className="text-xs text-primary font-medium">
              "প্রতি বছর ৩০-৪০% ফসল ক্ষতি - এই সমস্যার AI সমাধান"
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 mb-6">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold text-foreground">আমাদের মিশন</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              কৃষকদের হাতে AI প্রযুক্তি পৌঁছে দেওয়া
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              রোগ শনাক্তকরণের সময় ২-৩ দিন থেকে ১ মিনিটে কমানো
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              মধ্যস্বত্বভোগী ছাড়া ন্যায্য বাণিজ্যের সুযোগ
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              জলবায়ু পরিবর্তনে অভিযোজন সহায়তা
            </li>
          </ul>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 mb-6">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-chart-2" />
          প্রধান ফিচারসমূহ
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3">
              <feature.icon className={`w-6 h-6 ${feature.color} mb-2`} />
              <h4 className="text-sm font-medium text-foreground mb-1">{feature.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Stats */}
      <section className="px-4 mb-6">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          প্রত্যাশিত প্রভাব
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {impactStats.map((stat, idx) => (
            <div key={idx} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 text-center">
              <stat.icon className="w-5 h-5 text-secondary mx-auto mb-2" />
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-4 mb-6">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-3">প্রযুক্তি স্ট্যাক</h3>
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "Supabase", "Google Gemini AI", "NASA NDVI", "Open-Meteo", "PWA", "Tailwind CSS"].map((tech, idx) => (
              <span key={idx} className="px-2 py-1 bg-muted/50 rounded-full text-xs text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-4 mb-6">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-secondary" />
             টিম পরিচিতি
          </h3>
          <div className="space-y-2">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
             <div className="mt-3 pt-3 border-t border-border/50 text-center">
               <p className="text-xs text-muted-foreground">ময়মনসিংহ ইঞ্জিনিয়ারিং কলেজ</p>
             </div>
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="px-4 mb-6">
        <div className="bg-gradient-to-br from-primary/20 to-secondary/10 rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground mb-3">ভবিষ্যৎ পরিকল্পনা</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              ভারত, নেপাল, শ্রীলঙ্কায় সম্প্রসারণ
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              মাল্টি-ল্যাঙ্গুয়েজ সাপোর্ট (হিন্দি, তামিল)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              ড্রোন ইন্টিগ্রেশন ও প্রিসিশন ফার্মিং
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              ব্লকচেইন-ভিত্তিক ফসল ট্রেসেবিলিটি
            </li>
          </ul>
        </div>
      </section>

      {/* Version Info */}
      <section className="px-4">
        <div className="text-center text-xs text-muted-foreground">
          <p>Version 1.0.0</p>
          <p className="mt-1">© 2025 AgriShokti - Team NEWBIES</p>
          <p className="mt-1">Made with ❤️ for Bangladeshi Farmers</p>
        </div>
      </section>
    </div>
  );
}
