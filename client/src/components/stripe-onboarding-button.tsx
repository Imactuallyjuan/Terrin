import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, ExternalLink, Loader2, DollarSign } from 'lucide-react';

interface StripeOnboardingButtonProps {
  contractorId: number;
  className?: string;
}

export default function StripeOnboardingButton({ contractorId, className }: StripeOnboardingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const { user } = useFirebaseAuth();
  const { toast } = useToast();

  // Get contractor data to check Stripe status
  const { data: contractors } = useQuery({
    queryKey: ['/api/contractors/user'],
    enabled: !!user,
  });

  const contractor = contractors?.[0];
  const hasStripeAccount = contractor?.stripeAccountId;

  const handleOnboarding = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to set up payments",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/stripe/create-account-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create onboarding link');
      }

      const data = await response.json();
      
      // Redirect to Stripe onboarding
      window.location.href = data.url;

    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: "Onboarding Failed",
        description: error.message || "Failed to start onboarding process",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDashboard = async () => {
    if (!user) return;

    setDashboardLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/stripe/dashboard-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create dashboard link');
      }

      const data = await response.json();
      
      // Open dashboard in new tab
      window.open(data.url, '_blank');

    } catch (error: any) {
      console.error('Dashboard error:', error);
      toast({
        title: "Dashboard Error",
        description: error.message || "Failed to open dashboard",
        variant: "destructive"
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  if (hasStripeAccount) {
    return (
      <div className="flex gap-2">
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CreditCard className="h-3 w-3 mr-1" />
          Payments Active
        </Badge>
        <Button
          onClick={handleDashboard}
          disabled={dashboardLoading}
          variant="outline"
          size="sm"
          className={className}
        >
          {dashboardLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4 mr-2" />
          )}
          View Payouts
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleOnboarding}
      disabled={isLoading}
      className={`bg-blue-600 hover:bg-blue-700 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <DollarSign className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Setting Up...' : 'Set Up Payouts'}
    </Button>
  );
}