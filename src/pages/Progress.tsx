import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Progress() {
  const { user } = useAuth();

  const { data: quizResults } = useQuery({
    queryKey: ["quiz-results", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_results")
        .select("*, subcourses(title, courses(title))")
        .eq("user_id", user!.id)
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: progress } = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*, subcourses(title, courses(title))")
        .eq("user_id", user!.id)
        .eq("completed", true);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Progress</h1>
        <p className="text-muted-foreground mt-1">Your detailed learning analytics</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Completed Lessons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completed Lessons ({progress?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!progress?.length ? (
              <p className="text-muted-foreground text-sm">No lessons completed yet.</p>
            ) : (
              <div className="space-y-3">
                {progress.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm">{p.subcourses?.title}</p>
                      <p className="text-xs text-muted-foreground">{p.subcourses?.courses?.title}</p>
                    </div>
                    <Badge className="bg-success/10 text-success border-0">✓</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quiz Scores ({quizResults?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!quizResults?.length ? (
              <p className="text-muted-foreground text-sm">No quizzes taken yet.</p>
            ) : (
              <div className="space-y-3">
                {quizResults.map((r: any) => {
                  const pct = Math.round((r.score / r.total_questions) * 100);
                  return (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium text-sm">{r.subcourses?.title}</p>
                        <p className="text-xs text-muted-foreground">{r.subcourses?.courses?.title}</p>
                      </div>
                      <Badge
                        className={`border-0 ${
                          pct >= 70
                            ? "bg-success/10 text-success"
                            : pct >= 40
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {r.score}/{r.total_questions} ({pct}%)
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
