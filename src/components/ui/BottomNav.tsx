import { cn } from "@/lib/utils";
import { Home, Scan, MessageSquare, History, Award } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "হোম", path: "/home" },
  { icon: Scan, label: "স্ক্যান", path: "/camera" },
  { icon: MessageSquare, label: "চ্যাট", path: "/chat" },
  { icon: History, label: "ইতিহাস", path: "/history" },
  { icon: Award, label: "পুরস্কার", path: "/gamification" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all",
                isActive
                  ? "text-secondary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-secondary")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
