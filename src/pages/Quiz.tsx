import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Question {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct_answer: string;
  explanation: string;
}

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { skillLevel, subjects, questionCount } = location.state || {};

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attemptId, setAttemptId] = useState<string>("");

  useEffect(() => {
    if (!skillLevel || !subjects || !questionCount) {
      navigate("/dashboard");
      return;
    }

    generateQuiz();
  }, [skillLevel, subjects, questionCount, navigate]);

  const generateQuiz = async () => {
    try {
      setLoading(true);
      
      const subject = subjects.length === 1 ? subjects[0] : subjects.join(", ");

      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { subject, skillLevel, questionCount },
      });

      if (error) throw error;

      if (data?.questions) {
        setQuestions(data.questions);
        
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          const { data: attempt, error: attemptError } = await supabase
            .from("quiz_attempts")
            .insert({
              user_id: session.session.user.id,
              skill_level: skillLevel,
              subjects: subjects,
              question_count: questionCount,
              total_questions: data.questions.length,
            })
            .select()
            .single();

          if (attemptError) throw attemptError;
          setAttemptId(attempt.id);
        }
      }
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      toast.error(error.message || "Failed to generate quiz. Please try again.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      let score = 0;
      
      for (let i = 0; i < questions.length; i++) {
        const userAnswer = answers[i];
        const correctAnswer = questions[i].correct_answer;
        
        if (userAnswer === correctAnswer) {
          score++;
        }

        await supabase.from("quiz_questions").insert({
          attempt_id: attemptId,
          question_text: questions[i].question,
          options: questions[i].options,
          correct_answer: correctAnswer,
          user_answer: userAnswer || null,
          explanation: questions[i].explanation,
        });
      }

      const { error: updateError } = await supabase
        .from("quiz_attempts")
        .update({ score })
        .eq("id", attemptId);

      if (updateError) {
        console.error("Error updating quiz score:", updateError);
        toast.error("Failed to save score. Please try again.");
        return;
      }

      console.log(`Quiz completed! Score: ${score}/${questions.length}`);
      navigate("/results", { state: { attemptId, score, total: questions.length } });
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Generating your quiz...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(to bottom, hsl(220, 25%, 97%), hsl(220, 20%, 95%))' }}>
      <Navigation />
      
      <div className="max-w-4xl mx-auto pt-20 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Object.keys(answers).length} answered</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-soft)' }}>
          <CardHeader>
            <CardTitle className="text-xl">Question {currentQuestion + 1}</CardTitle>
            <CardDescription className="text-lg leading-relaxed pt-2">
              {questions[currentQuestion].question}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={answers[currentQuestion]}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {Object.entries(questions[currentQuestion].options).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50"
                  onClick={() => handleAnswer(key)}
                >
                  <RadioGroupItem value={key} id={`option-${key}`} />
                  <Label
                    htmlFor={`option-${key}`}
                    className="flex-1 cursor-pointer text-base"
                  >
                    <span className="font-semibold">{key}.</span> {value}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <div className="flex gap-3">
            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                className="px-8"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="px-8"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;