import { useEffect, useRef, useState } from 'react';

interface UseSilenceDetectionOptions {
  audioLevel: number;
  isRecording: boolean;
  threshold?: number;
  silenceDuration?: number;
  maxDuration?: number;
  onSilenceDetected: () => void;
}

export const useSilenceDetection = ({
  audioLevel,
  isRecording,
  threshold = 0.25,       // Higher base threshold (ignore small sounds)
  silenceDuration = 1000,  // Wait 1s before detecting silence
  maxDuration = 13000,    // Auto-submit after 13s
  onSilenceDetected,
}: UseSilenceDetectionOptions) => {
  const [isSilent, setIsSilent] = useState(false);

  const silenceStartRef = useRef<number | null>(null);
  const hasSpokenRef = useRef(false);

  // NEW: rolling average to smooth noise spikes
  const smoothedLevelRef = useRef(0);

  useEffect(() => {
    if (!isRecording) {
      silenceStartRef.current = null;
      hasSpokenRef.current = false;
      smoothedLevelRef.current = 0;
      setIsSilent(false);
      return;
    }

    // Smooth the audio — avoids tiny noises triggering speech
    smoothedLevelRef.current =
      smoothedLevelRef.current * 0.7 + audioLevel * 0.3;

    const smoothed = smoothedLevelRef.current;
    const now = Date.now();

    // Simplified threshold check: just check if audio level is above the set threshold
    // This fixes the bug where dynamic threshold (smoothed * 1.4) made it impossible to exceed
    if (smoothed > threshold) {
      // User is speaking
      hasSpokenRef.current = true;
      silenceStartRef.current = null;
      setIsSilent(false);
      return;
    }

    // Only consider silence if user has ever spoken
    if (hasSpokenRef.current) {
      if (silenceStartRef.current === null) {
        silenceStartRef.current = now;
      } else if (now - silenceStartRef.current >= silenceDuration) {
        setIsSilent(true);
        onSilenceDetected();
        silenceStartRef.current = null;
        hasSpokenRef.current = false;
      }
    }
  }, [audioLevel, isRecording, threshold, silenceDuration, onSilenceDetected]);

  // NEW: Auto-submit after maxDuration
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isRecording) {
      timeoutId = setTimeout(() => {
        onSilenceDetected();
      }, maxDuration);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRecording, maxDuration, onSilenceDetected]);

  return { isSilent };
};
