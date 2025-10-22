import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trophy, TrendingUp } from "lucide-react";

interface QuizQuestion {
  question_text: string;
  options: any;
  correct_answer: string;
  user_answer: string | null;
  explanation: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { attemptId, score, total } = location.state || {};
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) {
      navigate("/dashboard");
      return;
    }

    fetchResults();
  }, [attemptId, navigate]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("attempt_id", attemptId)
        .order("created_at");

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const percentage = Math.round((score / total) * 100);

  const getPerformanceColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceMessage = () => {
    if (percentage >= 80) return "Excellent work!";
    if (percentage >= 60) return "Good job!";
    if (percentage >= 40) return "Keep practicing!";
    return "Don't give up!";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(to bottom, hsl(220, 25%, 97%), hsl(220, 20%, 95%))' }}>
      <Navigation />
      
      <div className="max-w-4xl mx-auto pt-20 space-y-8">
        <Card className="shadow-lg border-0 text-center" style={{ boxShadow: 'var(--shadow-soft)', background: 'var(--gradient-hero)' }}>
          <CardContent className="pt-12 pb-12 space-y-6">
            <Trophy className="h-20 w-20 mx-auto text-white" />
            <h1 className="text-4xl font-bold text-white">Quiz Complete!</h1>
            <p className="text-2xl text-white">{getPerformanceMessage()}</p>
            <div className="space-y-2">
              <div className={`text-6xl font-bold ${getPerformanceColor()} text-white`}>
                {score}/{total}
              </div>
              <p className="text-xl text-white">{percentage}% Correct</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Take Another Quiz
          </Button>
          <Button
            onClick={() => navigate("/performance")}
            variant="outline"
            size="lg"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View Performance
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Review Your Answers</h2>
          {questions.map((q, index) => {
            const isCorrect = q.user_answer === q.correct_answer;
            
            return (
              <Card key={index} className="shadow-md border-0" style={{ boxShadow: 'var(--shadow-soft)' }}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        Question {index + 1}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {q.question_text}
                      </CardDescription>
                    </div>
                    {isCorrect ? (
                      <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Your answer:</span>
                      <Badge variant={isCorrect ? "default" : "destructive"}>
                        {q.user_answer || "Not answered"}: {q.user_answer ? q.options[q.user_answer as keyof typeof q.options] : ""}
                      </Badge>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Correct answer:</span>
                        <Badge variant="default" style={{ background: 'var(--gradient-secondary)' }}>
                          {q.correct_answer}: {q.options[q.correct_answer as keyof typeof q.options]}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-semibold mb-1">Explanation:</p>
                    <p className="text-sm leading-relaxed">{q.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Results;