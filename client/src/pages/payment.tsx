import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

export default function Payment() {
  const { user } = useFirebaseAuth();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'error' | 'processing'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const clientSecret = urlParams.get('client_secret');
  const conversationId = urlParams.get('conversation_id');
  const paymentIntentId = urlParams.get('payment_intent');
  const redirectStatus = urlParams.get('redirect_status');

  useEffect(() => {
    if (redirectStatus === 'succeeded') {
      setPaymentStatus('success');
      // Send success message to conversation
      sendSuccessMessage();
    } else if (redirectStatus === 'failed') {
      setPaymentStatus('error');
    } else if (clientSecret) {
      // Process payment with Stripe
      processPayment();
    }
  }, []);

  const processPayment = async () => {
    if (!clientSecret || !user) return;
    
    setPaymentStatus('processing');
    
    try {
      // For demo purposes, we'll simulate payment processing
      // In production, this would integrate with Stripe Elements
      setTimeout(() => {
        setPaymentStatus('success');
        sendSuccessMessage();
      }, 3000);
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentStatus('error');
    }
  };

  const sendSuccessMessage = async () => {
    if (!user || !conversationId) return;
    
    try {
      const token = await user.getIdToken();
      await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: "✅ Payment completed successfully! Thank you for your payment.",
          messageType: 'system'
        })
      });
    } catch (error) {
      console.error('Error sending success message:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
            <p className="text-gray-600">You need to be signed in to process payments.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/messages">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Messages
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Payment Processing</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Payment Status</span>
                <Badge variant={
                  paymentStatus === 'success' ? 'default' : 
                  paymentStatus === 'error' ? 'destructive' : 
                  'secondary'
                }>
                  {paymentStatus === 'success' ? 'Completed' : 
                   paymentStatus === 'error' ? 'Failed' : 
                   paymentStatus === 'processing' ? 'Processing' : 'Loading'}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center">
              {paymentStatus === 'loading' && (
                <div className="py-8">
                  <Loader2 className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-spin" />
                  <h3 className="text-lg font-medium mb-2">Initializing Payment</h3>
                  <p className="text-gray-600">Please wait while we prepare your payment...</p>
                </div>
              )}

              {paymentStatus === 'processing' && (
                <div className="py-8">
                  <Loader2 className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-spin" />
                  <h3 className="text-lg font-medium mb-2">Processing Payment</h3>
                  <p className="text-gray-600">Your payment is being processed. This may take a few moments...</p>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="py-8">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 mb-4">
                    Your payment has been processed successfully. A confirmation message has been sent to your conversation.
                  </p>
                  <div className="space-y-2">
                    <Link href="/messages">
                      <Button className="w-full">
                        Return to Messages
                      </Button>
                    </Link>
                    <Link href="/projects">
                      <Button variant="outline" className="w-full">
                        View Projects
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {paymentStatus === 'error' && (
                <div className="py-8">
                  <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                  <h3 className="text-lg font-medium mb-2">Payment Failed</h3>
                  <p className="text-gray-600 mb-4">
                    We encountered an issue processing your payment. Please try again or contact support if the problem persists.
                  </p>
                  <div className="space-y-2">
                    <Link href="/messages">
                      <Button className="w-full">
                        Return to Messages
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Integration Notice */}
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="text-center text-sm text-gray-500">
                <p className="mb-2">
                  <strong>Demo Mode:</strong> This is a demonstration of the payment flow.
                </p>
                <p>
                  In production, this would integrate with Stripe Elements for secure payment processing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}