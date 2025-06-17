import { useEffect } from "react";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { useToast } from "../hooks/use-toast";

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = "/auth",
  requireAuth = true 
}) {
  const { user, userRole, loading, isAuthenticated } = useFirebaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 1000);
      return;
    }

    // Check role-based access
    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
      toast({
        title: "Access Denied",
        description: `This page is only available for ${allowedRoles.join(' and ')} accounts.`,
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      return;
    }
  }, [loading, isAuthenticated, userRole, allowedRoles, requireAuth, redirectTo, toast]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking access...</p>
        </div>
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