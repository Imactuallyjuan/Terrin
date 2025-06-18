import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Calculator } from "lucide-react";

interface EstimateData {
  totalCostMin: string;
  totalCostMax: string;
  timeline: string;
  materialsCostMin: string;
  materialsCostMax: string;
  laborCostMin: string;
  laborCostMax: string;
  permitsCostMin: string;
  permitsCostMax: string;
  contingencyCostMin: string;
  contingencyCostMax: string;
  analysis?: {
    factors?: string[];
    assumptions?: string[];
    recommendations?: string[];
    riskFactors?: string[];
  };
}

export default function CostEstimator() {
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleEstimateGenerated = (event: CustomEvent) => {
      console.log('Estimate generated:', event.detail);
      setEstimate(event.detail);
      setIsLoading(false);
    };

    const handleEstimateStarted = () => {
      setIsLoading(true);
      setEstimate(null);
    };

    window.addEventListener('estimateGenerated', handleEstimateGenerated as EventListener);
    window.addEventListener('estimateStarted', handleEstimateStarted as EventListener);
    
    return () => {
      window.removeEventListener('estimateGenerated', handleEstimateGenerated as EventListener);
      window.removeEventListener('estimateStarted', handleEstimateStarted as EventListener);
    };
  }, []);

  const scrollToMatchTrades = () => {
    const element = document.getElementById('match-trades');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <section className="py-16 bg-white" id="cost-estimator">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            AI-Powered Cost Estimate
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Get an instant, accurate estimate for your project
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">AI is analyzing your project...</p>
          </div>
        )}

        {estimate && (
          <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Your Project Estimate</h3>
                <Badge className="bg-green-600 hover:bg-green-600 text-white">
                  <Check className="mr-2 h-4 w-4" />
                  AI Verified
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Total Estimated Cost</h4>
                  <div className="text-3xl font-bold text-orange-400">
                    {formatCurrency(estimate.totalCostMin)} - {formatCurrency(estimate.totalCostMax)}
                  </div>
                  <p className="text-sm opacity-90 mt-1">Based on current market rates</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Estimated Timeline</h4>
                  <div className="text-2xl font-bold">{estimate.timeline}</div>
                  <p className="text-sm opacity-90 mt-1">Typical project duration</p>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3">Cost Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Materials</span>
                    <span>{formatCurrency(estimate.materialsCostMin)} - {formatCurrency(estimate.materialsCostMax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labor</span>
                    <span>{formatCurrency(estimate.laborCostMin)} - {formatCurrency(estimate.laborCostMax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Permits & Fees</span>
                    <span>{formatCurrency(estimate.permitsCostMin)} - {formatCurrency(estimate.permitsCostMax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contingency (10%)</span>
                    <span>{formatCurrency(estimate.contingencyCostMin)} - {formatCurrency(estimate.contingencyCostMax)}</span>
                  </div>
                </div>
              </div>

              {/* Trade Breakdowns */}
              {estimate.tradeBreakdowns && Object.keys(estimate.tradeBreakdowns).length > 0 && (
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-3">Trade-Specific Costs</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {Object.entries(estimate.tradeBreakdowns).map(([trade, costs]: [string, any]) => (
                      <div key={trade} className="flex justify-between items-center">
                        <span className="capitalize opacity-90">{trade}:</span>
                        <span className="font-medium">
                          {formatCurrency(costs.min)} - {formatCurrency(costs.max)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {estimate.analysis && (
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-3">AI Analysis</h4>
                  {estimate.analysis.recommendations && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Recommendations:</h5>
                      <ul className="text-sm opacity-90 space-y-1">
                        {estimate.analysis.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {estimate.analysis.factors && (
                    <div>
                      <h5 className="font-medium mb-2">Key Factors Considered:</h5>
                      <ul className="text-sm opacity-90 space-y-1">
                        {estimate.analysis.factors.map((factor, index) => (
                          <li key={index}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <Button
                  className="bg-orange-600 text-white hover:bg-orange-700"
                  onClick={scrollToMatchTrades}
                >
                  Find Contractors
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-blue-600 hover:bg-gray-50 border-white"
                >
                  Save Estimate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!estimate && !isLoading && (
          <div className="text-center py-12">
            <Calculator className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Get Your Estimate?</h3>
            <p className="text-slate-600 mb-6">
              Fill out the project form above and click "Get AI Estimate" to see your personalized cost breakdown.
            </p>
            <Button
              onClick={() => {
                const element = document.getElementById('post-project');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Project Form
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
