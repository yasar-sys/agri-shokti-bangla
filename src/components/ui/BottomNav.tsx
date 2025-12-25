import { cn } from "@/lib/utils";
import { Scan, MessageSquare, Home, Mic } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, labelKey: "home", path: "/home" },
    { icon: Scan, labelKey: "scanner", path: "/camera" },
    { icon: MessageSquare, labelKey: "aiChat", path: "/chat" },
    { icon: Mic, labelKey: "support", path: "/support" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glass background */}
      <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border/30" />
      
      {/* Gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      
      <div className="relative flex items-center justify-around py-2 px-2 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2 px-5 rounded-2xl transition-all duration-300",
                isActive
                  ? "text-secondary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active background */}
              {isActive && (
                <div className="absolute inset-0 bg-secondary/10 rounded-2xl border border-secondary/20" />
              )}
              
              <div className={cn(
                "relative p-2.5 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-lg shadow-secondary/30 scale-105" 
                  : "hover:bg-muted/50"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              
              <span className={cn(
                "relative text-[10px] font-medium transition-colors",
                isActive && "text-secondary"
              )}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
