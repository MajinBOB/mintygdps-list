// Main App component - references javascript_log_in_with_replit blueprint
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Demonlist from "@/pages/demonlist";
import Leaderboard from "@/pages/leaderboard";
import SubmitRecord from "@/pages/submit-record";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminDemons from "@/pages/admin-demons";
import AdminSubmissions from "@/pages/admin-submissions";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show landing page for unauthenticated users at root
  if ((isLoading || !isAuthenticated) && window.location.pathname === "/") {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Always register all routes so direct navigation works
  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      <Route path="/demonlist" component={Demonlist} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/submit" component={SubmitRecord} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/demons" component={AdminDemons} />
      <Route path="/admin/submissions" component={AdminSubmissions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
