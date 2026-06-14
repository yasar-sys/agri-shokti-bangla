import { useState, useEffect, useCallback, useMemo } from "react";
import { useWeatherAlerts } from "./useWeatherAlerts";
import { useFarmingTips } from "./useFarmingTips";
import { useMarketPrices } from "./useMarketPrices";

export type NotificationType = "weather" | "market" | "tip" | "reminder";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity?: string | null;
  createdAt: string; // ISO string
}

const READ_KEY = "notif-read-ids";
const DISMISSED_KEY = "notif-dismissed-ids";

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

function saveSet(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

/**
 * Smart in-app notification center.
 * Aggregates live weather alerts, market movement and farming tips into a single
 * notification feed. Read/dismissed state is persisted locally per device.
 */
export function useNotifications() {
  const { alerts } = useWeatherAlerts();
  const { tips } = useFarmingTips();
  const { prices } = useMarketPrices();

  const [readIds, setReadIds] = useState<Set<string>>(() => loadSet(READ_KEY));
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => loadSet(DISMISSED_KEY));

  useEffect(() => saveSet(READ_KEY, readIds), [readIds]);
  useEffect(() => saveSet(DISMISSED_KEY, dismissedIds), [dismissedIds]);

  const allNotifications = useMemo<AppNotification[]>(() => {
    const items: AppNotification[] = [];

    // Weather alerts (highest priority)
    (alerts || []).forEach((a) => {
      items.push({
        id: `weather-${a.id}`,
        type: "weather",
        title: a.title,
        message: a.message,
        severity: a.severity,
        createdAt: a.valid_from || new Date().toISOString(),
      });
    });

    // Smart market movement alerts (notable price changes vs yesterday)
    (prices || []).forEach((p) => {
      if (!p.yesterday_price || !p.today_price) return;
      const diff = p.today_price - p.yesterday_price;
      const pct = (diff / p.yesterday_price) * 100;
      if (Math.abs(pct) >= 3) {
        const up = diff > 0;
        items.push({
          id: `market-${p.id}-${p.updated_at}`,
          type: "market",
          title: `${p.crop_emoji || ""} ${p.crop_name} ${up ? "↑" : "↓"} ${Math.abs(pct).toFixed(0)}%`,
          message: `${p.today_price} ${p.unit || ""} (${up ? "+" : ""}${diff.toFixed(0)})`,
          createdAt: p.updated_at || new Date().toISOString(),
        });
      }
    });


    // Daily farming tips
    (tips || []).slice(0, 3).forEach((tip) => {
      items.push({
        id: `tip-${tip.id}`,
        type: "tip",
        title: tip.category || "Tip",
        message: tip.tip_text,
        createdAt: new Date().toISOString(),
      });
    });

    return items
      .filter((n) => !dismissedIds.has(n.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [alerts, prices, tips, dismissedIds]);

  const unreadCount = useMemo(
    () => allNotifications.filter((n) => !readIds.has(n.id)).length,
    [allNotifications, readIds]
  );

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      allNotifications.forEach((n) => next.add(n.id));
      return next;
    });
  }, [allNotifications]);

  const dismiss = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      allNotifications.forEach((n) => next.add(n.id));
      return next;
    });
  }, [allNotifications]);

  return {
    notifications: allNotifications,
    unreadCount,
    isRead,
    markRead,
    markAllRead,
    dismiss,
    clearAll,
  };
}
