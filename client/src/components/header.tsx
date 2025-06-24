import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { useToast } from "../hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCheck, Building2, Users, Eye, ChevronDown } from "lucide-react";

export default function Header() {
  const { isAuthenticated, user, userRole } = useFirebaseAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: !!user,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      if (!response.ok) {
        throw new Error('Failed to update role');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Role updated",
        description: "Your role has been updated successfully.",
      });
    }
  });

  const handleRoleChange = (role: string) => {
    updateRoleMutation.mutate(role);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'homeowner': return <UserCheck className="h-4 w-4" />;
      case 'contractor': return <Building2 className="h-4 w-4" />;
      case 'both': return <Users className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'homeowner': return 'Homeowner';
      case 'contractor': return 'Professional';
      case 'both': return 'Both';
      default: return 'Visitor';
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out successfully",
        description: "You've been signed out of your account.",
      });
      // Redirect to landing page after sign out
      setLocation('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Terrin</h1>
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <span className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
                      Dashboard
                    </span>
                  </Link>
                  <Link href="/messages">
                    <span className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
                      Messages
                    </span>
                  </Link>
                  {(userRole === 'professional' || userRole === 'both') && (
                    <Link href="/professional-portal">
                      <span className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
                        Professional Portal
                      </span>
                    </Link>
                  )}
                  <Link href="/settings">
                    <span className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
                      Settings
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/how-it-works">
                    <span className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
                      How it Works
                    </span>
                  </Link>
                  <Link href="/find-professionals">
                    <span className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
                      Find Professionals
                    </span>
                  </Link>
                  <Link href="/for-professionals">
                    <span className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
                      For Professionals
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                      {getRoleIcon(userProfile?.role || userRole || 'visitor')}
                      <span>{getRoleLabel(userProfile?.role || userRole || 'visitor')}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-medium text-slate-700">
                      Switch Role
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleRoleChange('visitor')}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visitor
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange('homeowner')}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Homeowner
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange('contractor')}>
                      <Building2 className="mr-2 h-4 w-4" />
                      Professional
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange('both')}>
                      <Users className="mr-2 h-4 w-4" />
                      Both
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-sm text-slate-600">
                  {user?.email?.split('@')[0] || 'User'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
