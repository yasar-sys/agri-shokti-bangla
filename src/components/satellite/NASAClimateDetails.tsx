import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Thermometer,
    CloudRain,
    Droplets,
    Sun,
    Wind,
    Info,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Brain
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface NASAClimateDetailsProps {
    data: any;
    loading: boolean;
}

export const NASAClimateDetails: React.FC<NASAClimateDetailsProps> = ({ data, loading }) => {
    const { t } = useLanguage();

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="h-32 bg-card/40 backdrop-blur-md border-border/50 animate-pulse" />
                ))}
            </div>
        );
    }

    if (!data) return null;

    const metrics = [
        {
            label: t('temperature') || 'তাপমাত্রা',
            value: `${data.temperature.current?.toFixed(1) || '--'}°C`,
            subValue: `${data.temperature.min?.toFixed(1)}° - ${data.temperature.max?.toFixed(1)}°`,
            icon: Thermometer,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            trend: data.temperature.trend
        },
        {
            label: t('precipitation') || 'বৃষ্টিপাত',
            value: `${data.precipitation.total?.toFixed(1) || '0'} mm`,
            subValue: t('lastRain') || 'শেষ বৃষ্টি: ' + (data.precipitation.last_rain_date || t('noData') || 'নেই'),
            icon: CloudRain,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            trend: data.precipitation.trend
        },
        {
            label: t('humidity') || 'আর্দ্রতা',
            value: `${data.humidity.current?.toFixed(0) || '--'}%`,
            subValue: t('avg') || 'গড়: ' + data.humidity.average?.toFixed(0) + '%',
            icon: Droplets,
            color: "text-cyan-500",
            bg: "bg-cyan-500/10"
        },
        {
            label: t('solar') || 'সৌরশক্তি',
            value: `${data.solar.current?.toFixed(1) || '--'}`,
            subValue: 'MJ/m²/day',
            icon: Sun,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10"
        },
        {
            label: t('wind') || 'বাতাস',
            value: `${data.wind.current?.toFixed(1) || '--'} km/h`,
            subValue: t('avg') || 'গড়: ' + data.wind.average?.toFixed(1) + ' km/h',
            icon: Wind,
            color: "text-slate-400",
            bg: "bg-slate-500/10"
        }
    ];

    const getTrendIcon = (trend: string) => {
        if (trend === 'increasing') return <ArrowUpRight className="w-3 h-3 text-red-500" />;
        if (trend === 'decreasing') return <ArrowDownRight className="w-3 h-3 text-blue-500" />;
        return <Minus className="w-3 h-3 text-muted-foreground" />;
    };

    return (
        <div className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <h2 className="text-xl font-bold">{t('climateInsights') || 'NASA জলবায়ু বিশ্লেষণ'}</h2>
                    <Badge variant="outline" className="ml-2 bg-primary/5 text-[10px] uppercase tracking-wider">
                        NASA POWER API
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {metrics.map((metric, idx) => (
                    <Card key={idx} className="relative overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-card/40 backdrop-blur-md border-border/50">
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={cn("p-2 rounded-xl", metric.bg)}>
                                    <metric.icon className={cn("w-5 h-5", metric.color)} />
                                </div>
                                {metric.trend && getTrendIcon(metric.trend)}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                                <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                                <p className="text-[10px] text-muted-foreground/70 truncate">{metric.subValue}</p>
                            </div>
                        </div>
                        <div className={cn("absolute bottom-0 left-0 h-1 transition-all duration-500 w-0 group-hover:w-full", metric.bg.replace('/10', '/30'))} />
                    </Card>
                ))}
            </div>

            {data.recommendations && data.recommendations.length > 0 && (
                <Card className="bg-gradient-to-br from-primary/5 via-card to-secondary/5 border-primary/10 overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-primary/10 rounded-2xl relative">
                                <Brain className="w-6 h-6 text-primary" />
                                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{t('aiRecommendations') || 'কৃষি পরামর্শ'}</h3>
                                <p className="text-xs text-muted-foreground">NASA ডেটা ভিত্তিক বিশ্লেষণ</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {data.recommendations.map((rec: string, i: number) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 p-4 rounded-2xl bg-background/40 border border-border/40 hover:border-primary/20 transition-colors group"
                                >
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0" />
                                    <p className="text-sm leading-relaxed text-foreground/90">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};
