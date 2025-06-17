import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import UserRoleSettings from "../components/UserRoleSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, User, Mail, Calendar } from "lucide-react";
import { Link } from "wouter";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useToast } from "../hooks/use-toast";

export default function SettingsPage() {
  const { user, userRole, loading } = useFirebaseAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Terrin</h1>
              </Link>
              <div className="text-gray-400">/</div>
              <h2 className="text-lg text-gray-600">Settings</h2>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">Account Settings</h2>
          </div>
          <p className="text-gray-600">
            Manage your account preferences and profile information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="flex items-center space-x-2 mt-1 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{user?.email}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Account Created</label>
                <div className="flex items-center space-x-2 mt-1 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">
                    {user?.metadata?.creationTime 
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : 'Recently'
                    }
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">User ID</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600 font-mono break-all">{user?.uid}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Settings */}
          <UserRoleSettings />
        </div>

        {/* Additional Settings Cards */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Password</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Update your password to keep your account secure.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Change Password (Coming Soon)
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Add an extra layer of security to your account.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Enable 2FA (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Sign Out</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Sign out of your account on this device.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Sign Out
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-red-600 mb-2">Danger Zone</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Permanently delete your account and all associated data.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled
                  className="text-red-600 border-red-200"
                >
                  Delete Account (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you have any questions about your account or need assistance with platform features, 
              we're here to help.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" disabled>
                Contact Support (Coming Soon)
              </Button>
              <Button variant="outline" size="sm" disabled>
                Help Center (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}