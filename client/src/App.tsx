import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/dashboard";
import Indicators from "@/pages/indicators";
import Associates from "@/pages/associates";
import Compensation from "@/pages/compensation";
import Missions from "@/pages/missions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/indicators" component={Indicators} />
      <Route path="/associates" component={Associates} />
      <Route path="/compensation" component={Compensation} />
      <Route path="/missions" component={Missions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <Router />
      </DashboardLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
