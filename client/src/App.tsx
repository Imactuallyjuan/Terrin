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
import ProfessionalPortal from "@/pages/professional-portal";
import Contractors from "@/pages/contractors";
import SettingsPage from "@/pages/settings";
import Estimates from "@/pages/estimates";
import Projects from "@/pages/projects";
import HowItWorks from "@/pages/how-it-works";
import FindContractors from "@/pages/find-contractors";
import FindProfessionals from "@/pages/find-professionals";
import ForProfessionals from "@/pages/for-professionals";
import Messages from "@/pages/messages";
import Gallery from "@/pages/gallery";
import ProjectGallery from "@/pages/project-gallery";
import ContractorProfile from "@/pages/contractor-profile";
import Payment from "@/pages/payment";
import ContractorDashboard from "@/pages/contractor-dashboard";
import Tutorial from "@/pages/tutorial";
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
      
      {/* Protected Professional Portal - Professionals and Both only */}
      <Route path="/professional-portal">
        <ProtectedRoute requireAuth={true} allowedRoles={['professional', 'both']}>
          <ProfessionalPortal />
        </ProtectedRoute>
      </Route>
      
      {/* Protected Settings - Requires Authentication */}
      <Route path="/settings">
        <ProtectedRoute requireAuth={true}>
          <SettingsPage />
        </ProtectedRoute>
      </Route>
      
      {/* Contractors Browsing - Requires Authentication */}
      <Route path="/professionals">
        <ProtectedRoute requireAuth={true}>
          <Contractors />
        </ProtectedRoute>
      </Route>
      
      {/* Estimates Page - Requires Authentication */}
      <Route path="/estimates">
        <ProtectedRoute requireAuth={true}>
          <Estimates />
        </ProtectedRoute>
      </Route>
      
      {/* Projects Page - Requires Authentication */}
      <Route path="/projects">
        <ProtectedRoute requireAuth={true}>
          <Projects />
        </ProtectedRoute>
      </Route>
      
      {/* Messages Page - Requires Authentication */}
      <Route path="/messages">
        <ProtectedRoute requireAuth={true}>
          <Messages />
        </ProtectedRoute>
      </Route>
      
      {/* Payment Page - Requires Authentication */}
      <Route path="/payment">
        <ProtectedRoute requireAuth={true}>
          <Payment />
        </ProtectedRoute>
      </Route>
      
      {/* Contractor Dashboard - Requires Authentication */}
      <Route path="/contractor-dashboard">
        <ProtectedRoute requireAuth={true} allowedRoles={['professional', 'both']}>
          <ContractorDashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Public Preview Pages - No Authentication Required */}
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/find-contractors" component={FindContractors} />
      <Route path="/find-professionals" component={FindProfessionals} />
      <Route path="/for-professionals" component={ForProfessionals} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/tutorial" component={Tutorial} />
      <Route path="/professionals/:id" component={ContractorProfile} />
      
      {/* Protected Project Gallery - Requires Authentication */}
      <Route path="/projects/:id/gallery">
        <ProtectedRoute requireAuth={true}>
          <ProjectGallery />
        </ProtectedRoute>
      </Route>
      
      {/* Home/Landing Page */}
      <Route path="/">
        {loading ? (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : isAuthenticated ? (
          <Home />
        ) : (
          <Landing />
        )}
      </Route>
      
      {/* Catch all - must be last */}
      <Route path="*" component={NotFound} />
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
