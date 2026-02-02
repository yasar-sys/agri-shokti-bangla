import { useState, useCallback, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, MessageCircle, X, Phone, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBengaliVoiceInput } from '@/hooks/useBengaliVoiceInput';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';
import { useToast } from '@/hooks/use-toast';

interface VoiceConversationProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function VoiceConversation({ isOpen, onClose }: VoiceConversationProps) {
  const { toast } = useToast();
  
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Voice Output (Text-to-Speech)
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isLoading: ttsLoading,
    error: ttsError,
  } = useElevenLabsTTS();

  // Show TTS errors
  useEffect(() => {
    if (ttsError) {
      console.error('[Voice] TTS Error:', ttsError);
      toast({
        variant: 'destructive',
        title: 'ভয়েস আউটপুট সমস্যা',
        description: ttsError,
      });
    }
  }, [ttsError, toast]);

  // Process voice input and get AI response
  const processVoiceInput = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    console.log('[Voice] Processing input:', userMessage);
    setIsProcessing(true);
    setStatus('processing');

    try {
      // Add user message to history
      const userMsg: Message = { 
        role: 'user', 
        content: userMessage, 
        timestamp: new Date() 
      };
      setConversationHistory(prev => [...prev, userMsg]);

      // Build messages for API
      const allMessages = [...conversationHistory, userMsg];
      const apiMessages = allMessages.map(m => ({ 
        role: m.role, 
        content: m.content 
      }));

      console.log('[Voice] Calling chat API with', apiMessages.length, 'messages');

      // Get AI response
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: apiMessages }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Voice] Chat API error:', response.status, errorText);
        throw new Error(`Chat API failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Voice] AI response received');

      const aiText = data.response || 'দুঃখিত, উত্তর দিতে পারছি না।';
      
      // Add AI response to history
      const aiMsg: Message = { 
        role: 'assistant', 
        content: aiText, 
        timestamp: new Date() 
      };
      setConversationHistory(prev => [...prev, aiMsg]);

      // Speak the response using ElevenLabs
      console.log('[Voice] Starting TTS for response...');
      setStatus('speaking');
      
      // Use a shorter version for TTS if text is too long
      const textToSpeak = aiText.length > 500 
        ? aiText.substring(0, 500) + '...' 
        : aiText;
      
      await speak(textToSpeak);
      console.log('[Voice] TTS completed');

    } catch (error) {
      console.error('[Voice] Error:', error);
      toast({
        variant: 'destructive',
        title: 'সমস্যা হয়েছে',
        description: error instanceof Error ? error.message : 'উত্তর পেতে সমস্যা হয়েছে',
      });
    } finally {
      setIsProcessing(false);
      setCurrentTranscript('');
      setStatus('idle');
    }
  }, [conversationHistory, toast, speak]);

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
      console.log('[Voice] Final transcript:', finalTranscript);
      if (finalTranscript.trim()) {
        setCurrentTranscript(finalTranscript);
        await processVoiceInput(finalTranscript);
      }
    },
    onError: (error) => {
      console.error('[Voice] STT Error:', error);
      toast({
        variant: 'destructive',
        title: 'ভয়েস ইনপুট সমস্যা',
        description: error,
      });
    },
  });

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
    } else if (isSpeaking || ttsLoading) {
      setStatus('speaking');
    } else {
      setStatus('idle');
    }
  }, [isListening, isProcessing, isSpeaking, ttsLoading]);

  // Cleanup on close
  const handleClose = useCallback(() => {
    stopListening();
    stopSpeaking();
    setConversationHistory([]);
    setCurrentTranscript('');
    onClose();
  }, [stopListening, stopSpeaking, onClose]);

  // Handle mic button click
  const handleMicClick = useCallback(() => {
    if (isProcessing || isSpeaking || ttsLoading) {
      console.log('[Voice] Cannot start listening - busy');
      return;
    }
    console.log('[Voice] Toggling listening');
    toggleListening();
  }, [isProcessing, isSpeaking, ttsLoading, toggleListening]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    console.log('[Voice] Suggestion clicked:', suggestion);
    processVoiceInput(suggestion);
  }, [processVoiceInput]);

  // Test TTS function
  const testTTS = useCallback(async () => {
    console.log('[Voice] Testing TTS...');
    await speak('হ্যালো! আমি আপনার কৃষি সহায়ক।');
  }, [speak]);

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
        return 'text-red-500';
      case 'processing':
        return 'text-blue-500';
      case 'speaking':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const suggestions = [
    'ধানের রোগ কী?',
    'আজকের আবহাওয়া',
    'সার কখন দেব?',
    'পোকা দমন',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <Phone className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">ভয়েস সহায়ক</h2>
            <p className="text-xs text-muted-foreground">AgriBrain AI - বাংলায় কথা বলুন</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Test TTS Button */}
          <button
            onClick={testTTS}
            disabled={isSpeaking || ttsLoading}
            className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors disabled:opacity-50"
            title="Test TTS"
          >
            <Volume2 className="w-5 h-5 text-primary" />
          </button>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
          >
            <X className="w-5 h-5 text-destructive" />
          </button>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6">
              <MessageCircle className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">স্বাগতম!</h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              মাইক বাটনে চাপুন এবং বাংলায় আপনার কৃষি সম্পর্কিত প্রশ্ন করুন।
            </p>
            
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isProcessing || isSpeaking}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
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
                      : 'bg-card border border-border text-foreground rounded-bl-sm'
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {msg.timestamp.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                  </p>
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
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">চিন্তা করছি...</span>
              </div>
            </div>
          </div>
        )}

        {/* Speaking Indicator */}
        {status === 'speaking' && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 animate-pulse text-green-500" />
                <span className="text-sm text-muted-foreground">
                  {ttsLoading ? 'অডিও লোড হচ্ছে...' : 'বলছি...'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice Control Area */}
      <div className="p-6 bg-card border-t border-border">
        {/* Status Text */}
        <p className={cn("text-center text-sm font-medium mb-4", getStatusColor())}>
          {getStatusText()}
        </p>

        {/* Voice Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Stop Speaking Button */}
          {(isSpeaking || ttsLoading) && (
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
                ? "bg-red-500 scale-110 animate-pulse"
                : "bg-primary hover:scale-105",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {status === 'listening' ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : status === 'processing' ? (
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            ) : (
              <Mic className="w-8 h-8 text-primary-foreground" />
            )}
          </button>

          {/* Refresh/Clear Button */}
          {conversationHistory.length > 0 && (
            <button
              onClick={() => setConversationHistory([])}
              className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <RefreshCw className="w-6 h-6 text-foreground" />
            </button>
          )}
        </div>

        {/* Error Messages */}
        {sttError && (
          <p className="text-xs text-destructive text-center mt-4">{sttError}</p>
        )}
        {ttsError && (
          <p className="text-xs text-destructive text-center mt-2">TTS: {ttsError}</p>
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
