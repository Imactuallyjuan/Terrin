import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Mail, 
  Phone, 
  MapPin,
  Building,
  Star,
  CreditCard,
  Download,
  Trash2,
  Save,
  ArrowLeft,
  UserCheck,
  Building2,
  Users,
  Eye,
  Settings as SettingsIcon
} from "lucide-react";
import { Link } from "wouter";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bio: ""
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    smsAlerts: false,
    pushNotifications: true,
    marketingEmails: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMessages: true
  });

  // Fetch user profile for role information
  const { data: userProfile } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: !!user,
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (role) => {
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      if (!response.ok) {
        throw new Error('Failed to update role');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Role updated",
        description: "Your role has been updated successfully.",
      });
    }
  });

  const handleRoleChange = (role) => {
    updateRoleMutation.mutate(role);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'homeowner': return <UserCheck className="h-4 w-4" />;
      case 'contractor': return <Building2 className="h-4 w-4" />;
      case 'both': return <Users className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'homeowner': return 'Homeowner';
      case 'contractor': return 'Professional';
      case 'both': return 'Both';
      default: return 'Visitor';
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'homeowner': return 'Post projects, get estimates, hire professionals';
      case 'contractor': return 'Find projects, submit quotes, receive payments';
      case 'both': return 'Full access to all platform features';
      default: return 'Browse projects and professionals';
    }
  };

  // Load user profile data
  useEffect(() => {
    if (user?.email) {
      setProfileData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      // Store in localStorage for now since we don't have a dedicated user profile API
      localStorage.setItem('userProfile', JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Save notification preferences
  const saveNotificationsMutation = useMutation({
    mutationFn: async (data) => {
      localStorage.setItem('notificationPreferences', JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    }
  });

  // Save privacy settings
  const savePrivacyMutation = useMutation({
    mutationFn: async (data) => {
      localStorage.setItem('privacySettings', JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Privacy Settings Updated", 
        description: "Your privacy settings have been saved.",
      });
    }
  });

  // Load saved settings on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedNotifications = localStorage.getItem('notificationPreferences');
    const savedPrivacy = localStorage.getItem('privacySettings');

    if (savedProfile) {
      setProfileData({ ...profileData, ...JSON.parse(savedProfile) });
    }
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    if (savedPrivacy) {
      setPrivacy(JSON.parse(savedPrivacy));
    }
  }, []);

  const handleSaveProfile = () => {
    saveProfileMutation.mutate(profileData);
  };

  const handleSaveNotifications = () => {
    saveNotificationsMutation.mutate(notifications);
  };

  const handleSavePrivacy = () => {
    savePrivacyMutation.mutate(privacy);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Account Deletion",
        description: "Contact support to delete your account permanently.",
        variant: "destructive"
      });
    }
  };

  const handleExportData = () => {
    // Create a data export
    const exportData = {
      profile: profileData,
      notifications: notifications,
      privacy: privacy,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `terrin-data-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Data Exported",
      description: "Your data has been downloaded successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and privacy settings</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="role">Account Type</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Role Selection */}
          <TabsContent value="role">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Account Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Current Role
                  </label>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="flex items-center gap-2">
                      {getRoleIcon(userProfile?.role || 'visitor')}
                      {getRoleLabel(userProfile?.role || 'visitor')}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {getRoleDescription(userProfile?.role || 'visitor')}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Change Role
                  </label>
                  <Select
                    value={userProfile?.role || 'visitor'}
                    onValueChange={handleRoleChange}
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visitor">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <div>
                            <p className="font-medium">Visitor</p>
                            <p className="text-xs text-gray-500">Browse projects and professionals</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="homeowner">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          <div>
                            <p className="font-medium">Homeowner</p>
                            <p className="text-xs text-gray-500">Post projects, get estimates, hire professionals</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="contractor">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <div>
                            <p className="font-medium">Professional</p>
                            <p className="text-xs text-gray-500">Find projects, submit quotes, receive payments</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="both">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <div>
                            <p className="font-medium">Both</p>
                            <p className="text-xs text-gray-500">Full access to all platform features</p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {updateRoleMutation.isPending && (
                    <p className="text-sm text-blue-600 mt-2">Updating role...</p>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your role determines which features and pages you can access. 
                    You can change this anytime in settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profileData.state}
                      onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={profileData.zipCode}
                      onChange={(e) => setProfileData({...profileData, zipCode: e.target.value})}
                      placeholder="12345"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  className="w-full md:w-auto"
                  disabled={saveProfileMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saveProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Updates</Label>
                      <p className="text-sm text-gray-600">Receive updates about your projects via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailUpdates: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Alerts</Label>
                      <p className="text-sm text-gray-600">Get urgent notifications via text message</p>
                    </div>
                    <Switch
                      checked={notifications.smsAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, smsAlerts: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications in your browser</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketing Emails</Label>
                      <p className="text-sm text-gray-600">Receive updates about new features and tips</p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => setNotifications({...notifications, marketingEmails: checked})}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveNotifications} 
                  className="w-full md:w-auto"
                  disabled={saveNotificationsMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saveNotificationsMutation.isPending ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base">Profile Visibility</Label>
                    <Select
                      value={privacy.profileVisibility}
                      onValueChange={(value) => setPrivacy({...privacy, profileVisibility: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Visible to everyone</SelectItem>
                        <SelectItem value="limited">Limited - Visible to professionals only</SelectItem>
                        <SelectItem value="private">Private - Hidden from searches</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Show Email Address</Label>
                      <p className="text-sm text-gray-600">Display your email on your public profile</p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) => setPrivacy({...privacy, showEmail: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Show Phone Number</Label>
                      <p className="text-sm text-gray-600">Display your phone number on your public profile</p>
                    </div>
                    <Switch
                      checked={privacy.showPhone}
                      onCheckedChange={(checked) => setPrivacy({...privacy, showPhone: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Allow Messages</Label>
                      <p className="text-sm text-gray-600">Let professionals send you direct messages</p>
                    </div>
                    <Switch
                      checked={privacy.allowMessages}
                      onCheckedChange={(checked) => setPrivacy({...privacy, allowMessages: checked})}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSavePrivacy} 
                  className="w-full md:w-auto"
                  disabled={savePrivacyMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {savePrivacyMutation.isPending ? 'Saving...' : 'Save Privacy Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <div className="space-y-6">
              {/* Data Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Data Export
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Download a copy of your data including projects, messages, and profile information.
                  </p>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export My Data
                  </Button>
                </CardContent>
              </Card>

              {/* Account Deletion */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Trash2 className="h-5 w-5" />
                    Delete Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}