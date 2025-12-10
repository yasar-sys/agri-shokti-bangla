import { useState } from "react";
import { Send, Mic, MicOff, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/ui/ChatBubble";

interface Message {
  id: string;
  content: string;
  sender: "ai" | "user";
  timestamp: string;
}

const suggestedQuestions = [
  "ধানের পাতা হলুদ হয়ে যাচ্ছে কেন?",
  "কখন সার দেওয়া উচিত?",
  "বৃষ্টিতে ফসল রক্ষা করব কীভাবে?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "আসসালামু আলাইকুম! আমি AgriBrain AI। আপনার কৃষি সমস্যায় সাহায্য করতে প্রস্তুত। কী জানতে চান?",
      sender: "ai",
      timestamp: "এইমাত্র",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      sender: "user",
      timestamp: "এইমাত্র",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI response - would be POST /api/ai/chat
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "আপনার প্রশ্নের জন্য ধন্যবাদ! ধানের পাতা হলুদ হওয়ার বিভিন্ন কারণ থাকতে পারে - নাইট্রোজেনের অভাব, পানির সমস্যা, বা রোগ। আপনার জমির ছবি পাঠালে আরও ভালো পরামর্শ দিতে পারব।",
        sender: "ai",
        timestamp: "এইমাত্র",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (question: string) => {
    setInputText(question);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice-to-Text API would be called here
  };

  return (
    <div className="mobile-container min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI কৃষি সহকারী</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs text-muted-foreground">অনলাইন • POST /api/ai/chat</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <section className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-40">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message.content}
            sender={message.sender}
            timestamp={message.timestamp}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-secondary animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <span className="text-sm">AI টাইপ করছে...</span>
          </div>
        )}
      </section>

      {/* Suggestions */}
      <section className="px-4 py-3 border-t border-border bg-background/95 backdrop-blur">
        <p className="text-xs text-muted-foreground mb-2">প্রস্তাবিত প্রশ্ন:</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(question)}
              className="px-3 py-2 rounded-xl bg-card border border-border text-sm text-foreground whitespace-nowrap hover:bg-muted transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </section>

      {/* Input Area */}
      <section className="px-4 pb-24 pt-2 bg-background border-t border-border">
        <div className="flex items-center gap-2">
          {/* Voice Button */}
          <button
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isRecording
                ? "bg-destructive text-destructive-foreground glow-gold"
                : "bg-card border border-border text-foreground hover:bg-muted"
            }`}
          >
            {isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="আপনার প্রশ্ন লিখুন..."
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-12 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        {isRecording && (
          <p className="text-xs text-center text-destructive mt-2 animate-pulse">
            🎤 রেকর্ডিং চলছে... কথা বলুন
          </p>
        )}
      </section>
    </div>
  );
}
