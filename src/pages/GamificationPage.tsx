import { Award, Star, Target, Trophy, Leaf, ArrowLeft, Zap, Medal, Crown, Gift, RefreshCw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBadgeNotification } from "@/hooks/useBadgeNotification";

interface UserStats {
  totalScans: number;
  diseasesDetected: number;
  daysActive: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  rank: string;
}

const calculateLevel = (xp: number) => {
  if (xp >= 5000) return { level: 10, rank: "মাস্টার কৃষক" };
  if (xp >= 3000) return { level: 8, rank: "বিশেষজ্ঞ কৃষক" };
  if (xp >= 2000) return { level: 6, rank: "অভিজ্ঞ কৃষক" };
  if (xp >= 1000) return { level: 4, rank: "উন্নত কৃষক" };
  if (xp >= 500) return { level: 3, rank: "সক্রিয় কৃষক" };
  if (xp >= 200) return { level: 2, rank: "শিক্ষানবিস" };
  return { level: 1, rank: "নতুন কৃষক" };
};

const getNextLevelXp = (level: number) => {
  const xpMap: Record<number, number> = {
    1: 200, 2: 500, 3: 1000, 4: 2000, 5: 3000, 6: 4000, 7: 5000, 8: 6000, 9: 8000, 10: 10000
  };
  return xpMap[level] || 10000;
};

