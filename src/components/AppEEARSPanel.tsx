import { useState, useMemo } from 'react';
import { Download, TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Loader2, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppEEARS } from '@/hooks/useAppEEARS';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';

interface AppEEARSPanelProps {
  latitude: number;
  longitude: number;
  onClose?: () => void;
}

export function AppEEARSPanel({ latitude, longitude, onClose }: AppEEARSPanelProps) {
  const { loading, ndviTimeSeries, requestNDVITimeSeries, downloadCSV, calculateStats } = useAppEEARS();
  const [showChart, setShowChart] = useState(false);
  const [dateRange, setDateRange] = useState<'90' | '180' | '365'>('365');

  const handleFetchData = async () => {
    const result = await requestNDVITimeSeries(latitude, longitude);
    if (result) {
      setShowChart(true);
    }
  };

  // Filter data based on date range
  const filteredData = useMemo(() => {
    if (!ndviTimeSeries.length) return [];
    
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(dateRange));
    
    return ndviTimeSeries.filter(d => new Date(d.date) >= cutoff);
  }, [ndviTimeSeries, dateRange]);

  // Calculate stats for filtered data
  const stats = useMemo(() => {
    return calculateStats(filteredData);
  }, [filteredData, calculateStats]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return filteredData.map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' }),
      fullDate: d.date,
      valuePercent: Math.round(d.value * 100)
    }));
  }, [filteredData]);

  // Convert number to Bengali
  const toBengali = (num: number | string): string => {
    const bengali = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).split('').map(d => d === '.' ? '.' : bengali[parseInt(d)] || d).join('');
  };

  return (
    <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-chart-4/20 to-secondary/20 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-chart-4" />
            <div>
              <h3 className="font-semibold text-foreground text-sm">AppEEARS NDVI টাইম-সিরিজ</h3>
              <p className="text-xs text-muted-foreground">NASA MODIS ডেটা বিশ্লেষণ</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
              ×
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Location Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <MapPin className="w-3 h-3" />
          <span>অক্ষাংশ: {toBengali(latitude.toFixed(4))}° | দ্রাঘিমাংশ: {toBengali(longitude.toFixed(4))}°</span>
        </div>

        {/* Fetch Button */}
        {!showChart && (
          <Button 
            onClick={handleFetchData} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-chart-4 to-secondary hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ডেটা আনা হচ্ছে...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                NDVI টাইম-সিরিজ ডাউনলোড করুন
              </>
            )}
          </Button>
        )}

        {/* Results */}
        {showChart && ndviTimeSeries.length > 0 && (
          <>
            {/* Date Range Selector */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {(['90', '180', '365'] as const).map((range) => (
                  <Button
                    key={range}
                    size="sm"
                    variant={dateRange === range ? 'default' : 'outline'}
                    onClick={() => setDateRange(range)}
                    className="h-7 text-xs"
                  >
                    {range === '90' ? '৩ মাস' : range === '180' ? '৬ মাস' : '১ বছর'}
                  </Button>
                ))}
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleFetchData}
                disabled={loading}
                className="h-7"
              >
                <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
              </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className={cn(
                    "text-lg font-bold",
                    stats.average >= 0.6 ? "text-secondary" : 
                    stats.average >= 0.4 ? "text-chart-2" : "text-destructive"
                  )}>
                    {toBengali(Math.round(stats.average * 100))}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">গড় NDVI</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-secondary">{toBengali(Math.round(stats.maximum * 100))}%</p>
                  <p className="text-[10px] text-muted-foreground">সর্বোচ্চ</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-destructive">{toBengali(Math.round(stats.minimum * 100))}%</p>
                  <p className="text-[10px] text-muted-foreground">সর্বনিম্ন</p>
                </div>
              </div>
            )}

            {/* Trend Indicator */}
            {stats && (
              <div className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-lg",
                stats.trend === 'increasing' ? "bg-secondary/10 text-secondary" :
                stats.trend === 'decreasing' ? "bg-destructive/10 text-destructive" :
                "bg-muted text-muted-foreground"
              )}>
                {stats.trend === 'increasing' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : stats.trend === 'decreasing' ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {stats.trend === 'increasing' ? 'উন্নতি হচ্ছে' :
                   stats.trend === 'decreasing' ? 'অবনতি হচ্ছে' : 'স্থিতিশীল'}
                </span>
              </div>
            )}

            {/* Chart */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 9 }} 
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 9 }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'NDVI']}
                    labelFormatter={(label) => `তারিখ: ${label}`}
                  />
                  <ReferenceLine y={60} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Area 
                    type="monotone" 
                    dataKey="valuePercent" 
                    stroke="hsl(var(--secondary))" 
                    fill="url(#ndviGradient)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Data Quality Info */}
            {stats && (
              <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                <span>মোট ডেটা পয়েন্ট: {toBengali(stats.dataPoints)}</span>
                <span>ভালো মানের: {toBengali(stats.goodQualityPoints)}</span>
              </div>
            )}

            {/* Download Button */}
            <Button 
              onClick={() => downloadCSV(filteredData, `ndvi-${latitude.toFixed(2)}-${longitude.toFixed(2)}`)}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV ডাউনলোড করুন
            </Button>

            {/* Attribution */}
            <p className="text-[10px] text-muted-foreground text-center">
              ডেটা সোর্স: NASA AppEEARS • MODIS Terra MOD13Q1 v061
            </p>
          </>
        )}
      </div>
    </div>
  );
}
