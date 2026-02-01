import { useState, useCallback, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, MessageCircle, X, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBengaliVoiceInput } from '@/hooks/useBengaliVoiceInput';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoiceConversationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceConversation({ isOpen, onClose }: VoiceConversationProps) {
  const { toast } = useToast();
  
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, aiResponse]);

  // Process voice input and get AI response
  const processVoiceInput = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    console.log('Processing voice input:', userMessage);
    setIsProcessing(true);
    setStatus('processing');
    setAiResponse('');

    try {
      // Add user message to history
      const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
      setConversationHistory(newHistory);

      console.log('Calling chat function with messages:', newHistory.length);

      // Get AI response - using fetch instead of supabase.functions.invoke for better control
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: newHistory.map(m => ({ 
            role: m.role === 'user' ? 'user' : 'assistant', 
            content: m.content 
          })) 
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI response received:', data);

      const aiText = data.response || 'দুঃখিত, উত্তর দিতে পারছি না।';
      setAiResponse(aiText);

      // Add AI response to history
      setConversationHistory([...newHistory, { role: 'assistant', content: aiText }]);

      // Speak the response using ElevenLabs
      setStatus('speaking');
      await speak(aiText);

    } catch (error) {
      console.error('Voice conversation error:', error);
      toast({
        variant: 'destructive',
        title: 'সমস্যা হয়েছে',
        description: 'উত্তর পেতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
      });
    } finally {
      setIsProcessing(false);
      setCurrentTranscript('');
      setStatus('idle');
    }
  }, [conversationHistory, toast]);

  // Voice Input (Speech-to-Text)
  const {
    isListening,
    isSupported: sttSupported,
    transcript,
    toggleListening,
    stopListening,
    error: sttError,
  } = useBengaliVoiceInput({
    onResult: async (finalTranscript) => {
      console.log('Final transcript received:', finalTranscript);
      setCurrentTranscript(finalTranscript);
      await processVoiceInput(finalTranscript);
    },
    onError: (error) => {
      console.error('STT Error:', error);
      toast({
        variant: 'destructive',
        title: 'ভয়েস ইনপুট সমস্যা',
        description: error,
      });
    },
  });

  // Voice Output (Text-to-Speech)
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isLoading: ttsLoading,
  } = useElevenLabsTTS();

  // Update current transcript in real-time
  useEffect(() => {
    if (transcript) {
      setCurrentTranscript(transcript);
    }
  }, [transcript]);

  // Update status based on state
  useEffect(() => {
    if (isListening) {
      setStatus('listening');
    } else if (isProcessing) {
      setStatus('processing');
    } else if (isSpeaking) {
      setStatus('speaking');
    } else {
      setStatus('idle');
    }
  }, [isListening, isProcessing, isSpeaking]);

  // Cleanup on close
  const handleClose = useCallback(() => {
    stopListening();
    stopSpeaking();
    setConversationHistory([]);
    setCurrentTranscript('');
    setAiResponse('');
    onClose();
  }, [stopListening, stopSpeaking, onClose]);

  // Handle mic button click
  const handleMicClick = useCallback(() => {
    if (isProcessing || isSpeaking || ttsLoading) return;
    toggleListening();
  }, [isProcessing, isSpeaking, ttsLoading, toggleListening]);

  if (!isOpen) return null;

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return '🎤 শুনছি... বাংলায় বলুন';
      case 'processing':
        return '🤔 চিন্তা করছি...';
      case 'speaking':
        return '🔊 উত্তর বলছি...';
      default:
        return '👆 মাইক বাটনে চাপুন';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'text-destructive';
      case 'processing':
        return 'text-primary';
      case 'speaking':
        return 'text-secondary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <Phone className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">ভয়েস সহায়ক</h2>
            <p className="text-xs text-muted-foreground">AgriBrain AI</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
        >
          <X className="w-5 h-5 text-destructive" />
        </button>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6">
              <MessageCircle className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">স্বাগতম!</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              মাইক বাটনে চাপুন এবং বাংলায় আপনার কৃষি সম্পর্কিত প্রশ্ন করুন। 
              AI আপনাকে সাহায্য করবে।
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {['ধানের রোগ কী?', 'আজকের আবহাওয়া', 'সার কখন দেব?'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => processVoiceInput(suggestion)}
                  className="px-3 py-2 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {conversationHistory.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-card border border-border/50 text-foreground rounded-bl-sm'
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Current Transcript (Live) */}
        {currentTranscript && status === 'listening' && (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-primary/50 text-primary-foreground rounded-br-sm animate-pulse">
              <p className="text-sm">{currentTranscript}...</p>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {status === 'processing' && (
          <div className="flex justify-start">
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">চিন্তা করছি...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice Control Area */}
      <div className="p-6 bg-gradient-to-t from-card to-transparent">
        {/* Status Text */}
        <p className={cn("text-center text-sm font-medium mb-4", getStatusColor())}>
          {getStatusText()}
        </p>

        {/* Voice Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Stop Speaking Button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <VolumeX className="w-6 h-6 text-foreground" />
            </button>
          )}

          {/* Main Mic Button */}
          <button
            onClick={handleMicClick}
            disabled={isProcessing || isSpeaking || ttsLoading || !sttSupported}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all transform shadow-2xl",
              status === 'listening'
                ? "bg-gradient-to-br from-destructive to-destructive/80 scale-110 animate-pulse"
                : "bg-gradient-to-br from-primary to-primary/80 hover:scale-105",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {status === 'listening' ? (
              <MicOff className="w-8 h-8 text-destructive-foreground" />
            ) : status === 'processing' ? (
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            ) : (
              <Mic className="w-8 h-8 text-primary-foreground" />
            )}
          </button>

          {/* Volume/Speaking Indicator */}
          {isSpeaking && (
            <button
              className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shadow-lg animate-pulse"
            >
              <Volume2 className="w-6 h-6 text-secondary-foreground" />
            </button>
          )}
        </div>

        {/* Error Message */}
        {sttError && (
          <p className="text-xs text-destructive text-center mt-4">{sttError}</p>
        )}

        {/* Browser Support Warning */}
        {!sttSupported && (
          <p className="text-xs text-destructive text-center mt-4">
            আপনার ব্রাউজার ভয়েস ইনপুট সাপোর্ট করে না। Chrome ব্যবহার করুন।
          </p>
        )}

        {/* Conversation Count */}
        {conversationHistory.length > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            {Math.floor(conversationHistory.length / 2)} টি প্রশ্ন-উত্তর
          </p>
        )}
      </div>
    </div>
  );
}
