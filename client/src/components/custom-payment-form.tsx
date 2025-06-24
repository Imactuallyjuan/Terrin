import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, DollarSign } from 'lucide-react';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CustomPaymentFormProps {
  projectId: number;
  conversationId?: number;
  payeeId: string;
  className?: string;
}

export default function CustomPaymentForm({
  projectId,
  conversationId,
  payeeId,
  className
}: CustomPaymentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a payment",
        variant: "destructive"
      });
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
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
          amount: paymentAmount,
          payee_id: payeeId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
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
        description: `Payment of $${paymentAmount.toFixed(2)} completed successfully`,
      });

      // Reset form and close dialog
      setAmount('');
      setDescription('');
      setIsOpen(false);

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred while processing the payment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <DollarSign className="h-4 w-4 mr-2" />
          Custom Amount
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Payment</DialogTitle>
          <DialogDescription>
            Enter the amount and description for your payment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              max="10000"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Payment for materials, labor, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !amount}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ${amount || '0.00'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}