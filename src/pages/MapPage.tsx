import { useState } from "react";
import { MapPin, Layers, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapMarker } from "@/components/ui/MapMarker";

interface Field {
  id: string;
  name: string;
  status: "healthy" | "warning" | "disease";
  healthScore: number;
  lastScan: string;
  position: { top: string; left: string };
}

const fieldsData: Field[] = [
  { id: "1", name: "উত্তর জমি", status: "healthy", healthScore: 92, lastScan: "২ ঘণ্টা আগে", position: { top: "25%", left: "30%" } },
  { id: "2", name: "দক্ষিণ জমি", status: "warning", healthScore: 68, lastScan: "১ দিন আগে", position: { top: "45%", left: "55%" } },
  { id: "3", name: "পশ্চিম জমি", status: "disease", healthScore: 35, lastScan: "৩ ঘণ্টা আগে", position: { top: "60%", left: "25%" } },
  { id: "4", name: "পূর্ব জমি", status: "healthy", healthScore: 88, lastScan: "৫ ঘণ্টা আগে", position: { top: "35%", left: "70%" } },
];

export default function MapPage() {
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  return (
    <div 
      className="mobile-container min-h-screen"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10, 31, 23, 0.92), rgba(10, 31, 23, 0.98)), url(/src/assets/bangladesh-village-bg.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div className="bg-card/90 backdrop-blur rounded-xl px-4 py-2 border border-border">
            <h1 className="text-lg font-bold text-foreground">জমির মানচিত্র</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>GET /api/fields</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="bg-card/90 backdrop-blur border-border">
              <Layers className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="bg-card/90 backdrop-blur border-border">
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Map Area */}
      <div className="relative h-screen bg-gradient-to-b from-muted/30 to-background">
        {/* Grid pattern for map background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(123, 242, 160, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(123, 242, 160, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Field markers */}
        {fieldsData.map((field) => (
          <div
            key={field.id}
            className="absolute"
            style={{ top: field.position.top, left: field.position.left }}
          >
            <MapMarker
              status={field.status}
              fieldName={field.name}
              healthScore={field.healthScore}
              lastScan={field.lastScan}
              onClick={() => setSelectedField(field)}
            />
          </div>
        ))}

        {/* Add Field Button */}
        <div className="absolute bottom-32 right-4">
          <Button className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg glow-gold">
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-24 left-4 right-4">
        <div className="p-4 rounded-2xl bg-card/95 backdrop-blur border border-border">
          <h3 className="font-medium text-foreground mb-3">জমির স্বাস্থ্য</h3>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-secondary" />
              <span className="text-sm text-muted-foreground">সুস্থ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">সতর্কতা</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-destructive" />
              <span className="text-sm text-muted-foreground">রোগাক্রান্ত</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Field Detail */}
      {selectedField && (
        <div className="fixed inset-0 z-30 flex items-end" onClick={() => setSelectedField(null)}>
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />
          <div 
            className="relative w-full p-6 rounded-t-3xl bg-card border-t border-border animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-4" />
            
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedField.name}</h2>
                <p className="text-sm text-muted-foreground">শেষ স্ক্যান: {selectedField.lastScan}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedField.status === "healthy" 
                  ? "bg-secondary/20 text-secondary" 
                  : selectedField.status === "warning"
                  ? "bg-primary/20 text-primary"
                  : "bg-destructive/20 text-destructive"
              }`}>
                {selectedField.status === "healthy" ? "সুস্থ" : selectedField.status === "warning" ? "সতর্কতা" : "রোগাক্রান্ত"}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">স্বাস্থ্য স্কোর</p>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    selectedField.healthScore >= 80 
                      ? "bg-secondary" 
                      : selectedField.healthScore >= 50
                      ? "bg-primary"
                      : "bg-destructive"
                  }`}
                  style={{ width: `${selectedField.healthScore}%` }}
                />
              </div>
              <p className="text-right text-sm text-foreground mt-1">{selectedField.healthScore}%</p>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-secondary text-secondary-foreground">
                বিস্তারিত দেখুন
              </Button>
              <Button variant="outline" className="flex-1 border-border">
                স্ক্যান করুন
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              POST /api/fields/update
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
