import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Loader2,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    Calendar,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPolygonNDVIHistory, getNDVIColor } from '@/lib/agroMonitoringService';
import type { AgroNDVIHistory, NDVITrend } from '@/types/agroMonitoringTypes';

interface NDVITimeSeriesChartProps {
    polygonId: string | null;
    className?: string;
}

export function NDVITimeSeriesChart({ polygonId, className }: NDVITimeSeriesChartProps) {
    const [days, setDays] = useState<7 | 14 | 30>(30);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AgroNDVIHistory | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!polygonId) return;

            setLoading(true);
            setError(null);

            try {
                const history = await getPolygonNDVIHistory(polygonId, days);
                setData(history);
            } catch (err: any) {
                console.error('Failed to fetch NDVI history:', err);
                setError(err.messageBn || 'ডেটা লোড করতে ব্যর্থ হয়েছে');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [polygonId, days]);

    // Format date for Bengali display
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
        } catch {
            return dateStr;
        }
    };

    // To Bengali numerals
    const toBengali = (num: number) => {
        return num.toLocaleString('bn-BD');
    };

    const TrendIcon = useMemo(() => {
        if (!data) return Minus;
        switch (data.trend) {
            case 'improving': return TrendingUp;
            case 'declining': return TrendingDown;
            default: return Minus;
        }
    }, [data]);

    const trendColor = useMemo(() => {
        if (!data) return 'text-muted-foreground';
        switch (data.trend) {
            case 'improving': return 'text-green-600';
            case 'declining': return 'text-red-600';
            default: return 'text-yellow-600';
        }
    }, [data]);

    if (!polygonId) {
        return (
            <Card className={cn("bg-card/50 backdrop-blur-sm", className)}>
                <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                    কোনো পলিগন নির্বাচন করা হয়নি
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("overflow-hidden bg-card/95 backdrop-blur-sm border-border shadow-sm", className)}>
            <CardHeader className="pb-2 border-b border-border/50 bg-muted/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            NDVI স্বাস্থ্য বিশ্লেষণ
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            গত {toBengali(days)} দিনের ফসলের স্বাস্থ্য পরিবর্তন
                        </p>
                    </div>

                    <div className="flex bg-background rounded-lg border border-border p-1">
                        {[7, 14, 30].map((d) => (
                            <button
                                key={d}
                                onClick={() => setDays(d as any)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                    days === d
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {toBengali(d)} দিন
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4">
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="text-xs text-muted-foreground">বিশ্লেষণ করা হচ্ছে...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-destructive">
                            <AlertTriangle className="w-8 h-8" />
                            <span className="text-sm font-medium">{error}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDays(days)} // Retry
                                className="mt-2"
                            >
                                পুনরায় চেষ্টা করুন
                            </Button>
                        </div>
                    </div>
                ) : data && data.history.length > 0 ? (
                    <div className="space-y-6">
                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 bg-background rounded-lg border border-border">
                                <span className="text-[10px] text-muted-foreground font-medium uppercase">বর্তমান অবস্থা</span>
                                <div className="flex items-end gap-2 mt-1">
                                    <span className="text-xl font-bold" style={{ color: getNDVIColor(data.statistics.current) }}>
                                        {data.statistics.current.toFixed(2)}
                                    </span>
                                    <div className={cn("flex items-center text-xs mb-1", trendColor)}>
                                        <TrendIcon className="w-3 h-3 mr-0.5" />
                                        {data.trendBn}
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-background rounded-lg border border-border">
                                <span className="text-[10px] text-muted-foreground font-medium uppercase">সর্বোচ্চ</span>
                                <div className="text-xl font-bold mt-1 text-foreground">
                                    {data.statistics.max.toFixed(2)}
                                </div>
                            </div>

                            <div className="p-3 bg-background rounded-lg border border-border">
                                <span className="text-[10px] text-muted-foreground font-medium uppercase">সর্বনিম্ন</span>
                                <div className="text-xl font-bold mt-1 text-foreground">
                                    {data.statistics.min.toFixed(2)}
                                </div>
                            </div>

                            <div className="p-3 bg-background rounded-lg border border-border">
                                <span className="text-[10px] text-muted-foreground font-medium uppercase">গড় মান</span>
                                <div className="text-xl font-bold mt-1 text-foreground">
                                    {data.statistics.average.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.history}>
                                    <defs>
                                        <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={[0, 1]}
                                        tickCount={5}
                                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--popover))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            fontSize: '12px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        formatter={(value: number) => [value.toFixed(3), 'NDVI']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="ndvi"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        fill="url(#ndviGradient)"
                                        activeDot={{ r: 4, strokeWidth: 0, fill: '#22c55e' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Warnings */}
                        {data.warnings.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3 text-yellow-500" />
                                    সতর্কতা ও পর্যবেক্ষণ
                                </h4>
                                <div className="grid gap-2">
                                    {data.warnings.map((warning, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "flex items-start gap-3 p-3 rounded-md border text-sm",
                                                warning.severity === 'critical'
                                                    ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
                                                    : "bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                                                warning.severity === 'critical' ? "bg-red-500" : "bg-yellow-500"
                                            )} />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className="font-medium">{warning.messageBn}</span>
                                                    <span className="text-[10px] opacity-70">
                                                        {new Date(warning.date).toLocaleDateString('bn-BD')}
                                                    </span>
                                                </div>
                                                <p className="text-xs opacity-80 leading-relaxed">
                                                    পূর্ববর্তী {warning.previousNDVI.toFixed(2)} থেকে কমে {warning.currentNDVI.toFixed(2)}-এ নেমে এসেছে।
                                                    {warning.severity === 'critical'
                                                        ? ' জরুরি পর্যবেক্ষণ প্রয়োজন।'
                                                        : ' সেচ বা সার প্রয়োজন হতে পারে।'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                        <Calendar className="w-8 h-8 mb-2 opacity-20" />
                        <span className="text-sm">এই সময়ের জন্য কোনো পর্যাপ্ত ডেটা নেই</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
