import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Scan, 
  MessageSquare, 
  Bug, 
  Leaf, 
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart
} from "recharts";

// Agriculture problems solved by the app
const problemsSolvedData = [
  { name: "রোগ শনাক্তকরণ", solved: 1250, icon: "🔬", description: "ফসলের রোগ সনাক্ত করা হয়েছে" },
  { name: "সার পরামর্শ", solved: 890, icon: "🧪", description: "সঠিক সার সুপারিশ দেওয়া হয়েছে" },
  { name: "পোকা দমন", solved: 650, icon: "🐛", description: "পোকামাকড় দমনে সাহায্য করা হয়েছে" },
  { name: "বাজার দর", solved: 2100, icon: "📈", description: "ন্যায্য মূল্যে ফসল বিক্রি" },
  { name: "আবহাওয়া সতর্কতা", solved: 450, icon: "⛈️", description: "দুর্যোগ থেকে ফসল রক্ষা" },
  { name: "AI পরামর্শ", solved: 3200, icon: "🤖", description: "কৃষি সমস্যার সমাধান" },
];

// Monthly growth data
const monthlyGrowthData = [
  { month: "জানু", users: 120, scans: 340, chats: 890 },
  { month: "ফেব", users: 180, scans: 520, chats: 1100 },
  { month: "মার্চ", users: 250, scans: 680, chats: 1450 },
  { month: "এপ্রি", users: 320, scans: 890, chats: 1780 },
  { month: "মে", users: 410, scans: 1120, chats: 2100 },
  { month: "জুন", users: 520, scans: 1450, chats: 2680 },
];

// Disease distribution
const diseaseDistributionData = [
  { name: "ব্লাস্ট রোগ", value: 35, color: "#ef4444" },
  { name: "পাতা পোড়া", value: 25, color: "#f97316" },
  { name: "শিকড় পচা", value: 20, color: "#eab308" },
  { name: "ভাইরাস", value: 12, color: "#22c55e" },
  { name: "অন্যান্য", value: 8, color: "#3b82f6" },
];

// Crop-wise stats
const cropWiseData = [
  { crop: "ধান", problems: 450, solved: 420 },
  { crop: "গম", problems: 280, solved: 265 },
  { crop: "ভুট্টা", problems: 190, solved: 180 },
  { crop: "সবজি", problems: 320, solved: 300 },
  { crop: "ফল", problems: 210, solved: 195 },
];

// Farmer satisfaction
const satisfactionData = [
  { name: "খুব সন্তুষ্ট", value: 65, color: "#22c55e" },
  { name: "সন্তুষ্ট", value: 25, color: "#3b82f6" },
  { name: "মোটামুটি", value: 8, color: "#eab308" },
  { name: "অসন্তুষ্ট", value: 2, color: "#ef4444" },
];

// Impact metrics
const impactMetrics = [
  { label: "মোট কৃষক সেবা", value: "১২,৫০০+", icon: Users, color: "from-emerald-500 to-teal-500" },
  { label: "রোগ সনাক্ত", value: "৮,৫০০+", icon: Scan, color: "from-rose-500 to-pink-500" },
  { label: "AI পরামর্শ", value: "২৫,০০০+", icon: MessageSquare, color: "from-cyan-500 to-blue-500" },
  { label: "ফসল বাঁচানো", value: "৯৫%", icon: Leaf, color: "from-green-500 to-emerald-500" },
];

