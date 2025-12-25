import { WifiOff } from "lucide-react";
import { useLanguageSafe } from "@/contexts/LanguageContext";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { cn } from "@/lib/utils";

export function OfflineBanner() {
  const isOffline = useOfflineStatus();
  const { t } = useLanguageSafe();

  if (!isOffline) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-destructive/90 backdrop-blur-sm",
        "px-4 py-2",
        "flex items-center justify-center gap-2",
        "text-sm font-medium text-destructive-foreground",
        "animate-slide-down"
      )}
    >
      <WifiOff className="w-4 h-4" />
      <span>{t("offlineMessage")}</span>
    </div>
  );
}
