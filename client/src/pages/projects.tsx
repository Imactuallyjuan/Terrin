import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, DollarSign, MapPin, Clock, Trash2, Edit, Eye } from "lucide-react";
import { Link } from "wouter";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import EnhancedProjectView from "@/components/enhanced-project-view";

export default function Projects() {
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  const { data: projects = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    enabled: !!user,
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      await apiRequest('DELETE', `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project Deleted",
        description: "The project has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'planning': return 'secondary';
      case 'active': return 'default';
      case 'in_progress': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'completed': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  // Show enhanced project view when a project is selected
  if (selectedProject) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => setSelectedProject(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <EnhancedProjectView project={selectedProject} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
              <p className="mt-2 text-slate-600">
                Manage all your construction projects in one place
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </Badge>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  New Project
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <DollarSign className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-slate-600 mb-6">
                Create your first construction project to get started
              </p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Create Your First Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {projects.map((project: any) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {project.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`capitalize ${getStatusColor(project.status)}`}
                        variant="outline"
                      >
                        {project.status?.replace('_', ' ')}
                      </Badge>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setSelectedProject(project)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProjectMutation.mutate(project.id)}
                        disabled={deleteProjectMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Project Details */}
                    <div className="lg:col-span-2">
                      <p className="text-slate-600 mb-4">{project.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Project Type:</span>
                          <p className="font-medium">{project.projectType}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Budget Range:</span>
                          <p className="font-medium">{project.budgetRange}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Timeline:</span>
                          <p className="font-medium">{project.timeline}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Priority:</span>
                          <p className="font-medium capitalize">{project.priority}</p>
                        </div>
                      </div>

                      {project.squareFootage && (
                        <div className="mt-4 text-sm">
                          <span className="text-slate-500">Square Footage:</span>
                          <p className="font-medium">{project.squareFootage} sq ft</p>
                        </div>
                      )}

                      {project.completionPercentage > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-medium">{project.completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${project.completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Created {formatDate(project.createdAt)}
                      </div>
                      
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {project.location}
                      </div>

                      {project.startDate && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Clock className="h-4 w-4 mr-2" />
                          Started {formatDate(project.startDate)}
                        </div>
                      )}

                      {project.actualCost && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-sm text-green-600 font-medium">
                            Actual Cost: ${project.actualCost}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}