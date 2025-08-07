import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileText, AlertCircle, DollarSign, Clock, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChangeOrderResult {
  scope: string;
  costImpact: {
    amount: string;
    explanation: string;
  };
  timeImpact: {
    duration: string;
    explanation: string;
  };
  recommendedAction: string;
}

export default function AIChangeOrder() {
  const [changeDescription, setChangeDescription] = useState("");
  const [changeOrder, setChangeOrder] = useState<ChangeOrderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateChangeOrder = async () => {
    if (!changeDescription.trim()) {
      setError("Please describe the change you want to make");
      return;
    }

    setLoading(true);
    setError("");
    setChangeOrder(null);

    try {
      const response = await apiRequest("POST", "/api/ai/change-order", {
        changeDescription: changeDescription.trim()
      });

      const data = await response.json();

      if (data.success) {
        // Parse the AI response into structured format
        const content = data.data.content;
        
        // Try to parse structured response or fallback to simple display
        try {
          const parsed = JSON.parse(content);
          setChangeOrder(parsed);
        } catch {
          // If not JSON, create a structured format from text
          setChangeOrder({
            scope: content,
            costImpact: {
              amount: "To be determined",
              explanation: "Detailed cost analysis included in scope above"
            },
            timeImpact: {
              duration: "To be determined",
              explanation: "Timeline impact included in scope above"
            },
            recommendedAction: "Review the scope details and consult with your contractor for specific pricing and timeline."
          });
        }
      } else {
        setError(data.error || "Failed to generate change order");
      }
    } catch (err) {
      console.error("Error generating change order:", err);
      setError("Failed to generate change order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setChangeDescription("");
    setChangeOrder(null);
    setError("");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-orange-600" />
          AI Change Order Generator
        </h1>
        <p className="text-gray-600 mt-2">
          Describe a change to your project and get an AI-generated change order with cost and time impact analysis
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Change Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">
                Describe the change you want to make to your project
              </Label>
              <Textarea
                id="description"
                placeholder="Example: I want to upgrade from laminate countertops to quartz countertops. The kitchen is 15 linear feet and I prefer white quartz with gray veining..."
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleGenerateChangeOrder}
                disabled={loading || !changeDescription.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Change Order...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Change Order
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Change Order</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-600 mb-4" />
                  <p className="text-gray-600">AI is analyzing the change impact...</p>
                </div>
              </div>
            ) : changeOrder ? (
              <div className="space-y-6">
                {/* Scope Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Scope of Change
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {changeOrder.scope}
                    </pre>
                  </div>
                </div>

                {/* Cost Impact */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                    Cost Impact
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="font-medium text-green-800 mb-2">
                      Estimated Impact: {changeOrder.costImpact.amount}
                    </p>
                    <p className="text-sm text-green-700">
                      {changeOrder.costImpact.explanation}
                    </p>
                  </div>
                </div>

                {/* Time Impact */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Time Impact
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-800 mb-2">
                      Timeline Impact: {changeOrder.timeImpact.duration}
                    </p>
                    <p className="text-sm text-blue-700">
                      {changeOrder.timeImpact.explanation}
                    </p>
                  </div>
                </div>

                {/* Recommended Action */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
                    Recommended Action
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700">
                      {changeOrder.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Describe a change and click "Generate Change Order" to see the impact analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Tips for Better Change Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Be specific about materials, finishes, and quantities involved in the change</li>
            <li>• Include the reason for the change (upgrade, fix issue, add functionality, etc.)</li>
            <li>• Mention if the change affects other parts of the project</li>
            <li>• Specify any preferences for timing (rush job, flexible timeline, etc.)</li>
            <li>• Include location details if the change is area-specific</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}