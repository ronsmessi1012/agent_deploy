import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { EndInterviewResponse } from '@/lib/api';

const Report = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { summary } = location.state as { summary: EndInterviewResponse } || {};

  if (!summary) {
    navigate('/');
    return null;
  }

  const downloadReport = () => {
    const reportContent = JSON.stringify(summary, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-success';
    if (score >= 3) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Interview Report
          </h1>
          <p className="text-muted-foreground">
            Here's your detailed performance analysis
          </p>
        </div>

        {/* Overall Score */}
        <Card className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Overall Score</h2>
          <div className={`text-6xl font-bold ${getScoreColor(summary.avg_scores.overall)}`}>
            {summary.avg_scores.overall.toFixed(1)}/5.0
          </div>
          <Progress value={summary.avg_scores.overall * 20} className="h-3" />
        </Card>

        {/* Score Breakdown */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Score Breakdown</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(summary.avg_scores).map(([key, value]) => {
              if (key === 'overall') return null;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize text-foreground">
                      {key.replace('_', ' ')}
                    </span>
                    <span className={`text-lg font-bold ${getScoreColor(value)}`}>
                      {value.toFixed(1)}
                    </span>
                  </div>
                  <Progress value={value * 20} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Feedback Section */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 border-l-4 border-success">
            <h3 className="text-lg font-semibold text-success mb-3">Strengths</h3>
            <ul className="space-y-2">
              {summary.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 border-l-4 border-warning">
            <h3 className="text-lg font-semibold text-warning mb-3">Weaknesses</h3>
            <ul className="space-y-2">
              {summary.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-warning mt-0.5">!</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 border-l-4 border-primary">
            <h3 className="text-lg font-semibold text-primary mb-3">Improvements</h3>
            <ul className="space-y-2">
              {summary.improvements.map((improvement, index) => (
                <li key={index} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">→</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Overall Feedback */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-3">Overall Feedback</h2>
          <p className="text-muted-foreground leading-relaxed">{summary.overall_feedback}</p>
        </Card>

        {/* Transcript */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Interview Transcript</h2>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {summary.transcript.map((item, index) => (
                <div key={index} className="space-y-3 pb-4 border-b border-border last:border-0">
                  <div>
                    <Badge variant="outline" className="mb-2">Question {index + 1}</Badge>
                    <p className="text-foreground font-medium">{item.question}</p>
                  </div>
                  <div className="pl-4 border-l-2 border-primary">
                    <p className="text-muted-foreground">{item.answer}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap text-xs">
                    <Badge className="bg-primary/10 text-primary">
                      Clarity: {item.score.clarity}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary">
                      Structure: {item.score.structure}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary">
                      Examples: {item.score.examples}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary">
                      Technical: {item.score.technical_accuracy}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Practice Recommendations */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Practice Recommendations</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Practice Prompts:</h3>
              <ul className="space-y-2">
                {summary.practice.prompts.map((prompt, index) => (
                  <li key={index} className="text-sm text-muted-foreground pl-4 border-l-2 border-accent">
                    {prompt}
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Resources:</h3>
              <ul className="space-y-2">
                {summary.practice.resources.map((resource, index) => (
                  <li key={index} className="text-sm text-primary hover:underline cursor-pointer">
                    {resource}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center pb-8">
          <Button
            onClick={downloadReport}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Download Report
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
          >
            Start New Interview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Report;
