import { useState, useRef, useCallback, useEffect } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

interface UseBengaliVoiceInputOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
}

interface UseBengaliVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  error: string | null;
}

/**
 * Bangla voice input.
 * 1st choice: browser Web Speech API (bn-BD).
 * Fallback: record with the microphone and transcribe on the server
 * (used when the browser lacks speech recognition or it fails, e.g. network / iframe).
 */
export function useBengaliVoiceInput(options: UseBengaliVoiceInputOptions = {}): UseBengaliVoiceInputReturn {
  const { continuous = false } = options;
  const onResultRef = useRef(options.onResult);
  const onErrorRef = useRef(options.onError);
  onResultRef.current = options.onResult;
  onErrorRef.current = options.onError;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const useRecorderRef = useRef(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<number | null>(null);

  const hasRecorder = typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
  const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : undefined;
  const isSupported = !!SR || hasRecorder;

  const reportError = (msg: string) => {
    setError(msg);
    onErrorRef.current?.(msg);
  };

  // ---------- Server transcription fallback ----------
  const startRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
        setIsListening(false);
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        if (blob.size < 1500) { reportError('কোনো কথা শোনা যায়নি। আবার চেষ্টা করুন।'); return; }
        setTranscript('কথা বুঝছি...');
        try {
          const buf = new Uint8Array(await blob.arrayBuffer());
          let bin = '';
          for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
          const format = (rec.mimeType || 'audio/webm').includes('mp4') ? 'mp4' : 'webm';
          const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ audio: btoa(bin), format }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'কথা বুঝতে সমস্যা হয়েছে');
          const text = (data.text || '').trim();
          setTranscript(text);
          if (text) onResultRef.current?.(text);
          else reportError('কোনো কথা শোনা যায়নি। আবার চেষ্টা করুন।');
        } catch (e) {
          setTranscript('');
          reportError(e instanceof Error ? e.message : 'কথা বুঝতে সমস্যা হয়েছে');
        }
      };
      recorderRef.current = rec;
      rec.start();
      setIsListening(true);
      setError(null);
      // auto-stop after 12s
      silenceTimerRef.current = window.setTimeout(() => rec.state === 'recording' && rec.stop(), 12000);
    } catch {
      reportError('মাইক্রোফোন ব্যবহারের অনুমতি দিন।');
      setIsListening(false);
    }
  }, []);

  // ---------- Web Speech API ----------
  useEffect(() => {
    if (!SR) { useRecorderRef.current = true; return; }
    const recognition = new SR();
    recognition.lang = 'bn-BD';
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setIsListening(true); setError(null); };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      let finalT = '', interimT = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalT += r[0].transcript; else interimT += r[0].transcript;
      }
      setTranscript(finalT || interimT);
      if (finalT) onResultRef.current?.(finalT);
    };
    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'aborted') return;
      if ((event.error === 'network' || event.error === 'service-not-allowed' || event.error === 'language-not-supported') && hasRecorder) {
        // Switch permanently to server transcription and start right away
        useRecorderRef.current = true;
        startRecorder();
        return;
      }
      const map: Record<string, string> = {
        'no-speech': 'কোনো কথা শোনা যায়নি। আবার চেষ্টা করুন।',
        'audio-capture': 'মাইক্রোফোন পাওয়া যায়নি।',
        'not-allowed': 'মাইক্রোফোন ব্যবহারের অনুমতি দিন।',
      };
      reportError(map[event.error] || 'কথা শুনতে সমস্যা হয়েছে');
    };
    recognitionRef.current = recognition;
    return () => { try { recognition.abort(); } catch { /* noop */ } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuous]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const startListening = useCallback(() => {
    if (isListening) return;
    setTranscript('');
    setError(null);
    if (useRecorderRef.current || !recognitionRef.current) {
      if (hasRecorder) startRecorder();
      else reportError('আপনার ব্রাউজার ভয়েস ইনপুট সাপোর্ট করে না।');
      return;
    }
    try { recognitionRef.current.start(); }
    catch { if (hasRecorder) { useRecorderRef.current = true; startRecorder(); } }
  }, [isListening, hasRecorder, startRecorder]);

  const stopListening = useCallback(() => {
    if (recorderRef.current?.state === 'recording') { recorderRef.current.stop(); return; }
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening(); else startListening();
  }, [isListening, startListening, stopListening]);

  return { isListening, isSupported, transcript, startListening, stopListening, toggleListening, error };
}
