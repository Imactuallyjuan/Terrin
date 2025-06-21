import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  Star, 
  User, 
  Briefcase,
  Plus,
  Edit,
  Camera,
  Phone,
  Mail,
  Globe,
  Award,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import { Link } from "wouter";

export default function ProfessionalPortal() {
  const { user } = useAuth();
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
    insurance: false,
    bondedAndInsured: false
  });

  // Fetch professional profile
  const { data: profileArray, isLoading: profileLoading } = useQuery({
    queryKey: [`/api/contractors/user/${user?.id}`],
    enabled: !!user?.id
  });

  // Extract first profile from array (API returns array)
  const profile = Array.isArray(profileArray) ? profileArray[0] : profileArray;

  // Check if current user is the platform owner (can edit Terrin profile)
  const isPlatformOwner = user?.id === 'IE5CjY6AxYZAHjfFB6OLLCnn5dF2' || user?.email === 'juan@terrinplatform.com';
  
  // Check if editing the Terrin Construction Solutions profile
  const isTerrinProfile = profile?.businessName === 'Terrin Construction Solutions' || profile?.id === 7;

  // Debug logging
  console.log('Professional Portal Debug:');
  console.log('- User ID:', user?.id);
  console.log('- User Email:', user?.email);
  console.log('- Is Platform Owner:', isPlatformOwner);
  console.log('- Profile ID:', profile?.id);
  console.log('- Profile Business Name:', profile?.businessName);
  console.log('- Is Terrin Profile:', isTerrinProfile);
  console.log('- Profile Array:', profile);

  // Fetch available projects
  const { data: availableProjects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects', 'available'],
    queryFn: async () => {
      const response = await fetch('/api/projects?status=open');
      return response.json();
    }
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
      queryClient.invalidateQueries({ queryKey: [`/api/contractors/user/${user?.id}`] });
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
        insurance: false,
        bondedAndInsured: false
      });
    }
  }, [profile, user]);

  const handleProfileSave = () => {
    if (!formData.businessName || !formData.specialties.length) {
      toast({
        title: "Missing Information",
        description: "Please fill in business name and at least one specialty.",
        variant: "destructive",
      });
      return;
    }

    // Prevent non-platform owners from editing Terrin profile
    if (isTerrinProfile && !isPlatformOwner) {
      toast({
        title: "Access Denied",
        description: "Only the platform owner can edit the Terrin Construction Solutions profile.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      businessName: formData.businessName,
      specialty: formData.specialties[0] || '', // Database expects single specialty
      yearsExperience: parseInt(formData.yearsExperience) || 0,
      serviceArea: formData.serviceArea,
      description: formData.description,
      licenseNumber: formData.licenseNumber
    });
  };

  const handleSpecialtyChange = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
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
                  {/* Profile Overview */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{profile?.businessName || 'Your Business'}</span>
                          {!editingProfile && (
                            isTerrinProfile ? (
                              isPlatformOwner ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingProfile(true)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Platform Owner Profile
                                </Badge>
                              )
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingProfile(true)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {profile?.specialties && profile.specialties.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-slate-700 mb-2">Specialties</h4>
                            <div className="flex flex-wrap gap-1">
                              {profile.specialties.map((specialty: string) => (
                                <Badge key={specialty} variant="secondary" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
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

                          <div>
                            <Label htmlFor="serviceArea">Service Area</Label>
                            <Input
                              value={formData.serviceArea}
                              onChange={(e) => setFormData({...formData, serviceArea: e.target.value})}
                              placeholder="Cities and regions you serve"
                            />
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
                              <Label htmlFor="licenseNumber">License Number</Label>
                              <Input
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                                placeholder="License #123456"
                              />
                            </div>
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
            <Card>
              <CardHeader>
                <CardTitle>Available Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Project discovery feature coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Analytics feature coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );

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
}
                            )}
                          </div>
                        </div>
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

                          <div>
                            <Label htmlFor="serviceArea">Service Area</Label>
                            <Input
                              value={formData.serviceArea}
                              onChange={(e) => setFormData({...formData, serviceArea: e.target.value})}
                              placeholder="Cities and regions you serve"
                            />
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
                              <Label htmlFor="licenseNumber">License Number</Label>
                              <Input
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                                placeholder="Optional license number"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.insurance}
                                onChange={(e) => setFormData({...formData, insurance: e.target.checked})}
                                className="rounded"
                              />
                              <span>I carry liability insurance</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.bondedAndInsured}
                                onChange={(e) => setFormData({...formData, bondedAndInsured: e.target.checked})}
                                className="rounded"
                              />
                              <span>I am bonded and insured</span>
                            </label>
                          </div>

                          <div className="flex space-x-4">
                            <Button 
                              onClick={handleProfileSave}
                              disabled={updateProfileMutation.isPending}
                            >
                              {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setEditingProfile(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : profile?.description && (
                      <Card>
                        <CardHeader>
                          <CardTitle>About Your Business</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-700">{profile.description}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Available Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : availableProjects.length > 0 ? (
                  <div className="space-y-4">
                    {availableProjects.map((project: any) => (
                      <div key={project.id} className="border rounded-lg p-4 hover:bg-slate-50">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <Badge variant="outline">{project.projectType}</Badge>
                        </div>
                        <p className="text-slate-600 mb-3">{project.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {project.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="mr-1 h-3 w-3" />
                            {project.budgetRange}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {project.timeline}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/projects/${project.id}`}>
                            <Button size="sm">View Details</Button>
                          </Link>
                          <Button variant="outline" size="sm">
                            Submit Quote
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No available projects at the moment</p>
                    <p className="text-sm text-slate-500">Check back soon for new opportunities</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-slate-500">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Project Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-slate-500">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">95%</div>
                  <p className="text-xs text-slate-500">Within 24 hours</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}