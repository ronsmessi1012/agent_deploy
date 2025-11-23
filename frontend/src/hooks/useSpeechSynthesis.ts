import { useState, useCallback, useRef, useEffect } from 'react';
import { interviewAPI } from '@/lib/api';

interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  agentAudioLevel: number;
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
}

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [agentAudioLevel, setAgentAudioLevel] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  const isSupported = 'speechSynthesis' in window;

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalized = Math.min(average / 128, 1);
    setAgentAudioLevel(normalized);

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    try {
      setIsSpeaking(true);
      const audioBlob = await interviewAPI.generateSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Setup Audio Analysis
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume context if suspended (browser policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createMediaElementSource(audio);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      analyzeAudio();

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          setIsSpeaking(false);
          setAgentAudioLevel(0);
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setIsSpeaking(false);
          setAgentAudioLevel(0);
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          URL.revokeObjectURL(audioUrl);
          resolve(); // Resolve anyway to continue flow
        };

        audio.play().catch(err => {
          console.error("Play error:", err);
          setIsSpeaking(false);
          setAgentAudioLevel(0);
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          resolve();
        });
      });
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      setAgentAudioLevel(0);
    }
  }, [analyzeAudio]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setAgentAudioLevel(0);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isSupported]);

  return {
    isSpeaking,
    agentAudioLevel,
    speak,
    stop,
    isSupported,
  };
};
