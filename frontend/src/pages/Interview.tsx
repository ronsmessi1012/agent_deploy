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
  
  const { isRecording, audioLevel, startRecording, stopRecording, error: recorderError } = useAudioRecorder();
  const { transcript: liveTranscript, startListening, stopListening, resetTranscript, isSupported: isSpeechSupported } = useSpeechRecognition();
  const { isSpeaking: isAgentSpeaking, speak, stop: stopSpeech } = useSpeechSynthesis();

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
        
        await speak(response.text);
        
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
  });

  useEffect(() => {
    if (!sessionId) {
      navigate('/setup');
      return;
    }

    const initInterview = async () => {
      setTranscript([{ type: 'question', text: firstQuestion, timestamp: new Date() }]);
      await speak(firstQuestion);
      
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
    stopRecording();
    stopListening();
    stopSpeech();
    
    try {
      const summary = await interviewAPI.endInterview({ session_id: sessionId });
      navigate('/report', { state: { summary, transcript } });
    } catch (error) {
      console.error('Error ending interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to end interview properly',
        variant: 'destructive',
      });
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Interview in Progress</h1>
            <p className="text-muted-foreground">Question {questionCount}</p>
          </div>
          <Button
            variant="destructive"
            onClick={handleEndInterview}
            disabled={isProcessing}
          >
            End Interview
          </Button>
        </div>

        {/* Main Interview Area */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Voice Wave & Question */}
          <Card className="p-8 flex flex-col items-center justify-center space-y-8">
            <VoiceWave
              isUserSpeaking={isRecording && !isProcessing}
              isAgentSpeaking={isAgentSpeaking}
              level={audioLevel}
            />
            
            <div className="text-center space-y-2 max-w-md">
              <h2 className="text-lg font-semibold text-foreground">Current Question:</h2>
              <p className="text-muted-foreground">{currentQuestion}</p>
            </div>

            {liveTranscript && (
              <div className="w-full p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">You're saying:</p>
                <p className="text-foreground">{liveTranscript}</p>
              </div>
            )}

            {isProcessing && (
              <p className="text-sm text-accent font-medium animate-pulse">
                Processing your answer...
              </p>
            )}
          </Card>

          {/* Right: Transcript */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Interview Transcript</h2>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {transcript.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      entry.type === 'question'
                        ? 'bg-primary/10 border-l-4 border-primary'
                        : 'bg-secondary border-l-4 border-accent'
                    }`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {entry.type === 'question' ? '🤖 Interviewer' : '👤 You'} •{' '}
                      {entry.timestamp.toLocaleTimeString()}
                    </p>
                    <p className="text-foreground">{entry.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

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
