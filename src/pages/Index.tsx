import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, BarChart3, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-navy opacity-95" />
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-9 w-9 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-navy-foreground mb-4">
            SR EDU TECH
          </h1>
          <p className="text-lg text-navy-foreground/80 mb-8 max-w-2xl mx-auto">
            Master computer science with structured video courses, interactive quizzes, and real-time progress tracking.
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Button asChild size="lg">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/auth">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Play, title: "Video Lessons", desc: "High-quality YouTube-embedded lessons across 15 topics." },
            { icon: BookOpen, title: "Interactive Quizzes", desc: "Test your knowledge with MCQ quizzes after every lesson." },
            { icon: BarChart3, title: "Track Progress", desc: "Monitor your learning journey with detailed analytics." },
          ].map((f) => (
            <div key={f.title} className="text-center p-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