export default function GamificationPage() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalScans: 0,
    diseasesDetected: 0,
    daysActive: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 200,
    rank: "নতুন কৃষক",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"badges" | "rewards" | "leaderboard">("badges");

  // Fetch real user stats
  const fetchUserStats = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch profile with stats
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          const xp = profile.xp_points || 0;
          const { level, rank } = calculateLevel(xp);
          
          setUserStats({
            totalScans: profile.total_scans || 0,
            diseasesDetected: profile.diseases_detected || 0,
            daysActive: profile.days_active || 0,
            level,
            xp,
            nextLevelXp: getNextLevelXp(level),
            rank,
          });
        }

        // Fetch user's achievements
        const { data: achievements } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id);

        if (achievements) {
          // Update badges based on achievements
          const earnedBadges = achievements.map(a => a.achievement_type);
          setBadgesData(prev => prev.map(badge => ({
            ...badge,
            earned: earnedBadges.includes(badge.id) || badge.earned
          })));
        }
      }

      // Fetch leaderboard from profiles
      const { data: topUsers } = await supabase
        .from('profiles')
        .select('full_name, xp_points, user_id')
        .order('xp_points', { ascending: false })
        .limit(10);

      if (topUsers) {
        const leaderboardData = topUsers.map((u, idx) => ({
          rank: idx + 1,
          name: u.full_name || `কৃষক ${idx + 1}`,
          xp: u.xp_points || 0,
          avatar: idx === 0 ? "🏆" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "👨‍🌾",
          isUser: user?.id === u.user_id
        }));
        setLeaderboard(leaderboardData);
      }

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  const [badgesData, setBadgesData] = useState([
    { id: "first_scan", icon: Leaf, title: "প্রথম স্ক্যান", description: "আপনার প্রথম ফসল স্ক্যান করেছেন", earned: false, xp: 50, color: "text-secondary" },
    { id: "five_scans", icon: Target, title: "৫টি স্ক্যান", description: "৫টি ফসল সফলভাবে স্ক্যান করেছেন", earned: false, xp: 100, color: "text-primary" },
    { id: "disease_expert", icon: Trophy, title: "রোগ বিশেষজ্ঞ", description: "১০টি রোগ সঠিকভাবে শনাক্ত করেছেন", earned: false, progress: 0, xp: 200, color: "text-chart-2" },
    { id: "weather_watcher", icon: Award, title: "আবহাওয়া পর্যবেক্ষক", description: "৭ দিন ধারাবাহিকভাবে আবহাওয়া চেক করেছেন", earned: false, xp: 75, color: "text-chart-3" },
    { id: "super_farmer", icon: Star, title: "সুপার কৃষক", description: "২০টি ফসল স্ক্যান করে সুপার কৃষক হন", earned: false, progress: 0, xp: 300, color: "text-chart-4" },
    { id: "master_farmer", icon: Crown, title: "মাস্টার কৃষক", description: "৫০টি ফসল স্ক্যান করে মাস্টার কৃষক হন", earned: false, progress: 0, xp: 500, color: "text-chart-5" },
  ]);

  // Update badge progress based on user stats
  useEffect(() => {
    setBadgesData(prev => prev.map(badge => {
      if (badge.id === "first_scan") {
        return { ...badge, earned: userStats.totalScans >= 1 };
      }
      if (badge.id === "five_scans") {
        return { ...badge, earned: userStats.totalScans >= 5 };
      }
      if (badge.id === "disease_expert") {
        return { 
          ...badge, 
          earned: userStats.diseasesDetected >= 10,
          progress: Math.min(100, (userStats.diseasesDetected / 10) * 100)
        };
      }
      if (badge.id === "weather_watcher") {
        return { ...badge, earned: userStats.daysActive >= 7 };
      }
      if (badge.id === "super_farmer") {
        return { 
          ...badge, 
          earned: userStats.totalScans >= 20,
          progress: Math.min(100, (userStats.totalScans / 20) * 100)
        };
      }
      if (badge.id === "master_farmer") {
        return { 
          ...badge, 
          earned: userStats.totalScans >= 50,
          progress: Math.min(100, (userStats.totalScans / 50) * 100)
        };
      }
      return badge;
    }));
  }, [userStats]);

  // Badge notification hook - triggers confetti and notification on new badges
  const badgesForNotification = useMemo(() => 
    badgesData.map(b => ({ id: b.id, title: b.title, description: b.description, earned: b.earned, xp: b.xp })),
    [badgesData]
  );
  const { celebrateBadge, triggerConfetti } = useBadgeNotification(badgesForNotification);

  const rewards = [
    { name: "১০০ XP বোনাস", cost: 200, icon: Zap, available: true },
    { name: "বিশেষ ব্যাজ", cost: 500, icon: Medal, available: false },
    { name: "প্রিমিয়াম টিপস", cost: 300, icon: Gift, available: true },
  ];

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
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl"
          onClick={() => {
            fetchUserStats();
            toast.success("ডেটা আপডেট হচ্ছে...");
          }}
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
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
                  {userStats.xp.toLocaleString('bn-BD')} XP
                </span>
                <span>{userStats.nextLevelXp.toLocaleString('bn-BD')} XP</span>
              </div>
              <Progress value={progressPercent} className="h-3 bg-white/30" />
              <p className="text-xs text-white/70 mt-1 text-center">
                পরবর্তী লেভেলে আরো {(userStats.nextLevelXp - userStats.xp).toLocaleString('bn-BD')} XP দরকার
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
            <p className="text-2xl font-bold text-foreground">{userStats.totalScans.toLocaleString('bn-BD')}</p>
            <p className="text-xs text-muted-foreground">মোট স্ক্যান</p>
          </div>
          <div className="p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-destructive/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-foreground">{userStats.diseasesDetected.toLocaleString('bn-BD')}</p>
            <p className="text-xs text-muted-foreground">রোগ শনাক্ত</p>
          </div>
          <div className="p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{userStats.daysActive.toLocaleString('bn-BD')}</p>
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
                onClick={() => badge.earned && celebrateBadge(badge)}
                className={cn(
                  "relative p-4 rounded-xl border backdrop-blur-sm transition-all",
                  badge.earned
                    ? "bg-gradient-to-br from-secondary/20 to-primary/10 border-secondary/50 cursor-pointer hover:scale-105 active:scale-95"
                    : "bg-card/80 border-border opacity-75"
                )}
              >
                {badge.earned && (
                  <>
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center animate-pulse">
                        <span className="text-xs">✓</span>
                      </div>
                    </div>
                    <div className="absolute -top-1 -left-1">
                      <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
                    </div>
                  </>
                )}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-transform",
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
                {!badge.earned && badge.progress !== undefined && (
                  <div className="mt-2">
                    <Progress value={badge.progress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">{Math.round(badge.progress)}% সম্পন্ন</p>
                  </div>
                )}
                {badge.earned && (
                  <p className="text-xs text-secondary mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    ট্যাপ করে উদযাপন করুন!
                  </p>
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
          {leaderboard.length > 0 ? leaderboard.map((user, index) => (
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
                  {user.xp.toLocaleString('bn-BD')} XP
                </p>
              </div>
              {user.isUser && (
                <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                  আপনি
                </span>
              )}
            </div>
          )) : (
            <div className="text-center py-8 text-muted-foreground">
              <Crown className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>লিডারবোর্ড লোড হচ্ছে...</p>
            </div>
          )}
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
