import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  to: string;
  variant?: "default" | "gold" | "mint";
  className?: string;
  delay?: number;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  to,
  variant = "default",
  className,
  delay = 0,
}: FeatureCardProps) {
  const variants = {
    default: "bg-card hover:bg-card/80",
    gold: "bg-gradient-to-br from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10",
    mint: "bg-gradient-to-br from-secondary/20 to-secondary/5 hover:from-secondary/30 hover:to-secondary/10",
  };

  const iconVariants = {
    default: "bg-muted text-foreground",
    gold: "bg-primary/20 text-primary",
    mint: "bg-secondary/20 text-secondary",
  };

  return (
    <Link
      to={to}
      className={cn(
        "block p-4 rounded-2xl border border-border transition-all duration-300",
        "hover:scale-[1.02] hover:border-primary/30 active:scale-[0.98]",
        "animate-slide-up opacity-0",
        variants[variant],
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3", iconVariants[variant])}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      )}
    </Link>
  );
}
