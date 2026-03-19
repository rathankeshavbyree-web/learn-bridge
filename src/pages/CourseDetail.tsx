import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowLeft } from "lucide-react";

export default function CourseDetail() {
  const { courseId } = useParams();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, subcourses(*)")
        .eq("id", courseId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!course) return <div>Course not found</div>;

  return (
    <div>
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/courses">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Link>
      </Button>

      <div className="mb-8">
        <Badge variant="secondary" className="mb-2">{course.category}</Badge>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground mt-1">{course.description}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {course.subcourses
          ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((sub: any, idx: number) => (
            <Card key={sub.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {idx + 1}
                  </div>
                  <CardTitle className="text-base">{sub.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{sub.description}</p>
                <Button asChild size="sm" className="w-full">
                  <Link to={`/learn/${sub.id}`}>
                    <Play className="mr-2 h-4 w-4" /> Start Lesson
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
