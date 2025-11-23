import { useEffect, useRef, useState } from 'react';

interface UseSilenceDetectionOptions {
  audioLevel: number;
  isRecording: boolean;
  threshold?: number;
  silenceDuration?: number;
  onSilenceDetected: () => void;
}

export const useSilenceDetection = ({
  audioLevel,
  isRecording,
  threshold = 0.02,
  silenceDuration = 2500,
  onSilenceDetected,
}: UseSilenceDetectionOptions) => {
  const [isSilent, setIsSilent] = useState(false);
  const silenceStartRef = useRef<number | null>(null);
  const hasSpokenRef = useRef(false);

  useEffect(() => {
    if (!isRecording) {
      silenceStartRef.current = null;
      hasSpokenRef.current = false;
      setIsSilent(false);
      return;
    }

    const now = Date.now();

    if (audioLevel > threshold) {
      hasSpokenRef.current = true;
      silenceStartRef.current = null;
      setIsSilent(false);
    } else if (hasSpokenRef.current) {
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

  return { isSilent };
};
