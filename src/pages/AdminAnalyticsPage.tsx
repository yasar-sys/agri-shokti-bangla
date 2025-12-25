import { useState } from "react";
import { ArrowLeft, Users, Activity, Bug, TrendingUp, BarChart3, RefreshCw, Shield, Lock, MessageSquare, Database, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { cn } from "@/lib/utils";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";

const featureIcons: Record<string, string> = {
  'disease_scan': '🔬',
  'chat': '💬',
  'market': '📊',
  'weather': '🌤️',
  'calendar': '📅',
  'fertilizer': '🧪',
  'community': '👥',
  'knowledge': '📚',
  'pest_map': '🐛',
  'satellite': '🛰️',
  'home': '🏠',
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminAnalyticsPage() {
  const { 
    isAdmin, 
    loading, 
    error, 
    engagement, 
    features, 
    diseases, 
    recentChats,
    recentScans,
    recentPosts,
    dailyActivity,
    refetch 
  } = useAdminAnalytics();
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">অ্যানালিটিক্স লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full bg-card/90 border-destructive/30">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">অ্যাক্সেস নেই</h2>
            <p className="text-muted-foreground mb-4">{error || 'এই পেজে অ্যাক্সেস করতে অ্যাডমিন অধিকার প্রয়োজন।'}</p>
            <Link to="/home">
              <Button variant="outline">হোমে ফিরে যান</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const featureChartData = features.slice(0, 8).map(f => ({
    name: f.feature_name,
    usage: f.usage_count,
    users: f.unique_users
  }));

  const engagementPieData = [
    { name: 'স্ক্যান', value: engagement?.total_scans || 0 },
    { name: 'চ্যাট', value: engagement?.total_chat_messages || 0 },
    { name: 'পোস্ট', value: engagement?.total_posts || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen pb-28 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${villageBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/home">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                অ্যাডমিন ড্যাশবোর্ড
              </h1>
              <p className="text-xs text-muted-foreground">রিয়েল-টাইম অ্যানালিটিক্স</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            রিফ্রেশ
          </Button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Real-time Stats Overview */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            ডাটাবেস সামারি (রিয়েল-টাইম)
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
              <CardContent className="pt-3 text-center">
                <p className="text-2xl font-bold text-foreground">{engagement?.total_users || 0}</p>
                <p className="text-[10px] text-muted-foreground">ইউজার</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
              <CardContent className="pt-3 text-center">
                <p className="text-2xl font-bold text-foreground">{engagement?.total_chat_messages || 0}</p>
                <p className="text-[10px] text-muted-foreground">মেসেজ</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-500/30">
              <CardContent className="pt-3 text-center">
                <p className="text-2xl font-bold text-foreground">{engagement?.total_scans || 0}</p>
                <p className="text-[10px] text-muted-foreground">স্ক্যান</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Card className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-500/30">
              <CardContent className="pt-3 text-center">
                <p className="text-2xl font-bold text-foreground">{engagement?.total_posts || 0}</p>
                <p className="text-[10px] text-muted-foreground">কমিউনিটি পোস্ট</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-pink-500/30">
              <CardContent className="pt-3 text-center">
                <p className="text-2xl font-bold text-foreground">{engagement?.active_users_week || 0}</p>
                <p className="text-[10px] text-muted-foreground">সাপ্তাহিক সক্রিয়</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs for different views */}
        <Tabs defaultValue="charts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/80">
            <TabsTrigger value="charts">চার্ট</TabsTrigger>
            <TabsTrigger value="data">ডেটা</TabsTrigger>
            <TabsTrigger value="activity">অ্যাক্টিভিটি</TabsTrigger>
          </TabsList>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6 mt-4">
            {/* Activity Distribution Pie Chart */}
            {engagementPieData.length > 0 && (
              <Card className="bg-card/80 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    অ্যাক্টিভিটি বিতরণ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={engagementPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {engagementPieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feature Usage Bar Chart */}
            {featureChartData.length > 0 && (
              <Card className="bg-card/80 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-secondary" />
                    ফিচার ব্যবহার (৩০ দিন)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={featureChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" width={60} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Daily Activity Chart */}
            {dailyActivity.length > 0 && (
              <Card className="bg-card/80 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    দৈনিক অ্যাক্টিভিটি (৭ দিন)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4 mt-4">
            {/* Recent Chat Messages */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'chats' ? null : 'chats')}
                  className="w-full flex items-center justify-between"
                >
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    সাম্প্রতিক চ্যাট ({recentChats.length})
                  </CardTitle>
                  {expandedSection === 'chats' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </CardHeader>
              {expandedSection === 'chats' && (
                <CardContent className="max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {recentChats.map((chat, i) => (
                      <div key={i} className={cn(
                        "p-2 rounded-lg text-xs",
                        chat.sender === 'user' ? 'bg-primary/10 border-l-2 border-primary' : 'bg-secondary/10 border-l-2 border-secondary'
                      )}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-foreground">
                            {chat.sender === 'user' ? '👤 ব্যবহারকারী' : '🤖 AI'}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            {new Date(chat.created_at).toLocaleString('bn-BD')}
                          </span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{chat.content}</p>
                      </div>
                    ))}
                    {recentChats.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">কোনো চ্যাট নেই</p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Recent Posts */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'posts' ? null : 'posts')}
                  className="w-full flex items-center justify-between"
                >
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    কমিউনিটি পোস্ট ({recentPosts.length})
                  </CardTitle>
                  {expandedSection === 'posts' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </CardHeader>
              {expandedSection === 'posts' && (
                <CardContent className="max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {recentPosts.map((post, i) => (
                      <div key={i} className="p-2 rounded-lg bg-muted/20 border border-border/30">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-foreground text-xs">{post.author_name}</span>
                          <span className="text-muted-foreground text-[10px]">
                            {new Date(post.created_at).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-foreground">{post.title}</p>
                        <p className="text-muted-foreground text-[10px] line-clamp-2">{post.content}</p>
                        <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span>❤️ {post.likes_count}</span>
                          <span>💬 {post.comments_count}</span>
                        </div>
                      </div>
                    ))}
                    {recentPosts.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">কোনো পোস্ট নেই</p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Recent Scans */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'scans' ? null : 'scans')}
                  className="w-full flex items-center justify-between"
                >
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Bug className="w-4 h-4 text-red-500" />
                    রোগ স্ক্যান ({recentScans.length})
                  </CardTitle>
                  {expandedSection === 'scans' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </CardHeader>
              {expandedSection === 'scans' && (
                <CardContent className="max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {recentScans.map((scan, i) => (
                      <div key={i} className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-foreground text-xs">
                            🦠 {scan.disease_name || 'অজানা রোগ'}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            {new Date(scan.created_at).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-[10px]">
                          স্বাস্থ্য স্কোর: {scan.health_score || 0}%
                        </p>
                        {scan.treatment && (
                          <p className="text-muted-foreground text-[10px] line-clamp-1">
                            চিকিৎসা: {scan.treatment}
                          </p>
                        )}
                      </div>
                    ))}
                    {recentScans.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">কোনো স্ক্যান রেকর্ড নেই</p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4 mt-4">
            {/* Disease Trends */}
            <section>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Bug className="w-4 h-4 text-destructive" />
                রোগ প্রবণতা (৩০ দিন)
              </h3>
              {diseases.length > 0 ? (
                <div className="space-y-2">
                  {diseases.slice(0, 5).map((disease, idx) => {
                    const maxCount = diseases[0]?.case_count || 1;
                    const percentage = (disease.case_count / maxCount) * 100;
                    
                    return (
                      <Card key={disease.disease} className="bg-card/80 border-border/50">
                        <CardContent className="py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-foreground">{disease.disease}</span>
                            <span className="text-xs font-bold text-foreground">{disease.case_count} কেস</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-destructive to-orange-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="bg-card/80 border-border/50">
                  <CardContent className="py-6 text-center">
                    <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">কোনো রোগের ডেটা নেই</p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Feature Usage List */}
            <section>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                ফিচার ব্যবহার
              </h3>
              {features.length > 0 ? (
                <div className="space-y-2">
                  {features.slice(0, 10).map((feature) => (
                    <Card key={feature.feature_name} className="bg-card/80 border-border/50">
                      <CardContent className="py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{featureIcons[feature.feature_name] || '📱'}</span>
                            <span className="text-xs text-foreground">{feature.feature_name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-foreground">{feature.usage_count}</span>
                            <span className="text-[10px] text-muted-foreground ml-1">বার</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-card/80 border-border/50">
                  <CardContent className="py-6 text-center">
                    <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">কোনো ফিচার ব্যবহারের ডেটা নেই</p>
                  </CardContent>
                </Card>
              )}
            </section>
          </TabsContent>
        </Tabs>

        {/* Admin Info */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
          <CardContent className="py-4">
            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              ডেটা কোথায় দেখবেন?
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>চার্ট ট্যাব:</strong> ভিজ্যুয়াল গ্রাফ ও পাই চার্ট</li>
              <li>• <strong>ডেটা ট্যাব:</strong> সাম্প্রতিক চ্যাট, পোস্ট, স্ক্যান রেকর্ড</li>
              <li>• <strong>অ্যাক্টিভিটি ট্যাব:</strong> রোগ প্রবণতা ও ফিচার ব্যবহার</li>
              <li>• <strong>রিফ্রেশ বাটন:</strong> সর্বশেষ ডেটা দেখতে ক্লিক করুন</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
