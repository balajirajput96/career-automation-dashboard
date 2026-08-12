import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHomePage from "./pages/DashboardHome";
import JobsPage from "./pages/Jobs";
import TrackerPage from "./pages/Tracker";
import ProfilePage from "./pages/Profile";
import LogsPage from "./pages/Logs";
import NotificationsPage from "./pages/Notifications";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={DashboardHomePage} />
        <Route path="/jobs" component={JobsPage} />
        <Route path="/tracker" component={TrackerPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/logs" component={LogsPage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
