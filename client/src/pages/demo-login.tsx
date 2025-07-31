import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase } from "lucide-react";

export default function DemoLogin() {
  const [loading, setLoading] = useState(false);

  const loginAsDemo = async (userType: 'homeowner' | 'professional') => {
    setLoading(true);
    try {
      // In a real app, you'd handle Firebase auth here
      // For demo purposes, we'll just redirect and let the user know
      alert(`Demo Login: In a real implementation, this would log you in as the demo ${userType}.\n\nFor now, you can view the demo data by:\n1. Going to the database\n2. Or using the API endpoints directly\n3. Or implementing Firebase demo users`);
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Demo Data Access</h1>
          <p className="mt-2 text-gray-600">
            Choose a demo account to explore the platform with realistic data
          </p>
        </div>

        <div className="space-y-4">
          {/* Homeowner Demo Account */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Alice Johnson</span>
                <Badge variant="outline">Homeowner</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> homeowner@demo.com
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Demo Data:</strong> Kitchen renovation project, cost tracking, messages with contractor
                </p>
                <Button 
                  onClick={() => loginAsDemo('homeowner')}
                  disabled={loading}
                  className="w-full"
                >
                  Login as Alice (Homeowner)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Professional Demo Account */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-green-600" />
                <span>Bob Smith</span>
                <Badge variant="outline">Professional</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  <strong>Business:</strong> Smith Construction Co.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Demo Data:</strong> Professional profile, active projects, client communications
                </p>
                <Button 
                  onClick={() => loginAsDemo('professional')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Login as Bob (Professional)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Demo Data Includes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Active kitchen renovation project ($28k-34k)</li>
            <li>• 3 conversation messages</li>
            <li>• 4 project milestones (2 completed)</li>
            <li>• $6,800 in tracked costs</li>
            <li>• Tagged photos and documents</li>
            <li>• System notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}