import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
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
import { queryClient } from "@/lib/queryClient";

interface Contractor {
  id: number;
  businessName: string;
  specialty: string;
  description?: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  yearsExperience?: number;
  licenseNumber?: string;
  insuranceExpiry?: string;
  rating?: number;
  reviewCount?: number;
  completedProjects?: number;
  responseTime?: string;
  hourlyRate?: string;
  serviceAreas?: string[];
  certifications?: string[];
  profilePhoto?: string;
  createdAt: string;
}

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
  const [match, params] = useRoute("/professional/:id");
  const { user } = useFirebaseAuth();
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
    queryKey: ['/api/professionals', professionalId],
    enabled: !!professionalId
  });

  // Fetch professional reviews
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['/api/professionals', professionalId, 'reviews'],
    enabled: !!professionalId
  });

  // Fetch professional portfolio
  const { data: portfolio = [] } = useQuery<Project[]>({
    queryKey: ['/api/professionals', professionalId, 'portfolio'],
    enabled: !!professionalId
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

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Contractor Not Found</h1>
          <p className="text-gray-600 mb-6">The professional you're looking for doesn't exist or has been removed.</p>
          <Link href="/find-professionals">
            <Button>Browse Contractors</Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = professional.rating || 0;
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
                    <AvatarImage src={professional.profilePhoto} />
                    <AvatarFallback className="text-2xl">
                      {professional.businessName.charAt(0)}
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
                              <span>{professional.yearsExperience}+ years experience</span>
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
                      
                      {professional.completedProjects && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {professional.completedProjects}+
                          </div>
                          <p className="text-sm text-gray-600">Projects</p>
                        </div>
                      )}
                      
                      {professional.responseTime && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {professional.responseTime}
                          </div>
                          <p className="text-sm text-gray-600">Response</p>
                        </div>
                      )}
                      
                      {professional.hourlyRate && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {professional.hourlyRate}
                          </div>
                          <p className="text-sm text-gray-600">Hourly Rate</p>
                        </div>
                      )}
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
                    
                    {professional.serviceAreas && professional.serviceAreas.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Service Areas</h4>
                        <div className="flex flex-wrap gap-2">
                          {professional.serviceAreas.map((area, index) => (
                            <Badge key={index} variant="outline">{area}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {professional.certifications && professional.certifications.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {professional.certifications.map((cert, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800">{cert}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="portfolio" className="space-y-6">
                {portfolio.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-600">No portfolio items available</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {portfolio.map((project) => (
                      <Card key={project.id}>
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
                )}
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6">
                {reviews.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-600">No reviews yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
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
                )}
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {professional.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-gray-600">{professional.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {professional.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-gray-600">{professional.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {professional.website && (
                      <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Website</p>
                          <a href={professional.website} className="text-blue-600 hover:underline">
                            {professional.website}
                          </a>
                        </div>
                      </div>
                    )}
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
                
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                
                {professional.phone && (
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                )}
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
                
                {professional.insuranceExpiry && (
                  <div>
                    <p className="font-medium text-sm">Insurance Valid Until</p>
                    <p className="text-gray-600">
                      {new Date(professional.insuranceExpiry).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="font-medium text-sm">Member Since</p>
                  <p className="text-gray-600">
                    {new Date(professional.createdAt).toLocaleDateString()}
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