import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  sender: "ai" | "user";
  timestamp?: string;
  className?: string;
}

export function ChatBubble({ message, sender, timestamp, className }: ChatBubbleProps) {
  const isAi = sender === "ai";

  return (
    <div
      className={cn(
        "flex gap-3 animate-slide-up",
        isAi ? "flex-row" : "flex-row-reverse",
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          isAi ? "bg-secondary/20" : "bg-agri-soil"
        )}
      >
        {isAi ? (
          <Bot className="w-5 h-5 text-secondary" />
        ) : (
          <User className="w-5 h-5 text-foreground" />
        )}
      </div>

      {/* Message */}
      <div
        className={cn(
          "max-w-[75%] px-4 py-3 rounded-2xl",
          isAi
            ? "bg-secondary/20 text-foreground rounded-tl-sm"
            : "bg-agri-soil text-foreground rounded-tr-sm"
        )}
      >
        <p className="text-sm leading-relaxed">{message}</p>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 block">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}
