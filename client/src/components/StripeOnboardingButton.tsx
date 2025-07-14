import { useState } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  ExternalLink, 
  Loader2,
  CheckCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StripeOnboardingButtonProps {
  stripeAccountId?: string;
  onAccountCreated?: (accountId: string) => void;
}

export default function StripeOnboardingButton({ 
  stripeAccountId, 
  onAccountCreated 
}: StripeOnboardingButtonProps) {
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSetupPayouts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/stripe/create-account-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const { url } = await response.json();
        // Open Stripe onboarding in a new window to avoid CORS issues
        window.open(url, '_blank', 'noopener,noreferrer');
        
        toast({
          title: "Stripe Onboarding Started",
          description: "Complete the setup in the new window and return here.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Setup Failed",
          description: errorData.message || "Failed to create Stripe account link",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error setting up payouts:', error);
      toast({
        title: "Setup Failed",
        description: "Unable to set up payouts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayouts = async () => {
    if (!user || !stripeAccountId) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/stripe/dashboard-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accountId: stripeAccountId })
      });

      if (response.ok) {
        const { dashboardLink } = await response.json();
        window.open(dashboardLink, '_blank');
      } else {
        toast({
          title: "Dashboard Error",
          description: "Unable to access Stripe dashboard",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error accessing payouts:', error);
      toast({
        title: "Dashboard Error",
        description: "Unable to access payouts dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (stripeAccountId) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>Payouts enabled</span>
        </div>
        <Button
          onClick={handleViewPayouts}
          disabled={loading}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4 mr-2" />
          )}
          View Payouts Dashboard
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleSetupPayouts}
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      Set Up Payouts
    </Button>
  );
}