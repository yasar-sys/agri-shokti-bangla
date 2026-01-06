import { useState, useEffect } from "react";
import { Brain, Sparkles, ChevronRight, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SatelliteAIInsightProps {
    ndviValue: number;
    moistureValue: number;
    trend: "improving" | "stable" | "declining";
    onAction?: (action: string) => void;
    className?: string;
}

export function SatelliteAIInsight({
    ndviValue,
    moistureValue,
    trend,
    onAction,
    className
}: SatelliteAIInsightProps) {
    const [insight, setInsight] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real implementation, this would call Gemini
        // For now, we use a robust template-based insight generator
        const generateInsight = () => {
            setLoading(true);

            let message = "";
            if (ndviValue >= 0.8) {
                message = "আপনার ফসলের স্বাস্থ্য চমৎকার। NASA-র তথ্য অনুযায়ী সবুজের ঘনত্ব সর্বোচ্চ পর্যায়ে আছে।";
            } else if (ndviValue >= 0.6) {
                message = "ফসলের অবস্থা বেশ ভালো। তবে মাটির আর্দ্রতা নিয়মিত পর্যবেক্ষণ করুন।";
            } else if (ndviValue >= 0.4) {
                message = "মাঝারি স্বাস্থ্য। কিছু এলাকায় পুষ্টির অভাব বা পানির ঘাটতি থাকতে পারে।";
            } else {
                message = "সতর্কতা! ফসলের স্বাস্থ্য আশঙ্কাজনকভাবে কম। দ্রুত ব্যবস্থা নেওয়া প্রয়োজন।";
            }

            if (trend === "declining") {
                message += " গত সপ্তাহ থেকে স্বাস্থ্যের অবনতি লক্ষ্য করা গেছে।";
            } else if (trend === "improving") {
                message += " আশার কথা হলো, স্বাস্থ্যের উন্নতি হচ্ছে।";
            }

            setTimeout(() => {
                setInsight(message);
                setLoading(false);
            }, 800);
        };

        generateInsight();
    }, [ndviValue, moistureValue, trend]);

    return (
        <Card className={cn("bg-background/95 backdrop-blur-md border border-primary/20 shadow-xl overflow-hidden", className)}>
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-base font-bold">AI অন্তর্দৃষ্টি</CardTitle>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    Live
                </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
                <div className="relative">
                    {loading ? (
                        <div className="space-y-2">
                            <div className="h-4 bg-muted animate-pulse rounded w-full" />
                            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                        </div>
                    ) : (
                        <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                            {insight}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1 py-0 px-2"
                        onClick={() => onAction?.("irrigation")}
                    >
                        <Info className="w-3 h-3" />
                        বিস্তারিত
                        <ChevronRight className="w-3 h-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
