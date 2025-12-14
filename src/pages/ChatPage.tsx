import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Bot, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
      content: "আসসালামু আলাইকুম! আমি agriশক্তি AI। আপনার কৃষি সমস্যায় সাহায্য করতে প্রস্তুত। কী জানতে চান?",
      sender: "ai",
      timestamp: "এইমাত্র",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      sender: "user",
      timestamp: "এইমাত্র",
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsLoading(true);

    try {
      // Build message history for context
      const messageHistory = messages
        .filter(m => m.id !== "1") // Exclude initial greeting
        .map(m => ({
          role: m.sender === "ai" ? "assistant" : "user",
          content: m.content
        }));
      
      messageHistory.push({ role: "user", content: currentInput });

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: messageHistory }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "দুঃখিত, উত্তর দিতে পারছি না।",
        sender: "ai",
        timestamp: "এইমাত্র",
      };
      
      setMessages((prev) => [...prev, aiMessage]);

      // Save to database
      await supabase.from('chat_messages').insert([
        { content: currentInput, sender: 'user' },
        { content: aiMessage.content, sender: 'ai' }
      ]);

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: "উত্তর পেতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "দুঃখিত, সাময়িক সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        sender: "ai",
        timestamp: "এইমাত্র",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInputText(question);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "রেকর্ডিং বন্ধ" : "রেকর্ডিং শুরু",
      description: isRecording ? "ভয়েস রেকর্ডিং বন্ধ হয়েছে" : "কথা বলুন...",
    });
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10, 31, 23, 0.92), rgba(10, 31, 23, 0.98)), url(/src/assets/bangladesh-village-bg.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header className="px-4 pt-8 pb-4 border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">agriশক্তি AI সহকারী</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs text-muted-foreground">অনলাইন</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <section className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-48">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] px-4 py-3 rounded-2xl",
                message.sender === "user"
                  ? "bg-primary/20 text-foreground rounded-br-md"
                  : "bg-card border border-border text-foreground rounded-bl-md"
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{message.timestamp}</p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-secondary animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </section>

      {/* Suggestions */}
      <section className="px-4 py-3 border-t border-border bg-background">
        <p className="text-xs text-muted-foreground mb-2">প্রস্তাবিত প্রশ্ন:</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(question)}
              className="px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground whitespace-nowrap hover:bg-muted transition-colors active:scale-95"
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
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
              isRecording
                ? "bg-destructive text-destructive-foreground"
                : "bg-card border border-border text-foreground hover:bg-muted"
            )}
          >
            {isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="আপনার প্রশ্ন লিখুন..."
            disabled={isLoading}
            className="flex-1 h-11 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary text-sm disabled:opacity-50"
          />

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="w-11 h-11 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 p-0"
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
