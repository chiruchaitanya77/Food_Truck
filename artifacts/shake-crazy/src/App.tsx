import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import AdminLogin from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import MenuManager from "@/pages/admin/MenuManager";
import LocationManager from "@/pages/admin/LocationManager";
import SubmissionsManager from "@/pages/admin/SubmissionsManager";
import WinnersManager from "@/pages/admin/WinnersManager";
import DiscountsManager from "@/pages/admin/DiscountsManager";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/menu" component={MenuManager} />
      <Route path="/admin/location" component={LocationManager} />
      <Route path="/admin/submissions" component={SubmissionsManager} />
      <Route path="/admin/winners" component={WinnersManager} />
      <Route path="/admin/discounts" component={DiscountsManager} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
