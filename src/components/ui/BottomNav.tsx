import { cn } from "@/lib/utils";
import { Scan, MessageSquare, HeadphonesIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Scan, label: "স্ক্যানার", path: "/camera" },
  { icon: MessageSquare, label: "AI চ্যাট", path: "/chat" },
  { icon: HeadphonesIcon, label: "সাপোর্ট", path: "/support" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg shadow-background/50">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-6 rounded-2xl transition-all duration-300",
                isActive
                  ? "bg-secondary/20 text-secondary scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                isActive && "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/30"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[11px] font-medium",
                isActive && "text-secondary"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
