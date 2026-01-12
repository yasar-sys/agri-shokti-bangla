import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown, Minus, RefreshCw, Satellite, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface NDVIHistoryData {
  date: string;
  ndvi: number;
  health_score: number;
  status?: string;
  status_bn?: string;
  moisture_index?: number;
  stress_level?: number;
}

interface ZoneHistory {
  zone_id: string;
  zone_name: string;
  zone_name_bn: string;
  history: NDVIHistoryData[];
}

interface NDVIHistoryChartProps {
  userId: string | null;
  fieldZoneId?: string;
  days?: number;
  showAllZones?: boolean;
  polygonId?: string; // AgroMonitoring polygon ID for real NDVI data
}

const ZONE_COLORS = [
  'hsl(142, 70%, 45%)',
  'hsl(45, 90%, 50%)',
  'hsl(200, 70%, 50%)',
  'hsl(280, 60%, 55%)',
  'hsl(0, 70%, 50%)',
];

// Convert to Bengali numerals
function toBengali(num: number): string {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => d === '.' ? '.' : bn[parseInt(d)] || d).join('');
}

export function NDVIHistoryChart({ userId, fieldZoneId, days = 365, showAllZones = false, polygonId }: NDVIHistoryChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<NDVIHistoryData[]>([]);
  const [zonesHistory, setZonesHistory] = useState<ZoneHistory[]>([]);
  const [trend, setTrend] = useState<string>('stable');
  const [trendBn, setTrendBn] = useState<string>('স্থিতিশীল');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use AgroMonitoring API if polygonId is provided (real data)
      if (polygonId) {
        const response = await supabase.functions.invoke('agromonitoring-ndvi', {
          body: { 
            action: 'ndvi-history', 
            polygonId, 
            days 
          }
        });

        if (response.error) throw response.error;

        const data = response.data;
        
        if (data.error && data.error !== 'no_data') {
          throw new Error(data.messageBn || data.message || 'NDVI ডেটা লোড ব্যর্থ');
        }

        // Transform AgroMonitoring data to chart format
        const historyData: NDVIHistoryData[] = (data.history || []).map((item: any) => ({
          date: item.date,
          ndvi: item.ndvi,
          health_score: Math.round(Math.max(0, item.ndvi) * 100), // Convert NDVI to percentage
          status: item.ndvi > 0.6 ? 'good' : item.ndvi > 0.3 ? 'moderate' : 'poor',
          status_bn: item.ndvi > 0.6 ? 'ভালো' : item.ndvi > 0.3 ? 'মাঝারি' : 'দুর্বল',
        }));

        setHistory(historyData);
        setTrend(data.trend || 'stable');
        setTrendBn(data.trendBn || 'স্থিতিশীল');
        
        // Set summary from AgroMonitoring statistics with source info
        if (data.statistics) {
          setSummary({
            latest_ndvi: data.statistics.current,
            average_ndvi: data.statistics.average,
            max_ndvi: data.statistics.max,
            min_ndvi: data.statistics.min,
            source: data.source || 'AgroMonitoring',
            sourceInfo: data.sourceInfo || null
          });
        }

        // Generate recommendations based on current NDVI
        if (data.statistics?.current) {
          const currentNDVI = data.statistics.current;
          const recs: string[] = [];
          if (currentNDVI < 0.3) {
            recs.push('🚨 ফসলের স্বাস্থ্য সংকটজনক - জরুরি সেচ প্রয়োজন');
            recs.push('🔬 রোগ বা পোকার আক্রমণ পরীক্ষা করুন');
          } else if (currentNDVI < 0.5) {
            recs.push('💧 নিয়মিত সেচ বজায় রাখুন');
            recs.push('🌱 সার প্রয়োগের সময় হতে পারে');
          } else {
            recs.push('✅ ফসলের স্বাস্থ্য ভালো');
          }
          setRecommendations(recs);
        }
        
        return;
      }

      // Fallback to NASA-NDVI for simulated data if no polygonId
      if (!userId) return;
      
      const response = await supabase.functions.invoke('nasa-ndvi', {
        body: showAllZones 
          ? { action: 'get_all_zones_history', userId, days }
          : { action: 'get_ndvi_history', userId, fieldZoneId, days }
      });

      if (response.error) throw response.error;

      const data = response.data;
      if (data.success) {
        if (showAllZones && data.zones) {
          setZonesHistory(data.zones);
        } else {
          setHistory(data.history || []);
          setTrend(data.trend || 'stable');
          setTrendBn(data.trend_bn || 'স্থিতিশীল');
          setRecommendations(data.recommendations || []);
          setSummary(data.summary || null);
        }
      }
    } catch (err: any) {
      console.error('Error fetching NDVI history:', err);
      setError(err.message || 'NDVI ইতিহাস লোড ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId, fieldZoneId, days, showAllZones, polygonId]);

  // Format date for Bengali display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = toBengali(date.getDate());
    const months = ['জানু', 'ফেব', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ', 'অক্টো', 'নভে', 'ডিসে'];
    return `${day} ${months[date.getMonth()]}`;
  };

  // Combined chart data for all zones
  const combinedChartData = useMemo(() => {
    if (!showAllZones || zonesHistory.length === 0) return [];
    
    const dateMap = new Map<string, any>();
    
    zonesHistory.forEach((zone, idx) => {
      zone.history.forEach(h => {
        if (!dateMap.has(h.date)) {
          dateMap.set(h.date, { date: h.date });
        }
        dateMap.get(h.date)[zone.zone_name_bn] = h.health_score;
      });
    });
    
    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [zonesHistory, showAllZones]);

  const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus;
  const trendColor = trend === 'improving' ? 'text-secondary' : trend === 'declining' ? 'text-destructive' : 'text-muted-foreground';

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchHistory}>
            <RefreshCw className="w-4 h-4 mr-2" />
            পুনরায় চেষ্টা
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Chart Card */}
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Satellite className="w-4 h-4 text-chart-4" />
              {showAllZones ? 'সব জোনের NDVI ট্রেন্ড' : 'NDVI স্বাস্থ্য ট্রেন্ড'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {!showAllZones && (
                <div className={cn('flex items-center gap-1 text-sm', trendColor)}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{trendBn}</span>
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={fetchHistory} className="h-8 w-8">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {showAllZones ? (
                <LineChart data={combinedChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(v) => `${toBengali(v)}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    labelFormatter={formatDate}
                    formatter={(value: number, name: string) => [`${toBengali(value)}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  {zonesHistory.map((zone, idx) => (
                    <Line
                      key={zone.zone_id}
                      type="monotone"
                      dataKey={zone.zone_name_bn}
                      stroke={ZONE_COLORS[idx % ZONE_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              ) : (
                <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(200, 70%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(200, 70%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(v) => `${toBengali(v)}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    labelFormatter={formatDate}
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        health_score: 'স্বাস্থ্য স্কোর',
                        moisture_index: 'আর্দ্রতা সূচক'
                      };
                      return [`${toBengali(Math.round(value))}%`, labels[name] || name];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="health_score"
                    stroke="hsl(142, 70%, 45%)"
                    strokeWidth={2}
                    fill="url(#ndviGradient)"
                    name="health_score"
                  />
                  {history[0]?.moisture_index !== undefined && (
                    <Area
                      type="monotone"
                      dataKey={(d: NDVIHistoryData) => d.moisture_index ? d.moisture_index * 100 : 0}
                      stroke="hsl(200, 70%, 50%)"
                      strokeWidth={1.5}
                      fill="url(#moistureGradient)"
                      name="moisture_index"
                    />
                  )}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats - Only for single zone view */}
      {!showAllZones && summary && (
        <div className="grid grid-cols-4 gap-2">
          <Card className="bg-card/60 backdrop-blur-sm border-border p-3">
            <p className="text-xs text-muted-foreground">সর্বশেষ</p>
            <p className="text-lg font-bold text-foreground">{toBengali(Math.round(summary.latest_ndvi * 100))}%</p>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm border-border p-3">
            <p className="text-xs text-muted-foreground">গড়</p>
            <p className="text-lg font-bold text-foreground">{toBengali(Math.round(summary.average_ndvi * 100))}%</p>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm border-border p-3">
            <p className="text-xs text-muted-foreground">সর্বোচ্চ</p>
            <p className="text-lg font-bold text-secondary">{toBengali(Math.round(summary.max_ndvi * 100))}%</p>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm border-border p-3">
            <p className="text-xs text-muted-foreground">সর্বনিম্ন</p>
            <p className="text-lg font-bold text-destructive">{toBengali(Math.round(summary.min_ndvi * 100))}%</p>
          </Card>
        </div>
      )}

      {/* Data Source Info */}
      {!showAllZones && summary?.source && (
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Satellite className="w-3 h-3" />
              <span className="font-medium">ডেটা সোর্স:</span>
              <span>{summary.source}</span>
              {summary.sourceInfo?.satellite && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {summary.sourceInfo.satellite}
                </Badge>
              )}
            </div>
            {summary.sourceInfo?.updateFrequency && (
              <p className="text-[10px] text-muted-foreground mt-1 ml-5">
                আপডেট: {summary.sourceInfo.updateFrequency}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      {!showAllZones && recommendations.length > 0 && (
        <Card className="bg-chart-4/10 border-chart-4/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-chart-4">🤖 AI সুপারিশ</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-foreground">{rec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
