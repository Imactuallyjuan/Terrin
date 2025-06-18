import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { Calculator, Send } from "lucide-react";
import { z } from "zod";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const formSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(10, "Please provide a detailed description (at least 10 characters)"),
  location: z.string().min(1, "Location is required"),
  projectType: z.string().min(1, "Project type is required"),
  budgetRange: z.string().min(1, "Budget range is required"),
  timeline: z.string().min(1, "Timeline is required"),
  squareFootage: z.string().optional(),
});

export default function PostProjectFirebase() {
  const { toast } = useToast();
  const { isAuthenticated, user, userRole } = useFirebaseAuth();
  const [estimateMode, setEstimateMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      projectType: "",
      budgetRange: "",
      timeline: "",
      location: "",
      squareFootage: "",
    },
  });

  const handlePostProject = async (data) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to post a project.",
        variant: "destructive",
      });
      return;
    }

    if (userRole === 'contractor') {
      toast({
        title: "Access Restricted",
        description: "Contractors cannot post projects. Switch to homeowner mode or create a new account.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Posting project with data:', data);
      
      const token = await user.getIdToken(true);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const project = await response.json();
      console.log('Project created:', project);

      toast({
        title: "Project Posted Successfully!",
        description: "Your project has been posted. Redirecting to your projects...",
      });

      form.reset();
      
      // Redirect to projects page after successful posting
      setTimeout(() => {
        window.location.href = '/projects';
      }, 1500);
      
    } catch (error) {
      console.error('Error posting project:', error);
      toast({
        title: "Error",
        description: "Failed to post project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetEstimate = async (data) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to get an estimate.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    window.dispatchEvent(new CustomEvent('estimateStarted'));

    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectData: data }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate estimate');
      }

      const estimate = await response.json();
      
      toast({
        title: "Estimate Generated!",
        description: "Your AI-powered cost estimate is ready.",
      });
      
      setTimeout(() => {
        const element = document.getElementById('cost-estimator');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
      window.dispatchEvent(new CustomEvent('estimateGenerated', { detail: estimate }));
    } catch (error) {
      console.error('Error generating estimate:', error);
      window.dispatchEvent(new CustomEvent('estimateGenerated', { detail: null }));
      
      toast({
        title: "Error",
        description: "Failed to generate estimate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data) => {
    if (estimateMode) {
      handleGetEstimate(data);
    } else {
      handlePostProject(data);
    }
  };

  // Show auth prompt for non-authenticated users
  if (!isAuthenticated) {
    return (
      <section className="py-16 bg-slate-50" id="post-project">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">
            Post Your Construction Project
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Sign in to post projects and get AI-powered cost estimates
          </p>
          <a href="/auth">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Sign In to Get Started
            </Button>
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-slate-50" id="post-project">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Post Your Construction Project
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Get started by telling us about your project
          </p>
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Kitchen Renovation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Kitchen Renovation">Kitchen Renovation</SelectItem>
                            <SelectItem value="Bathroom Renovation">Bathroom Renovation</SelectItem>
                            <SelectItem value="Home Addition">Home Addition</SelectItem>
                            <SelectItem value="Roofing">Roofing</SelectItem>
                            <SelectItem value="Flooring">Flooring</SelectItem>
                            <SelectItem value="Painting">Painting</SelectItem>
                            <SelectItem value="Electrical">Electrical</SelectItem>
                            <SelectItem value="Plumbing">Plumbing</SelectItem>
                            <SelectItem value="HVAC">HVAC</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your project in detail..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="budgetRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Range</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select budget range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Under $5,000">Under $5,000</SelectItem>
                            <SelectItem value="$5,000 - $15,000">$5,000 - $15,000</SelectItem>
                            <SelectItem value="$15,000 - $30,000">$15,000 - $30,000</SelectItem>
                            <SelectItem value="$30,000 - $50,000">$30,000 - $50,000</SelectItem>
                            <SelectItem value="$50,000 - $100,000">$50,000 - $100,000</SelectItem>
                            <SelectItem value="Over $100,000">Over $100,000</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeline</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ASAP">ASAP</SelectItem>
                            <SelectItem value="Within 1 month">Within 1 month</SelectItem>
                            <SelectItem value="1-3 months">1-3 months</SelectItem>
                            <SelectItem value="3-6 months">3-6 months</SelectItem>
                            <SelectItem value="6+ months">6+ months</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="squareFootage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Square Footage (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1200 sq ft" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-center space-x-4">
                  <Button
                    type="submit"
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 flex items-center"
                    onClick={() => setEstimateMode(true)}
                    disabled={loading}
                  >
                    {loading && estimateMode ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                    ) : (
                      <Calculator className="mr-2 h-4 w-4" />
                    )}
                    Get AI Estimate
                  </Button>
                  
                  <Button
                    type="submit"
                    className="bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                    onClick={() => setEstimateMode(false)}
                    disabled={loading}
                  >
                    {loading && !estimateMode ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Post Project
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}