import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VoiceInputButton({
  isListening,
  isSupported,
  onClick,
  className,
  size = "md",
}: VoiceInputButtonProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className={cn(
          sizeClasses[size],
          "rounded-2xl flex items-center justify-center",
          "bg-muted/50 text-muted-foreground cursor-not-allowed",
          "border border-border/50",
          className
        )}
        title="ভয়েস ইনপুট সাপোর্টেড নয়"
      >
        <MicOff className={iconSizes[size]} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        sizeClasses[size],
        "rounded-2xl flex items-center justify-center relative",
        "transition-all duration-300 transform active:scale-95",
        isListening
          ? "bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground shadow-lg shadow-destructive/30 animate-pulse"
          : "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground hover:shadow-lg hover:shadow-secondary/30 hover:scale-105",
        "border-2",
        isListening ? "border-destructive/50" : "border-secondary/50",
        className
      )}
      title={isListening ? "রেকর্ডিং বন্ধ করুন" : "কথা বলে প্রশ্ন করুন"}
    >
      {/* Pulse rings when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-2xl bg-destructive/20 animate-ping" />
          <span className="absolute inset-[-4px] rounded-2xl border-2 border-destructive/30 animate-pulse" />
        </>
      )}
      
      {isListening ? (
        <div className="relative z-10 flex items-center justify-center">
          <Mic className={cn(iconSizes[size], "animate-bounce")} />
        </div>
      ) : (
        <Mic className={cn(iconSizes[size], "relative z-10")} />
      )}
    </button>
  );
}
