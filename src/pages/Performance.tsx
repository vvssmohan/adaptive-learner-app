import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, BookOpen, Calendar } from "lucide-react";

interface QuizAttempt {
  id: string;
  skill_level: string;
  subjects: string[];
  score: number;
  total_questions: number;
  created_at: string;
}

const Performance = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchAttempts();
      }
    });
  }, [navigate]);

  const fetchAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAttempts(data || []);
    } catch (error) {
      console.error("Error fetching attempts:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (attempts.length === 0) return { total: 0, avgScore: 0, bestScore: 0 };

    const totalQuizzes = attempts.length;
    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
    const totalQuestions = attempts.reduce((sum, a) => sum + a.total_questions, 0);
    const avgScore = Math.round((totalScore / totalQuestions) * 100);
    const bestScore = Math.max(...attempts.map(a => Math.round((a.score / a.total_questions) * 100)));

    return { total: totalQuizzes, avgScore, bestScore };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(to bottom, hsl(220, 25%, 97%), hsl(220, 20%, 95%))' }}>
      <Navigation />
      
      <div className="max-w-6xl mx-auto pt-20 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Performance Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Track your progress and improve your skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Total Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.avgScore}%</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-accent" />
                Best Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.bestScore}%</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-soft)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quiz History
            </CardTitle>
            <CardDescription>Your recent quiz attempts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {attempts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No quizzes taken yet. Start your first quiz!
              </p>
            ) : (
              attempts.map((attempt) => {
                const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
                const performanceColor = 
                  percentage >= 80 ? "bg-green-500" :
                  percentage >= 60 ? "bg-blue-500" :
                  percentage >= 40 ? "bg-yellow-500" : "bg-red-500";

                return (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-4 rounded-lg border-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {attempt.subjects.map((subject) => (
                          <Badge key={subject} variant="outline">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{attempt.skill_level}</span>
                        <span>•</span>
                        <span>{new Date(attempt.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{percentage}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {attempt.score}/{attempt.total_questions} correct
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Performance;