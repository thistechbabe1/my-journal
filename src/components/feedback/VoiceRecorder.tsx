'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useToast } from './ToastProvider';
import { useIdentity } from '@/hooks/use-identity';

interface VoiceRecorderProps {
  onTranscribe: (text: string) => void;
}

export default function VoiceRecorder({ onTranscribe }: VoiceRecorderProps) {
  const { toast } = useToast();
  const { profile } = useIdentity();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up recording stream & timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    chunksRef.current = [];
    setDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleAudioBlob(audioBlob);
      };

      mediaRecorder.start(250); // Get chunks every 250ms
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      toast('Permission denied or microphone not found.', 'error');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
  };

  const handleAudioBlob = async (blob: Blob) => {
    const apiKey = profile?.gemini_api_key;
    const voiceProfile = profile?.voice_profile || 'Write in a natural, conversational, and direct tone.';

    if (!apiKey) {
      toast('Please enter your Gemini API Key in Sanctuary Settings first.', 'warning');
      return;
    }

    setIsProcessing(true);

    try {
      // Convert audio blob to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Extract only base64 string
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const mimeType = blob.type.split(';')[0] || 'audio/webm';

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data
                    }
                  },
                  {
                    text: `You are an empathetic, silent journal transcriber. Transcribe this audio recording and refine it into a coherent, natural, flowing journal entry. Follow these style guidelines: ${voiceProfile}. Preserve the user's authentic thoughts, prayers, and lessons. Return only the processed journal entry text, without any introductory or concluding comments.`
                  }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        onTranscribe(text.trim());
        toast('Voice note transcribed successfully.', 'success');
      } else {
        throw new Error('Gemini API returned an empty response.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      toast('Failed to transcribe voice note. Verify your API Key.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isProcessing) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-sharon-primary font-sans font-bold uppercase tracking-wider select-none">
        <Loader2 size={12} className="animate-spin" />
        <span>AI is transcribing to your voice...</span>
      </div>
    );
  }

  if (isRecording) {
    return (
      <button
        type="button"
        onClick={stopRecording}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-danger/30 bg-danger/5 hover:bg-danger/10 text-danger text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
        <span>Recording {formatTime(duration)} · Stop</span>
        <Square size={10} className="fill-danger stroke-none" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card-border bg-card text-foreground hover:bg-sharon-muted-light/60 text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-colors"
      title="Record Voice Note"
    >
      <Mic size={11} className="text-sharon-muted" />
      <span>Record Note</span>
    </button>
  );
}
