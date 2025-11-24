import { useEffect, useState } from 'react';
import Waves from 'react-animated-waves';
import { useTheme } from 'next-themes';

interface VoiceWaveProps {
  isUserSpeaking: boolean;
  isAgentSpeaking: boolean;
  level: number;
}

export const VoiceWave = ({ isUserSpeaking, isAgentSpeaking, level }: VoiceWaveProps) => {
  const { theme } = useTheme();
  const [amplitude, setAmplitude] = useState(0);

  useEffect(() => {
    // Map level (0-1) to amplitude (0-40)
    // Add some baseline movement if active
    const isActive = isUserSpeaking || isAgentSpeaking;
    const targetAmp = isActive ? Math.max(10, level * 50) : 2;
    setAmplitude(targetAmp);
  }, [level, isUserSpeaking, isAgentSpeaking]);

  const getColors = () => {
    const isDark = theme === 'dark';

    if (isUserSpeaking) {
      // Primary/Teal colors
      return isDark
        ? ["#2DD4BF", "#0F766E", "#2DD4BF"] // Teal-400, Teal-700, Teal-400
        : ["#0D9488", "#CCFBF1", "#0D9488"]; // Teal-600, Teal-100, Teal-600
    }

    if (isAgentSpeaking) {
      // Accent/Orange colors
      return isDark
        ? ["#FB923C", "#9A3412", "#FB923C"] // Orange-400, Orange-800, Orange-400
        : ["#EA580C", "#FFEDD5", "#EA580C"]; // Orange-600, Orange-100, Orange-600
    }

    // Idle/Gray
    return isDark
      ? ["#4B5563", "#1F2937", "#4B5563"] // Gray-600, Gray-800, Gray-600
      : ["#9CA3AF", "#F3F4F6", "#9CA3AF"]; // Gray-400, Gray-100, Gray-400
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-64 w-full overflow-hidden rounded-xl bg-secondary/20">
      <div className="absolute inset-0 flex items-center justify-center opacity-80">
        <Waves
          amplitude={amplitude}
          colors={getColors()}
        />
      </div>

      {/* Status Text Overlay */}
      <div className="relative z-10 text-center mt-32">
        <div className="text-4xl mb-2 transition-all duration-300 transform hover:scale-110">
          {/* Emojis removed as per user request */}
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {isUserSpeaking && 'Listening...'}
          {isAgentSpeaking && 'Speaking...'}
          {!isUserSpeaking && !isAgentSpeaking && 'Ready'}
        </p>
      </div>
    </div>
  );
};
