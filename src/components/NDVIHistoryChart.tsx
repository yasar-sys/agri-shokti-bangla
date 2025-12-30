import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown, Minus, RefreshCw, Satellite } from 'lucide-react';
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

export function NDVIHistoryChart({ userId, fieldZoneId, days = 60, showAllZones = false }: NDVIHistoryChartProps) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<NDVIHistoryData[]>([]);
  const [zonesHistory, setZonesHistory] = useState<ZoneHistory[]>([]);
  const [trend, setTrend] = useState<string>('stable');
  const [trendBn, setTrendBn] = useState<string>('স্থিতিশীল');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const fetchHistory = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
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
    } catch (error) {
      console.error('Error fetching NDVI history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId, fieldZoneId, days, showAllZones]);

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
