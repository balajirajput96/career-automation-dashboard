import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, CheckCircle2, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function GoogleLogin() {
  let { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400 mb-2">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Career Automation Hub</h1>
          <p className="text-slate-400 text-sm">
            Intelligent job discovery & pipeline management for Pharmaceutical & AI/Python tracks.
          </p>
        </div>

        <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-white">Sign in or Create Account</CardTitle>
            <CardDescription className="text-slate-400">
              Access your personalized career dashboard, AI match scoring, and automated tracker.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>AI match scoring powered by built-in LLM</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Automated daily cron discovery & alerts</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Full pipeline Kanban board & activity logs</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Button
                onClick={() => startLogin()}
                className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 font-medium flex items-center justify-center gap-3 shadow-lg transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google Account</span>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-xs text-slate-500 pb-6">
            <div className="flex items-center justify-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Secure authentication & encrypted session storage</span>
            </div>
            <p>By continuing, you agree to your personal career automation workspace terms.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
