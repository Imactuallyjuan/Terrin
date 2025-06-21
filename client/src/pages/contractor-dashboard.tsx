import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  CreditCard,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";

interface EarningsData {
  totalEarnings: number;
  availableBalance: number;
  pendingPayouts: number;
  lastPayout: {
    amount: number;
    date: string;
    status: string;
  };
  recentTransactions: Array<{
    id: number;
    projectTitle?: string;
    amount: number;
    date: string;
    status: string;
    type: string;
  }>;
}

export default function ContractorDashboard() {
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [payoutAmount, setPayoutAmount] = useState("");

  // Fetch contractor profile to get contractor ID
  const { data: profileArray } = useQuery({
    queryKey: [`/api/contractors/user/${user?.uid}`],
    enabled: !!user?.uid
  });

  const profile = Array.isArray(profileArray) ? profileArray[0] : profileArray;

  // Fetch earnings data
  const { data: earnings, isLoading: earningsLoading } = useQuery<EarningsData>({
    queryKey: [`/api/contractors/${profile?.id}/earnings`],
    queryFn: async () => {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/contractors/${profile.id}/earnings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch earnings');
      return response.json();
    },
    enabled: !!profile?.id
  });

  // Request payout mutation
  const requestPayoutMutation = useMutation({
    mutationFn: async (amount: number) => {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/contractors/${profile.id}/request-payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      if (!response.ok) throw new Error('Failed to request payout');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted and will be processed within 2 business days.",
      });
      setPayoutAmount("");
      // Refresh earnings data
      // queryClient.invalidateQueries({ queryKey: [`/api/contractors/${profile?.id}/earnings`] });
    },
    onError: (error: any) => {
      toast({
        title: "Payout Request Failed",
        description: error.message || "Failed to request payout. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleRequestPayout = () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payout amount.",
        variant: "destructive",
      });
      return;
    }

    if (earnings && amount > earnings.availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Payout amount cannot exceed available balance.",
        variant: "destructive",
      });
      return;
    }

    requestPayoutMutation.mutate(amount);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Professional Profile Required</h2>
              <p className="text-slate-600 mb-6">
                You need to set up your professional profile to access earnings and payouts.
              </p>
              <Link href="/professional-portal">
                <Button>Set Up Professional Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (earningsLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/professional-portal">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Professional Portal
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Contractor Dashboard</h1>
          <p className="mt-2 text-lg text-slate-600">
            Manage your earnings, payouts, and transaction history
          </p>
        </div>

        {earnings && (
          <>
            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${earnings.totalEarnings.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Available Balance</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${earnings.availableBalance.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Pending Payouts</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        ${earnings.pendingPayouts.toLocaleString()}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Last Payout</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${earnings.lastPayout.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(earnings.lastPayout.date).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="transactions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                <TabsTrigger value="payouts">Request Payout</TabsTrigger>
              </TabsList>

              {/* Transaction History */}
              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {earnings.recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              transaction.type === 'payout' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {transaction.type === 'payout' ? (
                                <CreditCard className="h-4 w-4 text-blue-600" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {transaction.projectTitle || 
                                 (transaction.type === 'payout' ? 'Bank Transfer' : 'Project Payment')}
                              </p>
                              <p className="text-sm text-slate-600">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              {transaction.type === 'payout' ? '-' : '+'}${transaction.amount.toLocaleString()}
                            </p>
                            <Badge variant={
                              transaction.status === 'completed' ? 'default' : 
                              transaction.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Request Payout */}
              <TabsContent value="payouts">
                <Card>
                  <CardHeader>
                    <CardTitle>Request Payout</CardTitle>
                    <p className="text-sm text-slate-600">
                      Transfer your available earnings to your bank account. Payouts typically arrive within 2 business days.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {earnings.availableBalance > 0 ? (
                      <>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-slate-700">
                              Payout Amount
                            </label>
                            <div className="mt-1 relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={payoutAmount}
                                onChange={(e) => setPayoutAmount(e.target.value)}
                                className="pl-8"
                                min="1"
                                max={earnings.availableBalance}
                                step="0.01"
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Maximum: ${earnings.availableBalance.toLocaleString()}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setPayoutAmount((earnings.availableBalance / 2).toFixed(2))}
                            >
                              50%
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setPayoutAmount(earnings.availableBalance.toFixed(2))}
                            >
                              All Available
                            </Button>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                              <p className="font-medium mb-1">Payout Information</p>
                              <ul className="space-y-1 text-xs">
                                <li>• Payouts are processed within 2 business days</li>
                                <li>• Funds will be transferred to your connected bank account</li>
                                <li>• A small processing fee may apply</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleRequestPayout}
                          disabled={!payoutAmount || requestPayoutMutation.isPending}
                          className="w-full"
                          size="lg"
                        >
                          {requestPayoutMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Processing...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Request Payout
                            </div>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <DollarSign className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No Available Balance</h3>
                        <p className="text-slate-600">
                          Complete more projects to earn money that can be withdrawn.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}