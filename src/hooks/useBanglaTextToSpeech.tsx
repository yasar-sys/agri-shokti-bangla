import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TTSState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useBanglaTextToSpeech() {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isLoading: false,
    error: null
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Stop any currently playing audio
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
  }, []);

  // Speak text using ElevenLabs TTS via edge function
  const speak = useCallback(async (text: string, options?: {
    voiceId?: string;
    autoPlay?: boolean;
  }) => {
    if (!text || text.trim().length === 0) {
      return;
    }

    // Stop any current playback
    stop();

    const voiceId = options?.voiceId || 'pFZP5JQG7iQjIQuC4Bku'; // Lily - good for multilingual
    const autoPlay = options?.autoPlay !== false;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    abortControllerRef.current = new AbortController();

    try {
      // Call edge function for TTS
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bangla-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, voiceId }),
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        // Fallback to browser's Web Speech API if edge function fails
        console.log('TTS edge function failed, using browser fallback');
        await speakWithBrowserTTS(text);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.onended = () => {
        setState(prev => ({ ...prev, isPlaying: false }));
        URL.revokeObjectURL(audioUrl);
      };

      audioRef.current.onerror = () => {
        setState(prev => ({ ...prev, isPlaying: false, error: 'অডিও প্লে করতে সমস্যা হয়েছে' }));
        URL.revokeObjectURL(audioUrl);
      };

      setState(prev => ({ ...prev, isLoading: false }));

      if (autoPlay) {
        await audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      
      console.error('TTS error:', error);
      
      // Fallback to browser's Web Speech API
      await speakWithBrowserTTS(text);
    }
  }, [stop]);

  // Fallback: Use browser's built-in speech synthesis
  const speakWithBrowserTTS = useCallback(async (text: string) => {
    if (!('speechSynthesis' in window)) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'আপনার ব্রাউজার টেক্সট-টু-স্পিচ সাপোর্ট করে না' 
      }));
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find Bengali voice
      const voices = window.speechSynthesis.getVoices();
      const bengaliVoice = voices.find(v => 
        v.lang.includes('bn') || 
        v.lang.includes('hi') || // Hindi as fallback (similar sounds)
        v.name.toLowerCase().includes('bengali')
      );
      
      if (bengaliVoice) {
        utterance.voice = bengaliVoice;
      }
      
      utterance.lang = 'bn-BD';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
      };

      utterance.onend = () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      };

      utterance.onerror = () => {
        setState(prev => ({ ...prev, isPlaying: false, error: 'স্পিচ সিন্থেসিস ত্রুটি' }));
      };

      window.speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Browser TTS error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'ভয়েস আউটপুট তৈরি করতে সমস্যা হয়েছে' 
      }));
    }
  }, []);

  // Speak disease solution with formatted text
  const speakDiseaseSolution = useCallback(async (diseaseData: {
    diseaseName: string;
    treatment: string;
    organicSolution?: string;
    chemicalSolution?: string;
    preventiveMeasures?: string[];
  }) => {
    // Format the solution text for speech
    let speechText = `রোগ সনাক্ত হয়েছে: ${diseaseData.diseaseName}। `;
    
    if (diseaseData.treatment) {
      speechText += `চিকিৎসা: ${diseaseData.treatment}। `;
    }
    
    if (diseaseData.organicSolution) {
      speechText += `জৈব সমাধান: ${diseaseData.organicSolution}। `;
    }
    
    if (diseaseData.chemicalSolution) {
      speechText += `রাসায়নিক সমাধান: ${diseaseData.chemicalSolution}। `;
    }
    
    if (diseaseData.preventiveMeasures && diseaseData.preventiveMeasures.length > 0) {
      speechText += `প্রতিরোধমূলক ব্যবস্থা: ${diseaseData.preventiveMeasures.slice(0, 3).join('। ')}।`;
    }

    await speak(speechText);
  }, [speak]);

  return {
    speak,
    speakDiseaseSolution,
    stop,
    isPlaying: state.isPlaying,
    isLoading: state.isLoading,
    error: state.error
  };
}
