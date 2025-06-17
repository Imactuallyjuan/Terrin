import { useEffect } from "react";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { useToast } from "../hooks/use-toast";
import { useLocation } from "wouter";

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = "/auth",
  requireAuth = true 
}) {
  const { user, userRole, loading, isAuthenticated } = useFirebaseAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page.",
        variant: "destructive",
      });
      setLocation(redirectTo);
      return;
    }

    // Check role-based access
    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
      toast({
        title: "Access Denied",
        description: `This page is only available for ${allowedRoles.join(' and ')} accounts.`,
        variant: "destructive",
      });
      setLocation("/");
      return;
    }
  }, [loading, isAuthenticated, userRole, allowedRoles, requireAuth, redirectTo, toast, setLocation]);

  // Show minimal loading for very brief auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if authentication/authorization failed
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return null;
  }

  return children;
}