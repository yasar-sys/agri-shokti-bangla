import { Award, Star, Target, Trophy, Leaf, ArrowLeft, Zap, Medal, Crown, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const userStats = {
  totalScans: 5,
  diseasesDetected: 3,
  daysActive: 7,
  level: 2,
  xp: 450,
  nextLevelXp: 1000,
  rank: "নতুন কৃষক",
};

const badgesData = [
  { icon: Leaf, title: "প্রথম স্ক্যান", description: "আপনার প্রথম ফসল স্ক্যান করেছেন", earned: true, xp: 50, color: "text-secondary" },
  { icon: Target, title: "৫টি স্ক্যান", description: "৫টি ফসল সফলভাবে স্ক্যান করেছেন", earned: true, xp: 100, color: "text-primary" },
  { icon: Trophy, title: "রোগ বিশেষজ্ঞ", description: "১০টি রোগ সঠিকভাবে শনাক্ত করেছেন", earned: false, progress: 30, xp: 200, color: "text-chart-2" },
  { icon: Award, title: "আবহাওয়া পর্যবেক্ষক", description: "৭ দিন ধারাবাহিকভাবে আবহাওয়া চেক করেছেন", earned: true, xp: 75, color: "text-chart-3" },
  { icon: Star, title: "সুপার কৃষক", description: "২০টি ফসল স্ক্যান করে সুপার কৃষক হন", earned: false, progress: 25, xp: 300, color: "text-chart-4" },
  { icon: Crown, title: "মাস্টার কৃষক", description: "৫০টি ফসল স্ক্যান করে মাস্টার কৃষক হন", earned: false, progress: 10, xp: 500, color: "text-chart-5" },
];

const rewards = [
  { name: "১০০ XP বোনাস", cost: 200, icon: Zap, available: true },
  { name: "বিশেষ ব্যাজ", cost: 500, icon: Medal, available: false },
  { name: "প্রিমিয়াম টিপস", cost: 300, icon: Gift, available: true },
];

const leaderboard = [
  { rank: 1, name: "রহিম উদ্দিন", xp: 2450, avatar: "👨‍🌾" },
  { rank: 2, name: "ফাতেমা বেগম", xp: 1980, avatar: "👩‍🌾" },
  { rank: 3, name: "আব্দুল হক", xp: 1750, avatar: "👨" },
  { rank: 4, name: "আপনি", xp: userStats.xp, avatar: "🌾", isUser: true },
];

export default function GamificationPage() {
  const progressPercent = (userStats.xp / userStats.nextLevelXp) * 100;
  const [activeTab, setActiveTab] = useState<"badges" | "rewards" | "leaderboard">("badges");

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

      {/* Hero Stats Card */}
      <section className="px-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-chart-5 to-secondary p-6">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80">বর্তমান র‍্যাংক</p>
                <p className="text-2xl font-bold text-white">{userStats.rank}</p>
              </div>
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{userStats.level}</p>
                  <p className="text-xs text-white/80">লেভেল</p>
                </div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="flex justify-between text-sm text-white/90 mb-2">
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {userStats.xp} XP
                </span>
                <span>{userStats.nextLevelXp} XP</span>
              </div>
              <Progress value={progressPercent} className="h-3 bg-white/30" />
              <p className="text-xs text-white/70 mt-1 text-center">
                পরবর্তী লেভেলে আরো {userStats.nextLevelXp - userStats.xp} XP দরকার
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-secondary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{userStats.totalScans}</p>
            <p className="text-xs text-muted-foreground">মোট স্ক্যান</p>
          </div>
          <div className="p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-destructive/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-foreground">{userStats.diseasesDetected}</p>
            <p className="text-xs text-muted-foreground">রোগ শনাক্ত</p>
          </div>
          <div className="p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{userStats.daysActive}</p>
            <p className="text-xs text-muted-foreground">সক্রিয় দিন</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 mb-4">
        <div className="flex gap-2 p-1 bg-card/80 backdrop-blur-sm rounded-xl border border-border">
          {[
            { id: "badges", label: "ব্যাজ", icon: Medal },
            { id: "rewards", label: "পুরস্কার", icon: Gift },
            { id: "leaderboard", label: "লিডারবোর্ড", icon: Crown },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5",
                activeTab === tab.id
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Badges Tab */}
      {activeTab === "badges" && (
        <section className="px-4">
          <div className="grid grid-cols-2 gap-3">
            {badgesData.map((badge, index) => (
              <div
                key={index}
                className={cn(
                  "relative p-4 rounded-xl border backdrop-blur-sm transition-all",
                  badge.earned
                    ? "bg-gradient-to-br from-secondary/20 to-primary/10 border-secondary/50"
                    : "bg-card/80 border-border opacity-75"
                )}
              >
                {badge.earned && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-xs">✓</span>
                    </div>
                  </div>
                )}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-2",
                  badge.earned ? "bg-secondary/30" : "bg-muted"
                )}>
                  <badge.icon className={cn("w-6 h-6", badge.earned ? badge.color : "text-muted-foreground")} />
                </div>
                <h3 className="font-semibold text-sm text-foreground">{badge.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                <div className="mt-2 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">+{badge.xp} XP</span>
                </div>
                {!badge.earned && badge.progress && (
                  <div className="mt-2">
                    <Progress value={badge.progress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">{badge.progress}% সম্পন্ন</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rewards Tab */}
      {activeTab === "rewards" && (
        <section className="px-4 space-y-3">
          {rewards.map((reward, index) => (
            <div
              key={index}
              className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <reward.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{reward.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  {reward.cost} XP প্রয়োজন
                </p>
              </div>
              <Button
                size="sm"
                variant={reward.available && userStats.xp >= reward.cost ? "default" : "outline"}
                disabled={!reward.available || userStats.xp < reward.cost}
                className={reward.available && userStats.xp >= reward.cost ? "bg-secondary text-secondary-foreground" : ""}
              >
                {userStats.xp >= reward.cost ? "নিন" : "অপ্রাপ্য"}
              </Button>
            </div>
          ))}
        </section>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <section className="px-4 space-y-2">
          {leaderboard.map((user, index) => (
            <div
              key={index}
              className={cn(
                "rounded-xl p-4 flex items-center gap-3 border backdrop-blur-sm",
                user.isUser
                  ? "bg-gradient-to-r from-secondary/20 to-primary/10 border-secondary/50"
                  : "bg-card/80 border-border"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                user.rank === 1 && "bg-yellow-500/20 text-yellow-500",
                user.rank === 2 && "bg-gray-400/20 text-gray-400",
                user.rank === 3 && "bg-amber-600/20 text-amber-600",
                user.rank > 3 && "bg-muted text-muted-foreground"
              )}>
                {user.rank <= 3 ? ["🥇", "🥈", "🥉"][user.rank - 1] : user.rank}
              </div>
              <div className="text-2xl">{user.avatar}</div>
              <div className="flex-1">
                <p className={cn(
                  "font-semibold",
                  user.isUser ? "text-secondary" : "text-foreground"
                )}>
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {user.xp} XP
                </p>
              </div>
              {user.isUser && (
                <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                  আপনি
                </span>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Achievement Message */}
      <section className="px-4 mt-6">
        <div className="p-4 rounded-xl bg-gradient-to-r from-chart-5/20 to-chart-4/20 border border-chart-5/30 backdrop-blur-sm">
          <p className="text-center text-foreground">
            🎉 <strong>অভিনন্দন!</strong> আপনি আজ পর্যন্ত {badgesData.filter(b => b.earned).length}টি ব্যাজ অর্জন করেছেন!
          </p>
        </div>
      </section>
    </div>
  );
}