export default function ImpactAnalyticsPage() {
  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    // Animate the problem solved values
    const targetValues = problemsSolvedData.map(p => p.solved);
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      setAnimatedValues(targetValues.map(v => Math.round(v * easedProgress)));
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${villageBg})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
      
      {/* Content */}
      <div className="relative z-10 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 glass-strong border-b border-border/30">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Link to="/home">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gradient-premium flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  প্রভাব বিশ্লেষণ
                </h1>
                <p className="text-xs text-muted-foreground">AgriBrain এর সমস্যা সমাধান</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary animate-pulse" />
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-8">
          {/* Impact Metrics */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-secondary" />
              মোট প্রভাব
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {impactMetrics.map((metric, idx) => (
                <div 
                  key={idx}
                  className="glass-card rounded-2xl p-4 border border-border/30 hover:border-secondary/30 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3`}>
                    <metric.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Problems Solved Bar Chart */}
          <section className="glass-card rounded-2xl p-5 border border-border/30">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              সমস্যা সমাধান পরিসংখ্যান
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={problemsSolvedData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString('bn-BD')} টি`, 'সমাধান']}
                  />
                  <Bar 
                    dataKey="solved" 
                    fill="url(#barGradient)" 
                    radius={[0, 8, 8, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--secondary))" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Problem cards */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {problemsSolvedData.slice(0, 3).map((problem, idx) => (
                <div key={idx} className="bg-muted/30 rounded-xl p-3 text-center">
                  <span className="text-2xl">{problem.icon}</span>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {animatedValues[idx].toLocaleString('bn-BD')}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{problem.name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Monthly Growth Area Chart */}
          <section className="glass-card rounded-2xl p-5 border border-border/30">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary" />
              মাসিক বৃদ্ধি
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="chatGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="users" name="ব্যবহারকারী" stroke="#22c55e" fill="url(#userGradient)" />
                  <Area type="monotone" dataKey="scans" name="স্ক্যান" stroke="#3b82f6" fill="url(#scanGradient)" />
                  <Area type="monotone" dataKey="chats" name="চ্যাট" stroke="#f97316" fill="url(#chatGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Disease Distribution Pie Chart */}
          <section className="glass-card rounded-2xl p-5 border border-border/30">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Bug className="w-5 h-5 text-secondary" />
              রোগের বিতরণ
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diseaseDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {diseaseDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'শতাংশ']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {diseaseDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Crop-wise Problem Solving */}
          <section className="glass-card rounded-2xl p-5 border border-border/30">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-secondary" />
              ফসল ভিত্তিক সমাধান
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropWiseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="crop" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="problems" name="সমস্যা" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="solved" name="সমাধান" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Farmer Satisfaction Pie */}
          <section className="glass-card rounded-2xl p-5 border border-border/30">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-secondary" />
              কৃষক সন্তুষ্টি
            </h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${value}%`}
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {satisfactionData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Success Stories */}
          <section className="glass-card rounded-2xl p-5 border border-border/30">
            <h2 className="text-lg font-bold text-foreground mb-4">🌾 সাফল্যের গল্প</h2>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-500/20">
                <p className="text-sm text-foreground font-medium">
                  "AgriBrain এর AI দিয়ে আমার ধানের ব্লাস্ট রোগ সনাক্ত করে সময়মতো চিকিৎসা করেছি। এখন ফলন ৩০% বেশি!"
                </p>
                <p className="text-xs text-muted-foreground mt-2">— রহিম উদ্দিন, বগুড়া</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
                <p className="text-sm text-foreground font-medium">
                  "বাজার দর ফিচার দিয়ে আমি আমার সবজি সঠিক সময়ে বিক্রি করে ২০% বেশি লাভ পেয়েছি।"
                </p>
                <p className="text-xs text-muted-foreground mt-2">— ফাতেমা বেগম, যশোর</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-xl p-4 border border-purple-500/20">
                <p className="text-sm text-foreground font-medium">
                  "আবহাওয়া সতর্কতায় ঝড়ের আগেই ফসল কেটে নিয়েছি। বড় ক্ষতি থেকে বেঁচে গেছি!"
                </p>
                <p className="text-xs text-muted-foreground mt-2">— আব্দুল করিম, সিলেট</p>
              </div>
            </div>
          </section>

          {/* App Features Summary */}
          <section className="glass-card rounded-2xl p-5 border border-secondary/30 bg-gradient-to-br from-secondary/5 to-primary/5">
            <h2 className="text-lg font-bold text-foreground mb-4 text-center">
              🚀 AgriBrain এর বৈশিষ্ট্য
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🔬", label: "AI রোগ সনাক্তকরণ" },
                { icon: "💬", label: "বাংলা AI চ্যাটবট" },
                { icon: "📊", label: "বাজার মূল্য বিশ্লেষণ" },
                { icon: "🌦️", label: "আবহাওয়া পূর্বাভাস" },
                { icon: "🗺️", label: "পোকামাকড় ম্যাপ" },
                { icon: "📅", label: "ফসল ক্যালেন্ডার" },
                { icon: "🧪", label: "সার সুপারিশ" },
                { icon: "🏛️", label: "সরকারি সেবা" },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-background/50 rounded-lg p-2.5">
                  <span className="text-lg">{feature.icon}</span>
                  <span className="text-xs font-medium text-foreground">{feature.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
