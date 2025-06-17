import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Building, Users, Globe } from 'lucide-react';
import { useLocation } from 'wouter';

export default function UserRoleSettings() {
  const { user, userRole, refreshUserData } = useFirebaseAuth();
  const [newRole, setNewRole] = useState(userRole || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const roleOptions = [
    {
      value: 'homeowner',
      label: 'Homeowner',
      description: 'Post projects and hire contractors',
      icon: User,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      value: 'contractor',
      label: 'Contractor',
      description: 'Find projects and submit bids',
      icon: Building,
      color: 'bg-green-100 text-green-800'
    },
    {
      value: 'both',
      label: 'Both',
      description: 'Post projects and work as contractor',
      icon: Users,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      value: 'visitor',
      label: 'Visitor',
      description: 'Browse and explore the platform',
      icon: Globe,
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  const getCurrentRoleInfo = () => {
    return roleOptions.find(role => role.value === userRole) || roleOptions[3];
  };

  const getNewRoleInfo = () => {
    return roleOptions.find(role => role.value === newRole) || roleOptions[3];
  };

  const handleRoleChange = async () => {
    if (!user || !newRole || newRole === userRole) {
      console.log('Role change blocked:', { user: !!user, newRole, userRole });
      return;
    }

    console.log('Starting role update:', { from: userRole, to: newRole, userId: user.uid });
    setLoading(true);
    const selectedRoleInfo = getNewRoleInfo();
    
    try {
      // Update the role in Firestore
      console.log('Updating Firestore document...');
      await updateDoc(doc(db, 'users', user.uid), {
        role: newRole,
        updatedAt: new Date()
      });
      console.log('Firestore update successful');

      // Clear the cached role and refresh user data
      sessionStorage.removeItem(`userRole_${user.uid}`);
      console.log('Cache cleared, refreshing user data...');
      await refreshUserData();
      console.log('User data refreshed');

      toast({
        title: "Role updated successfully!",
        description: `You are now registered as a ${selectedRoleInfo.label.toLowerCase()}.`,
      });

      // Small delay to ensure state updates, then redirect
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        setLocation('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Failed to update role",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const currentRole = getCurrentRoleInfo();
  const selectedRole = getNewRoleInfo();
  const CurrentIcon = currentRole.icon;
  const SelectedIcon = selectedRole.icon;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Account Type</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Role */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Current Role</h3>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CurrentIcon className="h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{currentRole.label}</span>
                <Badge className={currentRole.color}>Current</Badge>
              </div>
              <p className="text-sm text-gray-600">{currentRole.description}</p>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Change Role</h3>
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select new role..." />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => {
                const RoleIcon = role.icon;
                return (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center space-x-2">
                      <RoleIcon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-xs text-gray-500">{role.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Preview of selected role */}
        {newRole && newRole !== userRole && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">New Role Preview</h3>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <SelectedIcon className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{selectedRole.label}</span>
                  <Badge className="bg-blue-100 text-blue-800">New</Badge>
                </div>
                <p className="text-sm text-gray-600">{selectedRole.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-gray-100 p-3 rounded text-sm">
          <div><strong>Debug Info:</strong></div>
          <div>User ID: {user?.uid}</div>
          <div>Current Role: {userRole}</div>
          <div>Selected Role: {newRole}</div>
          <div>Can Update: {(!newRole || newRole === userRole) ? 'No' : 'Yes'}</div>
        </div>

        {/* Test Firebase Button */}
        <Button 
          onClick={async () => {
            try {
              console.log('Testing Firebase write...');
              console.log('User UID:', user.uid);
              console.log('Firebase config:', {
                projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
                authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
                hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY
              });
              
              const userDocRef = doc(db, 'users', user.uid);
              console.log('Document reference created:', userDocRef.path);
              
              await updateDoc(userDocRef, {
                testField: new Date().toISOString(),
                lastTestUpdate: new Date()
              });
              
              console.log('Firebase test write successful');
              toast({
                title: "Firebase Test Success",
                description: "Firebase write operation works!",
              });
            } catch (error) {
              console.error('Firebase test failed - Full error:', error);
              console.error('Error code:', error.code);
              console.error('Error message:', error.message);
              
              let errorMsg = error.message;
              if (error.code === 'permission-denied') {
                errorMsg = 'Permission denied - Firestore security rules may need updating';
              } else if (error.code === 'not-found') {
                errorMsg = 'Document not found - User document may not exist';
              }
              
              toast({
                title: "Firebase Test Failed",
                description: `${error.code}: ${errorMsg}`,
                variant: "destructive",
              });
            }
          }}
          variant="outline"
          className="w-full mb-2"
        >
          Test Firebase Connection
        </Button>

        {/* Action Button */}
        <Button 
          onClick={handleRoleChange} 
          disabled={!newRole || newRole === userRole || loading}
          className="w-full"
        >
          {loading ? "Updating..." : "Update Role"}
        </Button>

        {/* Role Change Effects Notice */}
        {newRole && newRole !== userRole && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Changing your role will affect which features and pages you can access. 
              {newRole === 'contractor' && " You'll be able to access the contractor portal."}
              {newRole === 'homeowner' && " You'll be able to post projects and get estimates."}
              {newRole === 'both' && " You'll have access to all features."}
              {newRole === 'visitor' && " You'll have limited access to platform features."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}