import { useState } from "react";
import { Bell, CloudRain, TrendingUp, Lightbulb, Clock, X, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications, NotificationType } from "@/hooks/useNotifications";
import { useLanguageSafe } from "@/contexts/LanguageContext";

const typeConfig: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string; labelKey: string }
> = {
  weather: { icon: CloudRain, color: "text-blue-500", bg: "bg-blue-500/10", labelKey: "weatherAlertLabel" },
  market: { icon: TrendingUp, color: "text-secondary", bg: "bg-secondary/10", labelKey: "marketUpdateLabel" },
  tip: { icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10", labelKey: "farmingTipLabel" },
  reminder: { icon: Clock, color: "text-primary", bg: "bg-primary/10", labelKey: "reminderLabel" },
};

export function NotificationCenter({ className }: { className?: string }) {
  const { t } = useLanguageSafe();
  const { notifications, unreadCount, isRead, markRead, markAllRead, dismiss, clearAll } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return t("timeNow");
    if (min < 60) return `${min} ${t("timeMinAgo")}`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} ${t("timeHourAgo")}`;
    return `${Math.floor(hr / 24)} ${t("timeDayAgo")}`;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label={t("notificationCenter")}
          className={cn(
            "relative w-10 h-10 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors flex items-center justify-center",
            className
          )}
        >
          <Bell className="w-5 h-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-secondary" />
              {t("notificationCenter")}
            </SheetTitle>
            {notifications.length > 0 && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={markAllRead}>
                  <Check className="w-3.5 h-3.5" />
                  {t("markAllRead")}
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">{t("noNotifications")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("noNotificationsDesc")}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const cfg = typeConfig[n.type];
                const Icon = cfg.icon;
                const read = isRead(n.id);
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "flex gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/40 relative",
                      !read && "bg-secondary/5"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                      <Icon className={cn("w-5 h-5", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {t(cfg.labelKey)}
                        </span>
                        {!read && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                        <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground line-clamp-2">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">{n.message}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismiss(n.id);
                      }}
                      className="p-1 rounded-md hover:bg-background/80 h-fit"
                      aria-label={t("close")}
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-border">
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={clearAll}>
              <X className="w-4 h-4" />
              {t("clearAll")}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
