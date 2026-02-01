import { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBengaliVoiceInput } from '@/hooks/useBengaliVoiceInput';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceConversationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceConversation({ isOpen, onClose }: VoiceConversationProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  // Voice Input (Speech-to-Text)
  const {
    isListening,
    isSupported: sttSupported,
    transcript,
    toggleListening,
    stopListening,
  } = useBengaliVoiceInput({
    onResult: async (finalTranscript) => {
      setCurrentTranscript(finalTranscript);
      await processVoiceInput(finalTranscript);
    },
    onError: (error) => {
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

  // Process voice input and get AI response
  const processVoiceInput = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setIsProcessing(true);
    setAiResponse('');

    try {
      // Add user message to history
      const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
      setConversationHistory(newHistory);

      // Get AI response
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: newHistory.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })) }
      });

      if (error) throw error;

      const response = data.response || 'দুঃখিত, উত্তর দিতে পারছি না।';
      setAiResponse(response);

      // Add AI response to history
      setConversationHistory([...newHistory, { role: 'assistant', content: response }]);

      // Speak the response using ElevenLabs
      await speak(response);

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
    }
  }, [conversationHistory, speak, toast]);

  // Cleanup on close
  const handleClose = useCallback(() => {
    stopListening();
    stopSpeaking();
    onClose();
  }, [stopListening, stopSpeaking, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl w-full max-w-md p-6 border border-border/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">ভয়েস কথোপকথন</h2>
              <p className="text-xs text-muted-foreground">বাংলায় কথা বলুন</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Voice Visualization */}
        <div className="relative h-48 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
          {/* Animated circles when listening or speaking */}
          {(isListening || isSpeaking) && (
            <>
              <div className={cn(
                "absolute w-24 h-24 rounded-full animate-ping",
                isListening ? "bg-destructive/20" : "bg-secondary/20"
              )} />
              <div className={cn(
                "absolute w-32 h-32 rounded-full animate-pulse",
                isListening ? "bg-destructive/10" : "bg-secondary/10"
              )} />
            </>
          )}

          <div className={cn(
            "relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
            isListening 
              ? "bg-gradient-to-br from-destructive to-destructive/80 scale-110" 
              : isSpeaking 
                ? "bg-gradient-to-br from-secondary to-secondary/80 scale-110"
                : isProcessing
                  ? "bg-gradient-to-br from-primary to-primary/80"
                  : "bg-gradient-to-br from-muted to-muted/80"
          )}>
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            ) : isListening ? (
              <Mic className="w-8 h-8 text-destructive-foreground animate-pulse" />
            ) : isSpeaking ? (
              <Volume2 className="w-8 h-8 text-secondary-foreground animate-pulse" />
            ) : (
              <MicOff className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          {/* Status Text */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className={cn(
              "text-sm font-medium",
              isListening ? "text-destructive animate-pulse" : 
              isSpeaking ? "text-secondary" : 
              isProcessing ? "text-primary" : "text-muted-foreground"
            )}>
              {isProcessing ? '🤔 উত্তর তৈরি হচ্ছে...' :
               isListening ? '🎤 শুনছি... বলুন' :
               isSpeaking ? '🔊 উত্তর বলছি...' :
               ttsLoading ? '⏳ অডিও লোড হচ্ছে...' :
               '👆 মাইক চাপুন এবং প্রশ্ন করুন'}
            </p>
          </div>
        </div>

        {/* Current Transcript */}
        {currentTranscript && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4">
            <p className="text-sm text-foreground">"{currentTranscript}"</p>
          </div>
        )}

        {/* AI Response Preview */}
        {aiResponse && !isListening && (
          <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-3 mb-4 max-h-32 overflow-y-auto">
            <p className="text-sm text-foreground">{aiResponse}</p>
          </div>
        )}

        {/* Main Voice Button */}
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleListening}
            disabled={isProcessing || isSpeaking || ttsLoading || !sttSupported}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all transform active:scale-95",
              isListening 
                ? "bg-gradient-to-br from-destructive to-destructive/80 shadow-lg shadow-destructive/30" 
                : "bg-gradient-to-br from-secondary to-secondary/80 shadow-lg shadow-secondary/30 hover:scale-105",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isListening ? (
              <MicOff className="w-7 h-7 text-destructive-foreground" />
            ) : (
              <Mic className="w-7 h-7 text-secondary-foreground" />
            )}
          </button>

          {/* Stop Speaking Button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center shadow-lg hover:scale-105 transition-all"
            >
              <VolumeX className="w-7 h-7 text-foreground" />
            </button>
          )}
        </div>

        {/* Instructions */}
        {!sttSupported && (
          <p className="text-xs text-destructive text-center mt-4">
            আপনার ব্রাউজার ভয়েস ইনপুট সাপোর্ট করে না
          </p>
        )}

        {/* Conversation History Count */}
        {conversationHistory.length > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            {conversationHistory.length} টি বার্তা এই কথোপকথনে
          </p>
        )}
      </div>
    </div>
  );
}
