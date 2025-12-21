import { useState } from "react";
import { ArrowLeft, Calculator, RefreshCw, MapPin, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

type Unit = "bigha" | "katha" | "decimal" | "acre" | "sqFeet" | "sqMeter";

interface ConversionResult {
  bigha: number;
  katha: number;
  decimal: number;
  acre: number;
  sqFeet: number;
  sqMeter: number;
}

// Bangladesh standard conversions
const TO_DECIMAL: Record<Unit, number> = {
  bigha: 33,        // 1 bigha = 33 decimal
  katha: 1.65,      // 1 katha = 1.65 decimal
  decimal: 1,       // base unit
  acre: 100,        // 1 acre = 100 decimal
  sqFeet: 0.00229568, // 1 sq feet = 0.00229568 decimal
  sqMeter: 0.02471,  // 1 sq meter = 0.02471 decimal
};

const unitLabels: Record<Unit, { bn: string; en: string }> = {
  bigha: { bn: "বিঘা", en: "Bigha" },
  katha: { bn: "কাঠা", en: "Katha" },
  decimal: { bn: "শতক", en: "Decimal" },
  acre: { bn: "একর", en: "Acre" },
  sqFeet: { bn: "বর্গফুট", en: "Sq Feet" },
  sqMeter: { bn: "বর্গমিটার", en: "Sq Meter" },
};

export default function LandCalculatorPage() {
  const { t, language } = useLanguage();
  const [landSize, setLandSize] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<Unit>("decimal");
  const [pricePerUnit, setPricePerUnit] = useState<string>("");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

  const calculateConversion = () => {
    const size = parseFloat(landSize);
    if (isNaN(size) || size <= 0) return;

    // Convert to decimal first
    const inDecimal = size * TO_DECIMAL[selectedUnit];

    // Convert from decimal to all units
    const conversions: ConversionResult = {
      bigha: inDecimal / TO_DECIMAL.bigha,
      katha: inDecimal / TO_DECIMAL.katha,
      decimal: inDecimal,
      acre: inDecimal / TO_DECIMAL.acre,
      sqFeet: inDecimal / TO_DECIMAL.sqFeet,
      sqMeter: inDecimal / TO_DECIMAL.sqMeter,
    };

    setResult(conversions);

    // Calculate price if provided
    const price = parseFloat(pricePerUnit);
    if (!isNaN(price) && price > 0) {
      setTotalPrice(size * price);
    } else {
      setTotalPrice(null);
    }
  };

  const handleReset = () => {
    setLandSize("");
    setSelectedUnit("decimal");
    setPricePerUnit("");
    setResult(null);
    setTotalPrice(null);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1) {
      return num.toLocaleString("bn-BD", { maximumFractionDigits: 2 });
    }
    return num.toLocaleString("bn-BD", { maximumFractionDigits: 4 });
  };

  const getUnitLabel = (unit: Unit): string => {
    return language === "en" ? unitLabels[unit].en : unitLabels[unit].bn;
  };

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
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-4 px-4 py-4">
          <Link to="/home" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t("landCalculatorTitle")}</h1>
              <p className="text-sm text-muted-foreground">{t("landCalculatorDesc")}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="px-4 py-6 space-y-6">
        {/* Input Card */}
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5 text-secondary" />
              {t("enterLandSize")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Land Size Input */}
            <div className="space-y-2">
              <Label htmlFor="landSize">{t("enterLandSize")}</Label>
              <Input
                id="landSize"
                type="number"
                placeholder="0.00"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value)}
                className="bg-background/50 text-lg font-semibold"
              />
            </div>

            {/* Unit Selection */}
            <div className="space-y-2">
              <Label>{t("selectUnit")}</Label>
              <Select value={selectedUnit} onValueChange={(v) => setSelectedUnit(v as Unit)}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(unitLabels) as Unit[]).map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {getUnitLabel(unit)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Input (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                {t("pricePerUnit")} ({language === "en" ? "Optional" : "ঐচ্ছিক"})
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="৳ 0"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className="bg-background/50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={calculateConversion}
                className="flex-1 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/70"
              >
                <Calculator className="w-4 h-4 mr-2" />
                {t("calculate")}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-border"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t("reset")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-fade-in">
            {/* Conversion Results */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t("conversion")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(result) as Unit[]).map((unit) => (
                    <div
                      key={unit}
                      className={cn(
                        "p-3 rounded-xl border transition-all",
                        unit === selectedUnit
                          ? "bg-secondary/20 border-secondary"
                          : "bg-background/30 border-border"
                      )}
                    >
                      <p className="text-xs text-muted-foreground">{getUnitLabel(unit)}</p>
                      <p className="text-lg font-bold text-foreground">
                        {formatNumber(result[unit])}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Total Price */}
            {totalPrice !== null && (
              <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">{t("totalPrice")}</p>
                    <p className="text-3xl font-bold text-primary">
                      ৳ {totalPrice.toLocaleString("bn-BD")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {landSize} {getUnitLabel(selectedUnit)} × ৳{parseFloat(pricePerUnit).toLocaleString("bn-BD")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Reference Card */}
        <Card className="bg-card/60 backdrop-blur-sm border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              {language === "en" ? "Quick Reference (Bangladesh Standard)" : "দ্রুত রেফারেন্স (বাংলাদেশ মানক)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">১ বিঘা</span>
                <span className="text-foreground font-medium">= ৩৩ শতক = ২০ কাঠা</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">১ একর</span>
                <span className="text-foreground font-medium">= ১০০ শতক = ৩.০৩ বিঘা</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">১ কাঠা</span>
                <span className="text-foreground font-medium">= ১.৬৫ শতক = ৭২০ বর্গফুট</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">১ শতক</span>
                <span className="text-foreground font-medium">= ৪৩৫.৬ বর্গফুট</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
