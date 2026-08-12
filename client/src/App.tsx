import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardHome from "./pages/DashboardHome";
import Jobs from "./pages/Jobs";
import Tracker from "./pages/Tracker";
import Profile from "./pages/Profile";
import Logs from "./pages/Logs";
import Notifications from "./pages/Notifications";
import GoogleLogin from "./pages/GoogleLogin";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

function Router() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-slate-400 text-sm font-medium">Loading your career workspace...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <GoogleLogin />;
  }

  return (
    <Switch>
      <Route path="/" component={DashboardHome} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/tracker" component={Tracker} />
      <Route path="/profile" component={Profile} />
      <Route path="/logs" component={Logs} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
