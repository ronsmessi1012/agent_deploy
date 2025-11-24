import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VoiceWave } from '@/components/VoiceWave';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSilenceDetection } from '@/hooks/useSilenceDetection';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { interviewAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/ThemeToggle';

interface TranscriptEntry {
  type: 'question' | 'answer';
  text: string;
  timestamp: Date;
}

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { sessionId, firstQuestion } = location.state || {};

  const [currentQuestion, setCurrentQuestion] = useState(firstQuestion || '');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [questionCount, setQuestionCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { isRecording, audioLevel, startRecording, stopRecording, error: recorderError } = useAudioRecorder();
  const { transcript: liveTranscript, startListening, stopListening, resetTranscript, isSupported: isSpeechSupported } = useSpeechRecognition();
  const { isSpeaking: isAgentSpeaking, agentAudioLevel, speak, stop: stopSpeech } = useSpeechSynthesis();

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSilenceDetected = useCallback(async () => {
    if (!isRecording || isProcessing) return;

    stopRecording();
    stopListening();

    const answer = liveTranscript.trim();
    if (!answer) {
      toast({
        title: 'No speech detected',
        description: 'Please speak your answer clearly',
      });
      setTimeout(() => {
        startRecording();
        startListening();
      }, 1000);
      return;
    }

    setTranscript(prev => [...prev, { type: 'answer', text: answer, timestamp: new Date() }]);
    resetTranscript();
    setIsProcessing(true);

    try {
      const response = await interviewAPI.submitAnswer({
        session_id: sessionId,
        answer,
      });

      if (response.action === 'end') {
        stopSpeech();
        await speak(response.text);
        handleEndInterview();
      } else {
        setCurrentQuestion(response.text);
        setTranscript(prev => [...prev, { type: 'question', text: response.text, timestamp: new Date() }]);
        setQuestionCount(prev => prev + 1);

        setShowQuestion(false);
        await speak(response.text);
        setShowQuestion(true);

        setTimeout(() => {
          startRecording();
          startListening();
          setIsProcessing(false);
        }, 500);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit answer. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
      startRecording();
      startListening();
    }
  }, [isRecording, isProcessing, liveTranscript, sessionId, startRecording, startListening, stopRecording, stopListening, resetTranscript, speak, stopSpeech, toast]);

  useSilenceDetection({
    audioLevel,
    isRecording,
    onSilenceDetected: handleSilenceDetected,
    maxDuration: 30000,
    silenceDuration: 2000,
    threshold: 0.15,
  });

  useEffect(() => {
    if (!sessionId) {
      navigate('/setup');
      return;
    }

    const initInterview = async () => {
      setTranscript([{ type: 'question', text: firstQuestion, timestamp: new Date() }]);
      setShowQuestion(false);
      await speak(firstQuestion);
      setShowQuestion(true);

      setTimeout(() => {
        startRecording();
        startListening();
      }, 500);
    };

    initInterview();

    return () => {
      stopRecording();
      stopListening();
      stopSpeech();
    };
  }, []);

  const handleEndInterview = async () => {
    setIsEnding(true);
    stopRecording();
    stopListening();
    stopSpeech();

    try {
      const response = await interviewAPI.endInterview({ session_id: sessionId });
      navigate('/report', { state: { summary: response.summary, transcript } });
    } catch (error) {
      console.error('Error ending interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to end interview properly',
        variant: 'destructive',
      });
      setIsEnding(false);
    }
  };

  if (!isSpeechSupported) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Browser Not Supported</h2>
          <p className="text-muted-foreground">
            Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
          </p>
          <Button onClick={() => navigate('/')} className="mt-6">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Interview in Progress</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <p>Question {questionCount}</p>
              <span className="text-foreground/20">|</span>
              <p className="font-mono">{formatTime(elapsedTime)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button
              variant="destructive"
              onClick={handleEndInterview}
              disabled={isProcessing || isEnding}
            >
              {isEnding ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Generating Report...
                </>
              ) : (
                'End Interview'
              )}
            </Button>
          </div>
        </div>

        {/* Main Interview Area */}
        <Card className="p-12 flex flex-col items-center justify-center space-y-12 min-h-[500px]">
          <VoiceWave
            isUserSpeaking={isRecording && !isProcessing}
            isAgentSpeaking={isAgentSpeaking}
            level={Math.max(audioLevel, agentAudioLevel)}
          />

          <div className="text-center space-y-4 max-w-xl">
            <h2 className="text-lg font-semibold text-foreground">
              {showQuestion ? 'Current Question:' : 'Interviewer is speaking...'}
            </h2>
            <div className={`transition-opacity duration-500 ${showQuestion ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-xl text-foreground font-medium leading-relaxed">
                {currentQuestion}
              </p>
            </div>
          </div>

          {liveTranscript && (
            <div className="w-full max-w-xl p-4 bg-secondary/50 rounded-lg animate-fade-in">
              <p className="text-sm text-muted-foreground mb-1">You're saying:</p>
              <p className="text-foreground">{liveTranscript}</p>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-accent font-medium animate-pulse">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          )}
        </Card>

        {recorderError && (
          <Card className="p-4 bg-destructive/10 border-destructive">
            <p className="text-sm text-destructive">{recorderError}</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Interview;
