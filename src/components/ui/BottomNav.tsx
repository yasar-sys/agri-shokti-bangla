import { cn } from "@/lib/utils";
import { Home, Camera, MessageCircle, BarChart3, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "হোম", path: "/" },
  { icon: Camera, label: "স্ক্যান", path: "/camera" },
  { icon: MessageCircle, label: "চ্যাট", path: "/chat" },
  { icon: BarChart3, label: "বাজার", path: "/market" },
  { icon: Settings, label: "সেটিংস", path: "/settings" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="mobile-container">
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-300",
                  isActive
                    ? "text-primary glow-gold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all duration-300",
                    isActive && "bg-primary/20"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
