import { useState, useRef, useEffect } from "react";
import { Send, Bot, ArrowLeft, Sparkles, Volume2, VolumeX, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useBengaliVoiceInput } from "@/hooks/useBengaliVoiceInput";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

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
  "পোকামাকড় দমন করব কীভাবে?",
];

export default function ChatPage() {
  const initialMessage: Message = {
    id: "1",
    content: "আসসালামু আলাইকুম! আমি agriশক্তি AI। আপনার কৃষি সমস্যায় সাহায্য করতে প্রস্তুত। কী জানতে চান? 🌾",
    sender: "ai",
    timestamp: "এইমাত্র",
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Chat History & Text-to-Speech Hooks
  const { messages: savedMessages, loading: historyLoading, saveMessage, clearHistory } = useChatHistory();
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  // Load chat history on mount
  useEffect(() => {
    if (!historyLoading && savedMessages.length > 0) {
      const loadedMessages: Message[] = savedMessages.map(m => ({
        id: m.id,
        content: m.content,
        sender: m.sender,
        timestamp: new Date(m.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages([initialMessage, ...loadedMessages]);
    }
  }, [historyLoading, savedMessages]);

  // Bengali Voice Input Hook
  const {
    isListening,
    isSupported,
    transcript,
    toggleListening,
    error: voiceError,
  } = useBengaliVoiceInput({
    onResult: (finalTranscript) => {
      setInputText(finalTranscript);
      toast({
        title: "✓ কথা শোনা হয়েছে",
        description: finalTranscript.slice(0, 50) + (finalTranscript.length > 50 ? '...' : ''),
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "ভয়েস ত্রুটি",
        description: error,
      });
    },
  });

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

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
      const messageHistory = messages
        .filter(m => m.id !== "1")
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

      // Save messages to database for logged-in users
      await saveMessage(currentInput, 'user');
      await saveMessage(aiMessage.content, 'ai');

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

  const handleSpeak = (messageId: string, content: string) => {
    if (speakingMessageId === messageId && isSpeaking) {
      stop();
      setSpeakingMessageId(null);
    } else {
      stop();
      speak(content);
      setSpeakingMessageId(messageId);
    }
  };

  const handleClearHistory = async () => {
    await clearHistory();
    setMessages([initialMessage]);
    toast({
      title: "✓ চ্যাট ইতিহাস মুছে ফেলা হয়েছে",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative px-4 pt-6 pb-4 border-b border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link
            to="/home"
            className="w-11 h-11 rounded-2xl bg-card/80 flex items-center justify-center border border-border/50 hover:bg-muted/50 transition-all hover:scale-105 active:scale-95 shadow-soft"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          
          <div className="flex-1 flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-lg shadow-secondary/20">
                <Bot className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-card animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                agriশক্তি AI
                <Sparkles className="w-4 h-4 text-primary" />
              </h1>
              <p className="text-xs text-muted-foreground">কৃষি বিশেষজ্ঞ সহকারী</p>
            </div>
          </div>
          
          {/* Clear History Button */}
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearHistory}
              className="w-11 h-11 rounded-2xl bg-card/80 border border-border/50 hover:bg-destructive/20 hover:border-destructive/30 transition-all"
              title="চ্যাট ইতিহাস মুছুন"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </header>

      {/* Chat Messages */}
      <section className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-52">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex animate-slide-up",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {message.sender === "ai" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-secondary-foreground" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] px-4 py-3 shadow-soft",
                message.sender === "user"
                  ? "bg-gradient-to-br from-primary/30 to-primary/20 text-foreground rounded-2xl rounded-br-md border border-primary/20"
                  : "bg-card/80 backdrop-blur-sm border border-border/50 text-foreground rounded-2xl rounded-bl-md"
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-muted-foreground opacity-70">{message.timestamp}</p>
                {message.sender === "ai" && ttsSupported && (
                  <button
                    onClick={() => handleSpeak(message.id, message.content)}
                    className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
                    title="শুনুন"
                  >
                    {speakingMessageId === message.id && isSpeaking ? (
                      <VolumeX className="w-3.5 h-3.5 text-destructive" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mr-2 flex-shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-secondary-foreground" />
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 px-4 py-3 rounded-2xl rounded-bl-md shadow-soft">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-secondary animate-bounce"
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
      <section className="px-4 py-3 border-t border-border/30 bg-card/30 backdrop-blur-xl">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          প্রস্তাবিত প্রশ্ন
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(question)}
              className="px-4 py-2.5 rounded-2xl bg-card/80 border border-border/50 text-xs text-foreground whitespace-nowrap hover:bg-muted/50 hover:border-secondary/50 transition-all active:scale-95 shadow-soft"
            >
              {question}
            </button>
          ))}
        </div>
      </section>

      {/* Voice Input Status */}
      {isListening && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <div className="flex items-center justify-center gap-2 text-destructive">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <p className="text-sm font-medium animate-pulse">
              🎤 শুনছি... বাংলায় কথা বলুন
            </p>
          </div>
          {transcript && (
            <p className="text-xs text-center text-muted-foreground mt-1 truncate">
              "{transcript}"
            </p>
          )}
        </div>
      )}

      {/* Input Area */}
      <section className="px-4 pb-24 pt-3 bg-card/50 backdrop-blur-xl border-t border-border/30">
        <div className="flex items-center gap-3">
          {/* Voice Button */}
          <VoiceInputButton
            isListening={isListening}
            isSupported={isSupported}
            onClick={toggleListening}
            size="md"
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "শুনছি..." : "বাংলায় লিখুন বা বলুন..."}
              disabled={isLoading}
              className={cn(
                "w-full h-12 px-5 rounded-2xl",
                "bg-card/80 border-2 border-border/50",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20",
                "text-sm transition-all shadow-soft",
                "disabled:opacity-50",
                isListening && "border-destructive/50 bg-destructive/5"
              )}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={cn(
              "w-12 h-12 rounded-2xl p-0",
              "bg-gradient-to-br from-secondary to-secondary/80",
              "text-secondary-foreground shadow-lg shadow-secondary/20",
              "hover:shadow-xl hover:shadow-secondary/30 hover:scale-105",
              "transition-all active:scale-95",
              "disabled:opacity-50 disabled:hover:scale-100"
            )}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        {/* Voice Support Info */}
        {isSupported && !isListening && (
          <p className="text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
            <Volume2 className="w-3 h-3" />
            মাইক বাটনে ক্লিক করে বাংলায় কথা বলুন
          </p>
        )}
      </section>
    </div>
  );
}
