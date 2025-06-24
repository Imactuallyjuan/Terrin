import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { CreditCard, Loader2 } from 'lucide-react';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentButtonProps {
  projectId: number;
  conversationId?: number;
  amount: number;
  payeeId: string;
  description?: string;
  className?: string;
}

export default function PaymentButton({
  projectId,
  conversationId,
  amount,
  payeeId,
  description = "Project Payment",
  className
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useFirebaseAuth();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a payment",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create payment intent
      const token = await user.getIdToken();
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          project_id: projectId,
          conversation_id: conversationId,
          amount: amount,
          payee_id: payeeId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const data = await response.json();
      
      // Load Stripe and confirm payment
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.confirmCardPayment(data.client_secret);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Payment Successful",
        description: `Payment of $${amount.toFixed(2)} completed successfully. Professional will receive funds directly.`,
      });

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message.includes('must complete') 
          ? "This professional needs to complete their payment setup first. Please contact them to set up their Stripe account."
          : error.message || "An error occurred while processing the payment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
    </Button>
  );
}