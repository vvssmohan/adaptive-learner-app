import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, BookOpen, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const subjects = [
  "Mathematics",
  "Science",
  "Computer Networks",
  "Operating Systems",
  "Data Structures",
  "DBMS",
  "Java",
];

const skillLevels = ["Beginner", "Intermediate", "Advanced"];
const questionCounts = [5, 10, 20, 30];

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedCount, setSelectedCount] = useState<number>(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleStartQuiz = () => {
    if (!selectedSkill) {
      toast.error("Please select a skill level");
      return;
    }
    if (selectedSubjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }
    if (!selectedCount) {
      toast.error("Please select number of questions");
      return;
    }

    navigate("/quiz", {
      state: {
        skillLevel: selectedSkill,
        subjects: selectedSubjects,
        questionCount: selectedCount,
      },
    });
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(to bottom, hsl(220, 25%, 97%), hsl(220, 20%, 95%))' }}>
      <Navigation />
      
      <div className="max-w-6xl mx-auto pt-20 space-y-8">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">SmartQuizzer</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Challenge yourself with AI-generated quizzes tailored to your skill level
          </p>
        </div>

        <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-soft)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Select Your Skill Level
            </CardTitle>
            <CardDescription>Choose the difficulty that matches your expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {skillLevels.map((level) => (
                <Button
                  key={level}
                  variant={selectedSkill === level ? "default" : "outline"}
                  className="h-auto py-6 text-lg transition-all hover:scale-105"
                  onClick={() => setSelectedSkill(level)}
                  style={selectedSkill === level ? { background: 'var(--gradient-accent)' } : {}}
                >
                  {level}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-soft)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-secondary" />
              Choose Your Subjects
            </CardTitle>
            <CardDescription>Select one or more subjects for your quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {subjects.map((subject) => (
                <Badge
                  key={subject}
                  variant={selectedSubjects.includes(subject) ? "default" : "outline"}
                  className="cursor-pointer py-3 px-4 text-center justify-center transition-all hover:scale-105"
                  onClick={() => handleSubjectToggle(subject)}
                  style={selectedSubjects.includes(subject) ? { 
                    background: 'var(--gradient-secondary)',
                    border: 'none'
                  } : {}}
                >
                  {subject}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-soft)' }}>
          <CardHeader>
            <CardTitle>Number of Questions</CardTitle>
            <CardDescription>How many questions do you want to answer?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {questionCounts.map((count) => (
                <Button
                  key={count}
                  variant={selectedCount === count ? "default" : "outline"}
                  className="h-auto py-6 text-xl font-bold transition-all hover:scale-105"
                  onClick={() => setSelectedCount(count)}
                  style={selectedCount === count ? { background: 'var(--gradient-primary)' } : {}}
                >
                  {count}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            className="px-12 py-6 text-lg font-semibold shadow-lg hover:scale-105 transition-all"
            onClick={handleStartQuiz}
            style={{ background: 'var(--gradient-hero)' }}
          >
            Take Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;