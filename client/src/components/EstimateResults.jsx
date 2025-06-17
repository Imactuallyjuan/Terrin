import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, MapPin, Home, DollarSign, Clock } from 'lucide-react';

export default function EstimateResults({ estimate }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const parseInputData = (inputData) => {
    try {
      return typeof inputData === 'string' ? JSON.parse(inputData) : inputData;
    } catch {
      return inputData || {};
    }
  };

  const input = parseInputData(estimate.inputData);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Cost Estimate</span>
          <Badge variant="secondary">
            {new Date(estimate.createdAt).toLocaleDateString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Home className="h-4 w-4 text-gray-600" />
            <div>
              <div className="text-sm text-gray-600">Project Type</div>
              <div className="font-medium">{input.projectType || 'Construction Project'}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-600" />
            <div>
              <div className="text-sm text-gray-600">Location</div>
              <div className="font-medium">{input.location}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Home className="h-4 w-4 text-gray-600" />
            <div>
              <div className="text-sm text-gray-600">Square Footage</div>
              <div className="font-medium">{input.squareFootage?.toLocaleString()} sq ft</div>
            </div>
          </div>
        </div>

        {/* Total Cost Range */}
        <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <DollarSign className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-blue-900">Total Project Cost</h3>
          </div>
          <div className="text-3xl font-bold text-blue-900">
            {formatCurrency(estimate.totalCostMin)} - {formatCurrency(estimate.totalCostMax)}
          </div>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700">{estimate.timeline}</span>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Cost Breakdown</h4>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-green-800">Materials</span>
              <span className="font-medium text-green-900">
                {formatCurrency(estimate.materialsCostMin)} - {formatCurrency(estimate.materialsCostMax)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="text-blue-800">Labor</span>
              <span className="font-medium text-blue-900">
                {formatCurrency(estimate.laborCostMin)} - {formatCurrency(estimate.laborCostMax)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
              <span className="text-yellow-800">Permits & Fees</span>
              <span className="font-medium text-yellow-900">
                {formatCurrency(estimate.permitsCostMin)} - {formatCurrency(estimate.permitsCostMax)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
              <span className="text-orange-800">Contingency</span>
              <span className="font-medium text-orange-900">
                {formatCurrency(estimate.contingencyCostMin)} - {formatCurrency(estimate.contingencyCostMax)}
              </span>
            </div>
          </div>

          {/* Project Description */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Project Description</h4>
            <div className="p-3 bg-gray-50 rounded text-gray-700 text-sm">
              {input.description}
            </div>
            {input.budget && (
              <div className="p-3 bg-purple-50 rounded">
                <span className="text-purple-800 text-sm font-medium">Budget Range: </span>
                <span className="text-purple-900">{input.budget}</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        {estimate.analysis && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">AI Analysis</h4>
            
            {estimate.analysis.factors && estimate.analysis.factors.length > 0 && (
              <div className="p-3 bg-blue-50 rounded">
                <h5 className="font-medium text-blue-900 mb-2">Key Factors</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  {estimate.analysis.factors.map((factor, index) => (
                    <li key={index}>• {factor}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {estimate.analysis.recommendations && estimate.analysis.recommendations.length > 0 && (
              <div className="p-3 bg-green-50 rounded">
                <h5 className="font-medium text-green-900 mb-2">Recommendations</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  {estimate.analysis.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {estimate.analysis.riskFactors && estimate.analysis.riskFactors.length > 0 && (
              <div className="p-3 bg-yellow-50 rounded">
                <h5 className="font-medium text-yellow-900 mb-2">Risk Factors</h5>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {estimate.analysis.riskFactors.map((risk, index) => (
                    <li key={index}>• {risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}