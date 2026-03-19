import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, BarChart3, Clock, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: progress } = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*, subcourses(*, courses(*))")
        .eq("user_id", user!.id)
        .order("last_watched_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: quizResults } = useQuery({
    queryKey: ["quiz-results", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_results")
        .select("*, subcourses(title)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: totalSubcourses } = useQuery({
    queryKey: ["total-subcourses"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("subcourses")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const completedLessons = progress?.filter((p) => p.completed).length || 0;
  const avgScore =
    quizResults && quizResults.length > 0
      ? Math.round(
          quizResults.reduce((acc, r) => acc + (r.score / r.total_questions) * 100, 0) /
            quizResults.length
        )
      : 0;
  const progressPercent = totalSubcourses ? Math.round((completedLessons / totalSubcourses) * 100) : 0;

  const recentlyWatched = progress?.filter((p) => p.last_watched_at).slice(0, 5) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your learning progress</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Completed Lessons", value: completedLessons, icon: BookOpen, color: "text-primary" },
          { label: "Avg Quiz Score", value: `${avgScore}%`, icon: Trophy, color: "text-success" },
          { label: "Total Lessons", value: totalSubcourses || 0, icon: BarChart3, color: "text-muted-foreground" },
          { label: "Progress", value: `${progressPercent}%`, icon: Clock, color: "text-primary" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Bar */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className="bg-success h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {completedLessons} of {totalSubcourses} lessons completed
          </p>
        </CardContent>
      </Card>

      {/* Recently Watched */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recently Watched</CardTitle>
        </CardHeader>
        <CardContent>
          {recentlyWatched.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No lessons watched yet</p>
              <Button asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentlyWatched.map((item: any) => (
                <Link
                  key={item.id}
                  to={`/learn/${item.subcourse_id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{item.subcourses?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.subcourses?.courses?.title}
                    </p>
                  </div>
                  {item.completed && (
                    <Badge className="bg-success/10 text-success border-0">Completed</Badge>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
