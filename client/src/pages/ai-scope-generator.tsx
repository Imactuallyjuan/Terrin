import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AIScopeGenerator() {
  const [projectDescription, setProjectDescription] = useState("");
  const [generatedScope, setGeneratedScope] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateScope = async () => {
    if (!projectDescription.trim()) {
      setError("Please enter a project description");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedScope("");

    try {
      const response = await apiRequest("POST", "/api/ai/project-scope", {
        projectDescription: projectDescription.trim()
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedScope(data.data.content);
      } else {
        setError(data.error || "Failed to generate scope");
      }
    } catch (err) {
      console.error("Error generating scope:", err);
      setError("Failed to generate scope. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setProjectDescription("");
    setGeneratedScope("");
    setError("");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          AI Project Scope Generator
        </h1>
        <p className="text-gray-600 mt-2">
          Describe your construction project and let AI generate a detailed scope of work
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">
                Describe your construction project in detail
              </Label>
              <Textarea
                id="description"
                placeholder="Example: I want to renovate my kitchen with new cabinets, countertops, appliances, and modern lighting. The kitchen is about 200 sq ft and I prefer a contemporary style with white cabinets and quartz countertops..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
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
                onClick={handleGenerateScope}
                disabled={loading || !projectDescription.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Scope...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Scope with AI
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
            <CardTitle>Generated Project Scope</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600">AI is analyzing your project...</p>
                </div>
              </div>
            ) : generatedScope ? (
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generatedScope}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Sparkles className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Enter a project description and click "Generate Scope with AI" to see the results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Tips for Better Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Include specific details about materials, style preferences, and room dimensions</li>
            <li>• Mention any special requirements or challenges</li>
            <li>• Specify your location for region-specific considerations</li>
            <li>• Include budget range if you have one in mind</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}