import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface Badge {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  xp: number;
}

export function useBadgeNotification(badges: Badge[]) {
  const previousBadgesRef = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);

  const triggerConfetti = useCallback(() => {
    // First burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#fbbf24', '#f59e0b'],
    });

    // Second burst (delayed)
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#16a34a', '#22c55e', '#4ade80'],
      });
    }, 150);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fbbf24', '#f59e0b', '#d97706'],
      });
    }, 300);
  }, []);

  const showBadgeNotification = useCallback((badge: Badge) => {
    triggerConfetti();
    
    toast.success(
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center animate-bounce">
          <span className="text-2xl">🎉</span>
        </div>
        <div>
          <p className="font-bold text-base">নতুন ব্যাজ অর্জিত! 🏆</p>
          <p className="font-semibold">{badge.title}</p>
          <p className="text-sm text-muted-foreground">{badge.description}</p>
          <p className="text-sm font-medium text-primary mt-1">+{badge.xp} XP অর্জিত!</p>
        </div>
      </div>,
      {
        duration: 6000,
        className: "!bg-gradient-to-r !from-secondary/20 !to-primary/20 !border-secondary/50",
      }
    );
  }, [triggerConfetti]);

  useEffect(() => {
    // Skip initial mount to avoid false notifications on page load
    if (isInitialMount.current) {
      // Initialize the previous badges set with currently earned badges
      const earnedBadgeIds = badges.filter(b => b.earned).map(b => b.id);
      previousBadgesRef.current = new Set(earnedBadgeIds);
      isInitialMount.current = false;
      return;
    }

    // Check for newly earned badges
    badges.forEach((badge) => {
      if (badge.earned && !previousBadgesRef.current.has(badge.id)) {
        // New badge earned!
        showBadgeNotification(badge);
        previousBadgesRef.current.add(badge.id);
      }
    });
  }, [badges, showBadgeNotification]);

  // Manual trigger function for testing
  const celebrateBadge = useCallback((badge: Badge) => {
    showBadgeNotification(badge);
  }, [showBadgeNotification]);

  return { celebrateBadge, triggerConfetti };
}
