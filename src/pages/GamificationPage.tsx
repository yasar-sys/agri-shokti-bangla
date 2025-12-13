import { Award, Star, Target, Trophy, Leaf, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { GamificationBadge } from "@/components/ui/GamificationBadge";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

const userStats = {
  totalScans: 5,
  diseasesDetected: 3,
  daysActive: 7,
  level: 2,
  xp: 450,
  nextLevelXp: 1000,
};

const badgesData = [
  { icon: Leaf, title: "প্রথম স্ক্যান", description: "আপনার প্রথম ফসল স্ক্যান করেছেন", earned: true },
  { icon: Target, title: "৫টি স্ক্যান", description: "৫টি ফসল সফলভাবে স্ক্যান করেছেন", earned: true },
  { icon: Trophy, title: "রোগ বিশেষজ্ঞ", description: "১০টি রোগ সঠিকভাবে শনাক্ত করেছেন", earned: false, progress: 30 },
  { icon: Award, title: "আবহাওয়া পর্যবেক্ষক", description: "৭ দিন ধারাবাহিকভাবে আবহাওয়া চেক করেছেন", earned: true },
  { icon: Star, title: "সুপার কৃষক", description: "২০টি ফসল স্ক্যান করে সুপার কৃষক হন", earned: false, progress: 25 },
  { icon: Leaf, title: "মাস্টার কৃষক", description: "৫০টি ফসল স্ক্যান করে মাস্টার কৃষক হন", earned: false, progress: 10 },
];

export default function GamificationPage() {
  const progressPercent = (userStats.xp / userStats.nextLevelXp) * 100;

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
      <header className="px-4 pt-6 pb-4 flex items-center gap-3">
        <Link
          to="/home"
          className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">আপনার অগ্রগতি</h1>
          <p className="text-xs text-muted-foreground">ব্যাজ সংগ্রহ করুন এবং লেভেল আপ করুন!</p>
        </div>
      </header>

      {/* Stats Card */}
      <section className="px-4 mb-6">
        <div className="p-6 rounded-2xl gradient-gold glow-gold">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-primary-foreground/80">বর্তমান লেভেল</p>
              <p className="text-4xl font-bold text-primary-foreground">লেভেল {userStats.level}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Star className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          {/* XP Progress */}
          <div>
            <div className="flex justify-between text-sm text-primary-foreground/80 mb-2">
              <span>{userStats.xp} XP</span>
              <span>{userStats.nextLevelXp} XP</span>
            </div>
            <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-foreground rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <p className="text-2xl font-bold text-foreground">{userStats.totalScans}</p>
            <p className="text-xs text-muted-foreground">মোট স্ক্যান</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <p className="text-2xl font-bold text-foreground">{userStats.diseasesDetected}</p>
            <p className="text-xs text-muted-foreground">রোগ শনাক্ত</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <p className="text-2xl font-bold text-foreground">{userStats.daysActive}</p>
            <p className="text-xs text-muted-foreground">সক্রিয় দিন</p>
          </div>
        </div>
      </section>

      {/* Achievement Message */}
      <section className="px-4 mb-6">
        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
          <p className="text-center text-foreground">
            🎉 <strong>অভিনন্দন!</strong> আপনি {userStats.totalScans}টি ফসল স্ক্যান করেছেন!
          </p>
        </div>
      </section>

      {/* Badges */}
      <section className="px-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">আপনার ব্যাজসমূহ</h2>
        <div className="grid grid-cols-2 gap-3">
          {badgesData.map((badge, index) => (
            <GamificationBadge
              key={index}
              icon={badge.icon}
              title={badge.title}
              description={badge.description}
              earned={badge.earned}
              progress={badge.progress}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
