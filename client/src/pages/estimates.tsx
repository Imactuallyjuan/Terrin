import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, DollarSign, Clock, MapPin, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Estimates() {
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: estimates = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/estimates"],
    enabled: !!user,
  });

  const deleteEstimateMutation = useMutation({
    mutationFn: async (estimateId: number) => {
      await apiRequest('DELETE', `/api/estimates/${estimateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({
        title: "Estimate Deleted",
        description: "The estimate has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete estimate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getEstimateName = (estimate: any) => {
    try {
      if (estimate.inputData) {
        const inputData = JSON.parse(estimate.inputData);
        // Use the improved title if available, otherwise fall back to old format
        if (inputData.title) {
          return inputData.title;
        }
        const type = inputData.projectType || 'Construction Project';
        const location = inputData.location ? ` in ${inputData.location}` : '';
        return `${type}${location}`;
      }
    } catch (error) {
      console.log('Error parsing estimate inputData:', error);
    }
    return `Construction Estimate`;
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Cost Estimates</h1>
              <p className="mt-2 text-slate-600">
                View all your AI-powered construction cost estimates
              </p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {estimates.length} estimate{estimates.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {estimates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <DollarSign className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Estimates Yet</h3>
              <p className="text-slate-600 mb-6">
                Get your first AI-powered construction cost estimate
              </p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Your First Estimate
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {estimates.map((estimate: any) => (
              <Card key={estimate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {getEstimateName(estimate)}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600 hover:bg-green-600 text-white">
                        AI Verified
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEstimateMutation.mutate(estimate.id)}
                        disabled={deleteEstimateMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Cost Info */}
                    <div className="lg:col-span-2">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-4">
                        <h3 className="text-lg font-semibold mb-3">Total Project Cost</h3>
                        <p className="text-3xl font-bold">
                          {formatCurrency(estimate.totalCostMin)} - {formatCurrency(estimate.totalCostMax)}
                        </p>
                        <div className="flex items-center mt-2 text-blue-100">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{estimate.timeline}</span>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Materials:</span>
                            <span className="font-medium">
                              {formatCurrency(estimate.materialsCostMin)} - {formatCurrency(estimate.materialsCostMax)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Labor:</span>
                            <span className="font-medium">
                              {formatCurrency(estimate.laborCostMin)} - {formatCurrency(estimate.laborCostMax)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Permits:</span>
                            <span className="font-medium">
                              {formatCurrency(estimate.permitsCostMin)} - {formatCurrency(estimate.permitsCostMax)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Contingency:</span>
                            <span className="font-medium">
                              {formatCurrency(estimate.contingencyCostMin)} - {formatCurrency(estimate.contingencyCostMax)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Trade Breakdowns */}
                      {estimate.tradeBreakdowns && typeof estimate.tradeBreakdowns === 'object' && Object.keys(estimate.tradeBreakdowns).length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-200">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3">Trade-Specific Costs</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {Object.entries(estimate.tradeBreakdowns).map(([trade, costs]: [string, any]) => (
                              <div key={trade} className="flex justify-between">
                                <span className="text-slate-600 capitalize">{trade}:</span>
                                <span className="font-medium">
                                  {formatCurrency(costs.min)} - {formatCurrency(costs.max)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Generated {formatDate(estimate.createdAt)}
                      </div>
                      
                      {estimate.inputData && (() => {
                        try {
                          const inputData = JSON.parse(estimate.inputData);
                          return (
                            <div className="space-y-2">
                              {inputData.location && (
                                <div className="flex items-center text-sm text-slate-600">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {inputData.location}
                                </div>
                              )}
                              {inputData.projectType && (
                                <div className="text-sm">
                                  <span className="text-slate-600">Type:</span>
                                  <span className="ml-2 font-medium">{inputData.projectType}</span>
                                </div>
                              )}
                              {inputData.squareFootage && (
                                <div className="text-sm">
                                  <span className="text-slate-600">Size:</span>
                                  <span className="ml-2 font-medium">{inputData.squareFootage} sq ft</span>
                                </div>
                              )}
                              {inputData.description && (
                                <div className="text-sm">
                                  <span className="text-slate-600">Details:</span>
                                  <span className="ml-2">{inputData.description.substring(0, 100)}...</span>
                                </div>
                              )}
                            </div>
                          );
                        } catch (error) {
                          console.log('Error parsing inputData for metadata:', error);
                          return null;
                        }
                      })()}

                      {/* AI Analysis Preview */}
                      {estimate.aiAnalysis && typeof estimate.aiAnalysis === 'object' && estimate.aiAnalysis.factors && Array.isArray(estimate.aiAnalysis.factors) && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                          <h4 className="text-sm font-medium text-slate-900 mb-2">Key Factors</h4>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {estimate.aiAnalysis.factors.slice(0, 3).map((factor: string, index: number) => (
                              <li key={index}>• {factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}