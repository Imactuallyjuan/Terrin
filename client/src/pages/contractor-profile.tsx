import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  CheckCircle, 
  MessageSquare,
  DollarSign,
  Clock,
  Building,
  Users
} from "lucide-react";
import { Link } from "wouter";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Contractor } from "@/../../shared/schema";

interface Review {
  id: number;
  professionalId: number;
  clientName: string;
  rating: number;
  comment: string;
  projectType: string;
  completedAt: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  completedAt: string;
  photos?: string[];
  clientTestimonial?: string;
}

const quoteSchema = z.object({
  projectDescription: z.string().min(10, "Please provide a detailed project description"),
  timeline: z.string().min(1, "Timeline is required"),
  budget: z.string().min(1, "Budget range is required"),
  contactMethod: z.enum(["email", "phone"]),
  preferredStartDate: z.string().optional()
});

export default function ContractorProfile() {
  const [match, params] = useRoute("/professionals/:id");
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  
  const professionalId = params?.id ? parseInt(params.id) : null;

  const form = useForm({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      projectDescription: "",
      timeline: "",
      budget: "",
      contactMethod: "email" as const,
      preferredStartDate: ""
    }
  });

  // Fetch professional details
  const { data: professional, isLoading } = useQuery<Contractor>({
    queryKey: [`/api/professionals/${professionalId}`],
    enabled: !!professionalId
  });



  // Fetch professional reviews (using mock data for now since reviews API doesn't exist)
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/professionals/${professionalId}/reviews`],
    enabled: false // Disable until reviews API is implemented
  });

  // Fetch professional portfolio (using mock data for now since portfolio API doesn't exist)
  const { data: portfolio = [] } = useQuery<Project[]>({
    queryKey: [`/api/professionals/${professionalId}/portfolio`],
    enabled: false // Disable until portfolio API is implemented
  });

  // Submit quote request
  const quoteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof quoteSchema>) => {
      const response = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId,
          clientId: user?.uid,
          ...data
        })
      });
      if (!response.ok) throw new Error('Failed to send quote request');
      return response.json();
    },
    onSuccess: () => {
      setShowQuoteDialog(false);
      form.reset();
    }
  });

  // Create conversation/message mutation
  const messageMutation = useMutation({
    mutationFn: async () => {
      if (!professional || !user) {
        throw new Error('Missing professional or user information');
      }
      
      const token = await user.getIdToken();
      const conversationData = {
        participants: [user.uid, professional.userId],
        title: `Discussion with ${professional.businessName}`,
        projectId: null
      };
      
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(conversationData)
      });
      
      const data = await response.json();
      console.log('Created conversation:', data);
      return data;
    },
    onSuccess: async (data) => {
      console.log('onSuccess conversation:', data);
      if (professional && data?.id && typeof data.id === 'number') {
        // Invalidate conversations cache to ensure new conversation appears
        queryClient.removeQueries(['/api/conversations']);
        await queryClient.invalidateQueries(['/api/conversations']);
        
        toast({
          title: "Contact Initiated",
          description: `You can now message ${professional.businessName}`,
        });
        
        // Small delay to ensure cache invalidation completes
        setTimeout(() => {
          const url = `/messages?conversation=${data.id}`;
          console.log('Redirecting to:', url);
          setLocation(url);
        }, 100);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to Initiate Contact",
        description: error.message,
        variant: "destructive"
      });
      // Show success message
    }
  });

  if (!match || !professionalId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Contractor Not Found</h1>
          <Link href="/find-professionals">
            <Button>Browse Contractors</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !professional) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Professional Not Found</h1>
          <p className="text-gray-600 mb-6">The professional you're looking for doesn't exist or has been removed.</p>
          <Link href="/find-professionals">
            <Button>Browse Professionals</Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = parseFloat(professional.rating || '0');
  const totalReviews = professional.reviewCount || reviews.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/find-professionals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contractor Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="text-2xl">
                      {professional?.businessName?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {professional.businessName}
                        </h1>
                        <p className="text-xl text-blue-600 font-medium mb-2">
                          {professional.specialty}
                        </p>
                        <div className="flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{professional.location}</span>
                          </div>
                          {professional.yearsExperience && (
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              <span>{professional.yearsExperience} years experience</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rating and Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{totalReviews} reviews</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {professional.yearsExperience}
                        </div>
                        <p className="text-sm text-gray-600">Years Experience</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {professional.verified ? '✓' : '○'}
                        </div>
                        <p className="text-sm text-gray-600">{professional.verified ? 'Verified' : 'Unverified'}</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          ${professional.hourlyRate}
                        </div>
                        <p className="text-sm text-gray-600">Hourly Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {professional.businessName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-6">
                      {professional.description || "No description provided."}
                    </p>
                    
                    {professional.serviceArea && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Service Area</h4>
                        <Badge variant="outline">{professional.serviceArea}</Badge>
                      </div>
                    )}
                    
                    {professional.licenseNumber && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">License Information</h4>
                        <p className="text-gray-600">License #: {professional.licenseNumber}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Experience</h4>
                        <p className="text-gray-600">{professional.yearsExperience} years</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Hourly Rate</h4>
                        <p className="text-gray-600">${professional.hourlyRate}/hour</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="portfolio" className="space-y-6">
                {(() => {
                  // Generate sample portfolio projects based on contractor specialty
                  const getPortfolioBySpecialty = (specialty: string) => {
                    const portfolioMap: Record<string, any[]> = {
                      'Kitchen & Bath Renovation': [
                        { title: 'Modern Kitchen Remodel', description: 'Complete kitchen renovation with quartz countertops and custom cabinets', category: 'Kitchen', completedAt: '2024-03-15' },
                        { title: 'Master Bathroom Upgrade', description: 'Luxury bathroom renovation with walk-in shower and heated floors', category: 'Bathroom', completedAt: '2024-01-20' }
                      ],
                      'Roofing': [
                        { title: 'Residential Roof Replacement', description: 'Complete asphalt shingle roof replacement with new gutters', category: 'Roofing', completedAt: '2024-04-10' },
                        { title: 'Commercial Flat Roof Repair', description: 'EPDM membrane roof repair and waterproofing', category: 'Commercial', completedAt: '2024-02-28' }
                      ],
                      'Electrical': [
                        { title: 'Home Electrical Panel Upgrade', description: '200-amp electrical panel upgrade with new wiring', category: 'Electrical', completedAt: '2024-03-05' },
                        { title: 'Smart Home Installation', description: 'Complete smart home electrical system with automated lighting', category: 'Technology', completedAt: '2024-01-15' }
                      ],
                      'Plumbing': [
                        { title: 'Whole House Repiping', description: 'Complete copper to PEX repiping for 2-story home', category: 'Plumbing', completedAt: '2024-02-12' },
                        { title: 'Sewer Line Replacement', description: 'Trenchless sewer line replacement with modern PVC', category: 'Infrastructure', completedAt: '2024-03-22' }
                      ],
                      'HVAC': [
                        { title: 'Central Air Installation', description: 'High-efficiency HVAC system installation with smart thermostat', category: 'HVAC', completedAt: '2024-04-01' },
                        { title: 'Ductwork Replacement', description: 'Complete ductwork replacement for improved air quality', category: 'Air Quality', completedAt: '2024-01-30' }
                      ],
                      'General Contractor': [
                        { title: 'Home Addition Project', description: '500 sq ft family room addition with full permits', category: 'Addition', completedAt: '2024-03-10' },
                        { title: 'Basement Finishing', description: 'Complete basement renovation with bedroom and full bath', category: 'Renovation', completedAt: '2024-02-05' }
                      ]
                    };
                    
                    return portfolioMap[specialty] || portfolioMap['General Contractor'];
                  };
                  
                  const samplePortfolio = getPortfolioBySpecialty(professional.specialty);
                  
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {samplePortfolio.map((project, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <Badge variant="outline">{project.category}</Badge>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 mb-4">{project.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>Completed {new Date(project.completedAt).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })()}
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6">
                {(() => {
                  // Generate sample reviews based on contractor specialty
                  const getReviewsBySpecialty = (specialty: string) => {
                    const reviewsMap: Record<string, any[]> = {
                      'Kitchen & Bath Renovation': [
                        { clientName: 'Sarah M.', projectType: 'Kitchen Remodel', rating: 5, comment: 'Outstanding work on our kitchen renovation. Attention to detail was exceptional and they stayed on budget.', completedAt: '2024-03-10' },
                        { clientName: 'Mike R.', projectType: 'Bathroom Upgrade', rating: 5, comment: 'Professional team, excellent craftsmanship. Our new bathroom exceeded expectations.', completedAt: '2024-01-15' }
                      ],
                      'Roofing': [
                        { clientName: 'Jennifer L.', projectType: 'Roof Replacement', rating: 5, comment: 'Fast, efficient roof replacement. Great communication throughout the project.', completedAt: '2024-04-05' },
                        { clientName: 'David T.', projectType: 'Roof Repair', rating: 4, comment: 'Quality work at fair price. Fixed our leak issues completely.', completedAt: '2024-02-20' }
                      ],
                      'Electrical': [
                        { clientName: 'Lisa K.', projectType: 'Panel Upgrade', rating: 5, comment: 'Professional electrical work. Updated our entire panel safely and efficiently.', completedAt: '2024-03-01' },
                        { clientName: 'Tom B.', projectType: 'Smart Home Setup', rating: 5, comment: 'Amazing smart home installation. Everything works perfectly and they explained how to use it all.', completedAt: '2024-01-10' }
                      ],
                      'Plumbing': [
                        { clientName: 'Maria S.', projectType: 'Pipe Replacement', rating: 5, comment: 'Excellent plumbing work. Clean, professional, and solved our water pressure issues.', completedAt: '2024-02-08' },
                        { clientName: 'John P.', projectType: 'Sewer Line Fix', rating: 4, comment: 'Great service, fixed our sewer line problem quickly with minimal disruption.', completedAt: '2024-03-18' }
                      ],
                      'HVAC': [
                        { clientName: 'Amy H.', projectType: 'AC Installation', rating: 5, comment: 'Professional HVAC installation. Our home is now perfectly climate controlled.', completedAt: '2024-03-25' },
                        { clientName: 'Robert C.', projectType: 'Ductwork Repair', rating: 5, comment: 'Fixed our airflow issues completely. Very knowledgeable and fair pricing.', completedAt: '2024-01-25' }
                      ],
                      'General Contractor': [
                        { clientName: 'Kelly W.', projectType: 'Home Addition', rating: 5, comment: 'Fantastic addition to our home. Managed all permits and subcontractors professionally.', completedAt: '2024-03-05' },
                        { clientName: 'Steve G.', projectType: 'Basement Finish', rating: 4, comment: 'Great basement renovation. Quality work and stayed close to timeline.', completedAt: '2024-02-01' }
                      ]
                    };
                    
                    return reviewsMap[specialty] || reviewsMap['General Contractor'];
                  };
                  
                  const sampleReviews = getReviewsBySpecialty(professional.specialty);
                  
                  return (
                    <div className="space-y-4">
                      {sampleReviews.map((review, index) => (
                        <Card key={index}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-semibold">{review.clientName}</h4>
                                <p className="text-sm text-gray-600">{review.projectType}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.completedAt).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })()}
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Business Name</p>
                        <p className="text-gray-600">{professional.businessName}</p>
                      </div>
                      <div>
                        <p className="font-medium">Specialty</p>
                        <p className="text-gray-600">{professional.specialty}</p>
                      </div>
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-gray-600">{professional.location}</p>
                      </div>
                      <div>
                        <p className="font-medium">Service Area</p>
                        <p className="text-gray-600">{professional.serviceArea}</p>
                      </div>
                      <div>
                        <p className="font-medium">Years Experience</p>
                        <p className="text-gray-600">{professional.yearsExperience} years</p>
                      </div>
                      <div>
                        <p className="font-medium">Hourly Rate</p>
                        <p className="text-gray-600">${professional.hourlyRate}/hour</p>
                      </div>
                      {professional.phone && (
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-gray-600">{professional.phone}</p>
                        </div>
                      )}
                      {professional.email && (
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-gray-600">{professional.email}</p>
                        </div>
                      )}
                      {professional.website && (
                        <div>
                          <p className="font-medium">Website</p>
                          <p className="text-gray-600">{professional.website}</p>
                        </div>
                      )}
                      {professional.licenseNumber && (
                        <div className="md:col-span-2-2">
                          <p className="font-medium">License Number</p>
                          <p className="text-gray-600">{professional.licenseNumber}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Request Quote
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Request a Quote</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit((data) => quoteMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="projectDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Describe your project in detail..." />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="timeline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Timeline</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 2-3 weeks" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget Range</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., $5,000 - $10,000" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full" disabled={quoteMutation.isPending}>
                          {quoteMutation.isPending ? "Sending..." : "Send Quote Request"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => messageMutation.mutate()}
                  disabled={messageMutation.isPending || !user}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {messageMutation.isPending ? "Initiating Contact..." : "Send Message"}
                </Button>
                
              </CardContent>
            </Card>

            {/* Business Info */}
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {professional.licenseNumber && (
                  <div>
                    <p className="font-medium text-sm">License Number</p>
                    <p className="text-gray-600">{professional.licenseNumber}</p>
                  </div>
                )}
                
                <div>
                  <p className="font-medium text-sm">Verification Status</p>
                  <p className="text-gray-600">
                    {professional.verified ? 'Verified Professional' : 'Unverified'}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-sm">Member Since</p>
                  <p className="text-gray-600">
                    {professional.createdAt ? new Date(professional.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}