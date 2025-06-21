import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Shield, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

function PaymentForm({ projectId, amount, projectTitle }: { projectId: string; amount: number; projectTitle: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?project=${projectId}`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Secure Payment</h3>
        </div>
        <p className="text-sm text-blue-700">
          Your payment information is encrypted and secure. This deposit will be held in escrow until project completion.
        </p>
      </div>

      <PaymentElement />

      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-t">
          <span className="font-medium">Project Deposit</span>
          <span className="font-bold text-lg">${amount.toFixed(2)}</span>
        </div>
        
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pay ${amount.toFixed(2)} Deposit
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function Payment() {
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get project ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('project');
  const amount = parseFloat(urlParams.get('amount') || '1000');

  useEffect(() => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    if (!projectId) {
      toast({
        title: "Invalid Payment",
        description: "No project specified for payment.",
        variant: "destructive",
      });
      setLocation('/dashboard');
      return;
    }

    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount,
            projectId,
            description: `Project deposit for project #${projectId}`
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);

        // Load project data
        const projectResponse = await fetch(`/api/projects/${projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (projectResponse.ok) {
          const project = await projectResponse.json();
          setProjectData(project);
        }
      } catch (error) {
        console.error('Payment setup error:', error);
        toast({
          title: "Payment Setup Failed",
          description: "Unable to initialize payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [user, projectId, amount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Payment Setup Failed</h2>
              <p className="text-gray-600 mb-6">
                Unable to initialize payment processing. Please try again or contact support.
              </p>
              <Link href="/dashboard">
                <Button>Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Project Deposit Payment
            </CardTitle>
            {projectData && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{projectData.title}</h3>
                <p className="text-sm text-gray-600">{projectData.description}</p>
                <div className="flex gap-2">
                  <Badge variant="outline">{projectData.projectType}</Badge>
                  <Badge variant="secondary">{projectData.location}</Badge>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                projectId={projectId!}
                amount={amount}
                projectTitle={projectData?.title || 'Project'}
              />
            </Elements>
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>Powered by Stripe. Your payment information is secure and encrypted.</p>
        </div>
      </div>
    </div>
  );
}