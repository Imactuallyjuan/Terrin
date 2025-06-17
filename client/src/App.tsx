import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import ContractorPortal from "@/pages/contractor-portal";
import SettingsPage from "@/pages/settings";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

function Router() {
  const { isAuthenticated, loading } = useFirebaseAuth();

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Dashboard - Requires Authentication */}
      <Route path="/dashboard">
        <ProtectedRoute requireAuth={true}>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Protected Contractor Portal - Contractors and Both only */}
      <Route path="/contractor-portal">
        <ProtectedRoute requireAuth={true} allowedRoles={['contractor', 'both']}>
          <ContractorPortal />
        </ProtectedRoute>
      </Route>
      
      {/* Protected Settings - Requires Authentication */}
      <Route path="/settings">
        <ProtectedRoute requireAuth={true}>
          <SettingsPage />
        </ProtectedRoute>
      </Route>
      
      {/* Home/Landing Page */}
      {loading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" component={Home} />
      )}
      
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
