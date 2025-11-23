import { useEffect, useState } from 'react';

interface VoiceWaveProps {
  isUserSpeaking: boolean;
  isAgentSpeaking: boolean;
  level: number;
}

export const VoiceWave = ({ isUserSpeaking, isAgentSpeaking, level }: VoiceWaveProps) => {
  const [rings, setRings] = useState([1, 2, 3]);
  const isActive = isUserSpeaking || isAgentSpeaking;
  
  const baseSize = 200;
  const scaleFactor = 1 + (level * 0.3);
  
  const activeColor = isUserSpeaking ? 'wave-primary' : isAgentSpeaking ? 'accent' : 'wave-primary';

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer rings */}
      {rings.map((ring, index) => (
        <div
          key={ring}
          className={`absolute rounded-full border-2 transition-all duration-300 ${
            isActive 
              ? `border-${activeColor} animate-wave-ripple` 
              : 'border-muted'
          }`}
          style={{
            width: `${baseSize + (ring * 60)}px`,
            height: `${baseSize + (ring * 60)}px`,
            animationDelay: `${index * 0.2}s`,
            opacity: isActive ? 0.6 - (index * 0.15) : 0.3,
          }}
        />
      ))}
      
      {/* Center pulse */}
      <div
        className={`relative rounded-full flex items-center justify-center transition-all duration-300 ${
          isActive 
            ? `bg-${activeColor} shadow-[0_0_40px_hsl(var(--${activeColor})/0.6)] animate-glow-pulse` 
            : 'bg-muted'
        }`}
        style={{
          width: `${baseSize * (isActive ? scaleFactor : 1)}px`,
          height: `${baseSize * (isActive ? scaleFactor : 1)}px`,
        }}
      >
        {/* Inner glow */}
        <div 
          className={`absolute inset-0 rounded-full ${
            isActive ? `bg-${activeColor}/20` : 'bg-muted/20'
          }`}
        />
        
        {/* Status indicator */}
        <div className="relative z-10 text-center">
          <div className={`text-4xl font-bold ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
            {isUserSpeaking && '🎙️'}
            {isAgentSpeaking && '🤖'}
            {!isActive && '⏸️'}
          </div>
          <p className={`mt-2 text-sm font-medium ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
            {isUserSpeaking && 'Listening...'}
            {isAgentSpeaking && 'Speaking...'}
            {!isActive && 'Ready'}
          </p>
        </div>
      </div>

      {/* Level indicator bars (optional visual) */}
      {isUserSpeaking && (
        <div className="absolute -bottom-12 flex gap-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full transition-all duration-100"
              style={{
                height: `${Math.max(4, level * 40 * (1 + Math.random() * 0.5))}px`,
                opacity: level > i / 20 ? 1 : 0.2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
