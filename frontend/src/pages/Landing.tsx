import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-8 md:p-12 shadow-soft animate-fade-in">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Voice Interview
            </h1>
            <p className="text-xl text-muted-foreground">
              AI-Powered Technical Interview Practice
            </p>
          </div>

          <div className="py-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-wave" />
              <div className="absolute inset-4 bg-primary/40 rounded-full animate-pulse-wave animation-delay-200" />
              <div className="absolute inset-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-5xl">🎙️</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-left bg-secondary/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground">What to Expect:</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Real-time voice-based interview with AI</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Automatic silence detection for natural conversation flow</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Detailed feedback on clarity, structure, and technical accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Structured report with actionable improvements</span>
              </li>
            </ul>
          </div>

          <Button
            size="lg"
            onClick={() => navigate('/setup')}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 shadow-glow"
          >
            Start Interview
          </Button>

          <p className="text-sm text-muted-foreground">
            Make sure your microphone is enabled for the best experience
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Landing;
