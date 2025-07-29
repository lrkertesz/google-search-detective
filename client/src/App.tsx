import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import History from "@/pages/history";
import NotFound from "@/pages/not-found";
import { ReportPreview } from "@/pages/report-preview";
import { LandingPreview } from "@/pages/landing-preview";
import { CompetitiveIntelligencePreview } from "@/pages/competitive-intelligence-preview";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/history" component={History} />
      <Route path="/report-preview" component={ReportPreview} />
      <Route path="/landing-preview" component={LandingPreview} />
      <Route path="/competitive-intelligence" component={CompetitiveIntelligencePreview} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
