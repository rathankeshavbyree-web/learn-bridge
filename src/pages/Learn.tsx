import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Learn() {
  const { subcourseId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  const { data: subcourse } = useQuery({
    queryKey: ["subcourse", subcourseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcourses")
        .select("*, courses(*)")
        .eq("id", subcourseId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!subcourseId,
  });

  const { data: questions } = useQuery({
    queryKey: ["quiz", subcourseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("subcourse_id", subcourseId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!subcourseId,
  });

  // Mark as watched
  const markWatched = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: user.id,
          subcourse_id: subcourseId!,
          last_watched_at: new Date().toISOString(),
          completed: true,
        }, { onConflict: "user_id,subcourse_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      toast({ title: "Lesson marked as complete!" });
    },
  });

  // Submit quiz
  const submitQuiz = useMutation({
    mutationFn: async () => {
      if (!user || !questions) return;
      let correct = 0;
      questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correct_answer) correct++;
      });
      const result = { correct, total: questions.length };
      setScore(result);

      const { error } = await supabase
        .from("quiz_results")
        .upsert({
          user_id: user.id,
          subcourse_id: subcourseId!,
          score: correct,
          total_questions: questions.length,
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,subcourse_id" });
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["quiz-results"] });
    },
  });

  if (!subcourse) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" asChild className="mb-4">
        <Link to={`/courses/${subcourse.course_id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-2">{subcourse.title}</h1>
      <p className="text-muted-foreground mb-6">{subcourse.description}</p>

      {/* Video Player */}
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-card border mb-4">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${subcourse.youtube_video_id}?modestbranding=1&rel=0`}
          title={subcourse.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <Button
        onClick={() => markWatched.mutate()}
        variant="outline"
        className="mb-8"
        disabled={markWatched.isPending}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Mark as Complete
      </Button>

      {/* Quiz Section */}
      {questions && questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quiz</span>
              {score && (
                <Badge className="bg-success text-success-foreground">
                  Score: {score.correct}/{score.total}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q, qi) => {
              const options = q.options as string[];
              return (
                <div key={q.id} className="space-y-3">
                  <p className="font-medium">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="grid gap-2">
                    {options.map((opt, oi) => {
                      const isSelected = selectedAnswers[q.id] === oi;
                      const isCorrect = submitted && oi === q.correct_answer;
                      const isWrong = submitted && isSelected && oi !== q.correct_answer;

                      return (
                        <button
                          key={oi}
                          onClick={() => {
                            if (submitted) return;
                            setSelectedAnswers((prev) => ({ ...prev, [q.id]: oi }));
                          }}
                          className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                            isCorrect
                              ? "border-success bg-success/10 text-foreground"
                              : isWrong
                              ? "border-destructive bg-destructive/10 text-foreground"
                              : isSelected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border hover:border-primary/50 text-foreground"
                          }`}
                          disabled={submitted}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {!submitted && (
              <Button
                onClick={() => submitQuiz.mutate()}
                disabled={
                  submitQuiz.isPending ||
                  Object.keys(selectedAnswers).length !== questions.length
                }
                className="w-full"
              >
                Submit Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
