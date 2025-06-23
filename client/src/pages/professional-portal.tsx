import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building,
  User,
  Plus,
  Edit,
  Phone,
  Mail,
  Globe,
  MapPin,
  Award,
  DollarSign
} from "lucide-react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";

export default function ProfessionalPortal() {
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    specialties: [] as string[],
    yearsExperience: '',
    serviceArea: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    licenseNumber: '',
    hourlyRate: '',
    location: ''
  });

  // Fetch professional profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/professionals/me', user?.uid],
    enabled: !!user?.uid
  });

  // Create/Update professional profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (profile) {
        return await apiRequest('PATCH', `/api/contractors/${profile.id}`, data);
      } else {
        return await apiRequest('POST', '/api/contractors', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/professionals/me', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['/api/professionals'] });
      setEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your professional profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const specialtyOptions = [
    'General Contracting',
    'Electrical',
    'Plumbing',
    'HVAC',
    'Roofing',
    'Flooring',
    'Painting',
    'Carpentry',
    'Masonry',
    'Landscaping',
    'Kitchen Remodeling',
    'Bathroom Remodeling',
    'Home Additions',
    'Concrete Work',
    'Fencing',
    'Insulation',
    'Drywall',
    'Windows & Doors',
    'Demolition',
    'Handyman Services'
  ];

  useEffect(() => {
    if (profile) {
      setFormData({
        businessName: profile.businessName || '',
        specialties: profile.specialty ? [profile.specialty] : [],
        yearsExperience: profile.yearsExperience?.toString() || '',
        serviceArea: profile.serviceArea || '',
        description: profile.description || '',
        phone: profile.phone || '',
        email: profile.email || user?.email || '',
        website: profile.website || '',
        licenseNumber: profile.licenseNumber || '',
        hourlyRate: profile.hourlyRate?.toString() || '',
        location: profile.location || ''
      });
    }
  }, [profile, user]);

  function handleSpecialtyChange(specialty: string) {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  }

  function handleSaveProfile() {
    const profileData = {
      businessName: formData.businessName,
      specialty: formData.specialties[0] || 'General Contractor',
      description: formData.description,
      hourlyRate: parseFloat(formData.hourlyRate) || 0,
      location: formData.location,
      yearsExperience: parseInt(formData.yearsExperience) || 0,
      serviceArea: formData.serviceArea,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      licenseNumber: formData.licenseNumber
    };

    updateProfileMutation.mutate(profileData);
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // ProjectDiscovery component
  function ProjectDiscovery() {
    const { data: availableProjects = [], isLoading: projectsLoading } = useQuery({
      queryKey: ['/api/projects'],
      enabled: !!user?.uid
    });

    if (projectsLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {availableProjects.length === 0 ? (
          <div className="text-center py-8">
            <Building className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Projects Available</h3>
            <p className="text-slate-600">Check back later for new project opportunities.</p>
          </div>
        ) : (
          availableProjects.map((project: any) => (
            <Card key={project.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{project.title}</h3>
                    <p className="text-slate-600 mb-2">{project.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.location}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {project.budgetRange}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline">{project.projectType}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    Posted {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <Button size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  // AnalyticsDashboard component
  function AnalyticsDashboard() {
    const stats = [
      { label: "Profile Views", value: "127", change: "+12%" },
      { label: "Quote Requests", value: "8", change: "+3" },
      { label: "Active Projects", value: "3", change: "0" },
      { label: "Completion Rate", value: "95%", change: "+2%" }
    ];

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className="text-sm text-green-600">{stat.change}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">New quote request received</p>
                  <p className="text-sm text-slate-600">Kitchen renovation project - $25,000 budget</p>
                </div>
                <span className="text-sm text-slate-500">2 hours ago</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Project completed</p>
                  <p className="text-sm text-slate-600">Bathroom remodel project finished successfully</p>
                </div>
                <span className="text-sm text-slate-500">1 day ago</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Profile updated</p>
                  <p className="text-sm text-slate-600">Added new portfolio photos and certifications</p>
                </div>
                <span className="text-sm text-slate-500">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
                <div className="text-sm text-slate-600">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">4.8</div>
                <div className="text-sm text-slate-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">$12,500</div>
                <div className="text-sm text-slate-600">Total Earnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Professional Portal</h1>
          <p className="mt-2 text-lg text-slate-600">
            Manage your professional profile and find new projects
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="projects">Available Projects</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="space-y-6">
              {!profile && !editingProfile ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Create Your Professional Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">
                      Set up your professional profile to start receiving project opportunities
                      and connect with homeowners looking for your services.
                    </p>
                    <Button onClick={() => setEditingProfile(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Sidebar */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {profile?.businessName || 'Professional Profile'}
                          {!editingProfile && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingProfile(true)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {profile?.specialty && (
                          <div>
                            <h4 className="font-medium text-sm text-slate-700 mb-2">Specialty</h4>
                            <Badge variant="secondary" className="text-xs">
                              {profile.specialty}
                            </Badge>
                          </div>
                        )}
                        
                        {profile?.yearsExperience && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Award className="mr-2 h-4 w-4" />
                            {profile.yearsExperience} years experience
                          </div>
                        )}
                        
                        {profile?.serviceArea && (
                          <div className="flex items-center text-sm text-slate-600">
                            <MapPin className="mr-2 h-4 w-4" />
                            {profile.serviceArea}
                          </div>
                        )}
                        
                        {profile?.phone && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Phone className="mr-2 h-4 w-4" />
                            {profile.phone}
                          </div>
                        )}
                        
                        {profile?.email && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Mail className="mr-2 h-4 w-4" />
                            {profile.email}
                          </div>
                        )}
                        
                        {profile?.website && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Globe className="mr-2 h-4 w-4" />
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {profile.website}
                            </a>
                          </div>
                        )}
                        
                        {profile?.hourlyRate && (
                          <div className="flex items-center text-sm text-slate-600">
                            <DollarSign className="mr-2 h-4 w-4" />
                            ${profile.hourlyRate}/hour
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Profile Form */}
                  <div className="lg:col-span-2">
                    {editingProfile ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Edit Professional Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="businessName">Business Name *</Label>
                              <Input
                                value={formData.businessName}
                                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                placeholder="Your business name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="yearsExperience">Years of Experience</Label>
                              <Input
                                type="number"
                                value={formData.yearsExperience}
                                onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
                                placeholder="5"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Specialties * (Select all that apply)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                              {specialtyOptions.map((specialty) => (
                                <label key={specialty} className="flex items-center space-x-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={formData.specialties.includes(specialty)}
                                    onChange={() => handleSpecialtyChange(specialty)}
                                    className="rounded"
                                  />
                                  <span>{specialty}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="location">Location</Label>
                              <Input
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                placeholder="City, State"
                              />
                            </div>
                            <div>
                              <Label htmlFor="serviceArea">Service Area</Label>
                              <Input
                                value={formData.serviceArea}
                                onChange={(e) => setFormData({...formData, serviceArea: e.target.value})}
                                placeholder="Cities and regions you serve"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="description">Business Description</Label>
                            <Textarea
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              placeholder="Tell potential clients about your business, experience, and what sets you apart..."
                              rows={4}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="(555) 123-4567"
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="your@email.com"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="website">Website</Label>
                              <Input
                                value={formData.website}
                                onChange={(e) => setFormData({...formData, website: e.target.value})}
                                placeholder="https://yourwebsite.com"
                              />
                            </div>
                            <div>
                              <Label htmlFor="hourlyRate">Hourly Rate</Label>
                              <Input
                                type="number"
                                value={formData.hourlyRate}
                                onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                                placeholder="75"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="licenseNumber">License Number</Label>
                            <Input
                              value={formData.licenseNumber}
                              onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                              placeholder="License #123456"
                            />
                          </div>

                          <div className="flex space-x-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingProfile(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSaveProfile}
                              disabled={updateProfileMutation.isPending}
                            >
                              {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle>Professional Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center py-8">
                            <Building className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                              {profile?.businessName || 'Professional Profile'}
                            </h3>
                            <p className="text-slate-600 mb-4">
                              {profile?.description || 'Update your profile to showcase your expertise'}
                            </p>
                            <Button onClick={() => setEditingProfile(true)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Projects</CardTitle>
                  <p className="text-sm text-slate-600">
                    Browse projects that match your expertise and bid on opportunities
                  </p>
                </CardHeader>
                <CardContent>
                  <ProjectDiscovery />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <AnalyticsDashboard />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}