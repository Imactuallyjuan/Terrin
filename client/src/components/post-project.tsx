import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Calculator, Send } from "lucide-react";
import { z } from "zod";

const formSchema = insertProjectSchema.extend({
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(10, "Please provide a detailed description (at least 10 characters)"),
  location: z.string().min(1, "Location is required"),
});

export default function PostProject() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [estimateMode, setEstimateMode] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      projectType: "",
      budgetRange: "",
      timeline: "",
      location: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      console.log('Creating project with data:', data);
      const response = await apiRequest("POST", "/api/projects", data);
      const result = await response.json();
      console.log('Project creation response:', result);
      return result;
    },
    onSuccess: (project) => {
      toast({
        title: "Success!",
        description: "Your project has been posted successfully. Redirecting to your projects...",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      // Redirect to projects page after successful posting
      setTimeout(() => {
        window.location.href = '/projects';
      }, 1500);
    },
    onError: (error: any) => {
      console.error('Project creation error:', error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('401')) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to post a project. Redirecting...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to post project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getEstimateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      console.log('Starting estimate mutation with data:', data);
      
      // Trigger loading state
      window.dispatchEvent(new CustomEvent('estimateStarted'));
      
      try {
        const response = await apiRequest("POST", "/api/estimate", { projectData: data });
        const result = await response.json();
        console.log('Estimate response:', result);
        return result;
      } catch (error) {
        console.error('Estimate API error:', error);
        throw error;
      }
    },
    onSuccess: (estimate) => {
      console.log('Estimate generated successfully:', estimate);
      
      toast({
        title: "Estimate Generated!",
        description: "Your AI-powered cost estimate is ready.",
      });
      
      // Scroll to cost estimator section
      setTimeout(() => {
        const element = document.getElementById('cost-estimator');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
      // Store estimate data for display
      window.dispatchEvent(new CustomEvent('estimateGenerated', { detail: estimate }));
    },
    onError: (error: any) => {
      console.error('Estimate mutation error:', error);
      
      // Stop loading state on error
      window.dispatchEvent(new CustomEvent('estimateGenerated', { detail: null }));
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('401')) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to get an estimate. Redirecting...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to generate estimate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log('Form submitted with data:', data);
    console.log('Estimate mode:', estimateMode);
    console.log('Is authenticated:', isAuthenticated);
    console.log('Form errors:', form.formState.errors);
    
    // Skip auth check here - let the API handle authentication
    // If not authenticated, the API will return 401 and we'll handle it in the mutation
    
    if (estimateMode) {
      console.log('Triggering estimate mutation...');
      getEstimateMutation.mutate(data);
    } else {
      console.log('Triggering project creation...');
      console.log('Project mutation pending:', createProjectMutation.isPending);
      createProjectMutation.mutate(data);
    }
  };

  const handleEstimateClick = (e: React.MouseEvent) => {
    console.log('Get Estimate button clicked');
    setEstimateMode(true);
    
    // Check if form is valid first
    const isValid = form.trigger();
    console.log('Form validation result:', isValid);
    
    if (!form.formState.isValid) {
      console.log('Form validation errors:', form.formState.errors);
      toast({
        title: "Please complete all required fields",
        description: "Make sure to fill in all the project details before getting an estimate.",
        variant: "destructive",
      });
      return;
    }
  };

  const handleProjectClick = (e: React.MouseEvent) => {
    console.log('Post Project button clicked');
    setEstimateMode(false);
  };

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
                            <SelectItem value="Bathroom Remodel">Bathroom Remodel</SelectItem>
                            <SelectItem value="Roofing">Roofing</SelectItem>
                            <SelectItem value="Flooring">Flooring</SelectItem>
                            <SelectItem value="Electrical Work">Electrical Work</SelectItem>
                            <SelectItem value="Plumbing">Plumbing</SelectItem>
                            <SelectItem value="Addition/Extension">Addition/Extension</SelectItem>
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
                          className="min-h-[100px]"
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
                            <SelectItem value="$50,000+">$50,000+</SelectItem>
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
                        <FormLabel>Preferred Timeline</FormLabel>
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
                            <SelectItem value="Flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

                <div className="flex justify-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 flex items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Get Estimate button clicked');
                      setEstimateMode(true);
                      // Trigger form submission for estimate
                      form.handleSubmit(onSubmit)();
                    }}
                    disabled={getEstimateMutation.isPending}
                  >
                    {getEstimateMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                    ) : (
                      <Calculator className="mr-2 h-4 w-4" />
                    )}
                    Get AI Estimate
                  </Button>
                  
                  <Button
                    type="button"
                    className="bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Post Project button clicked');
                      setEstimateMode(false);
                      // Trigger form submission for project
                      form.handleSubmit(onSubmit)();
                    }}
                    disabled={createProjectMutation.isPending}
                  >
                    {createProjectMutation.isPending ? (
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
