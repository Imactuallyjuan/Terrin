import { useEffect, useState } from "react";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, DollarSign, Clock, Plus, User, Building, Settings, Calculator, MessageCircle, Activity, TrendingUp, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ProjectTimeline from "@/components/ProjectTimeline";

export default function Dashboard() {
  const { user, userRole, loading, isAuthenticated } = useFirebaseAuth();
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch projects using React Query
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!user
  });

  // Fetch estimates using React Query
  const { data: estimates = [], isLoading: estimatesLoading } = useQuery({
    queryKey: ['/api/estimates'],
    enabled: !!user
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/auth";
      return;
    }

    // Auto-select first project if available
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [loading, isAuthenticated, projects, selectedProject]);

  const getProjectStatusColor = (status) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading || projectsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Terrin</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email?.split('@')[0] || 'User'}
              </span>
              <Badge variant="secondary">
                {userRole === 'both' ? 'Homeowner & Contractor' : userRole}
              </Badge>
              <Link href="/settings">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.email?.split('@')[0]}
          </h2>
          <p className="text-gray-600 mt-2">
            Manage your construction projects and communicate with professionals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Projects Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Projects</span>
                  <Link href="/">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {projectsLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : projects.length > 0 ? (
                  <div className="space-y-1">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 border-b ${
                          selectedProject?.id === project.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedProject(project)}
                      >
                        <h4 className="font-medium text-sm truncate">{project.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <Badge className={getProjectStatusColor(project.status)} variant="secondary">
                            {project.status?.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {project.completionPercentage || 0}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {project.location}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No projects yet</p>
                    <Link href="/">
                      <Button size="sm" className="mt-2">
                        Create Project
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-1 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Building className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Projects</p>
                      <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Calculator className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Estimates</p>
                      <p className="text-2xl font-bold text-gray-900">{estimates.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* AI Tools Card */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <Link href="/ai-scope-generator">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Scope Generator
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedProject ? (
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="timeline" className="flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messages
                  </TabsTrigger>
                  <TabsTrigger value="overview" className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="mt-6">
                  <ProjectTimeline projectId={selectedProject.id} />
                </TabsContent>

                <TabsContent value="messages" className="mt-6">
                  <Card>
                    <CardContent className="text-center py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <p className="text-lg font-medium mb-2">Project Messages</p>
                      <p className="text-gray-600 mb-4">
                        Access all your conversations and send payments to professionals
                      </p>
                      <Link href="/messages">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Go to Messages
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="overview" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Type</label>
                          <p className="text-sm text-gray-900">{selectedProject.projectType}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Budget Range</label>
                          <p className="text-sm text-gray-900">{selectedProject.budgetRange}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Timeline</label>
                          <p className="text-sm text-gray-900">{selectedProject.timeline}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Description</label>
                          <p className="text-sm text-gray-900">{selectedProject.description}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Project Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Completion</span>
                            <span>{selectedProject.completionPercentage || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${selectedProject.completionPercentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {selectedProject.startDate && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Start Date</label>
                            <p className="text-sm text-gray-900">
                              {new Date(selectedProject.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        
                        {selectedProject.endDate && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">End Date</label>
                            <p className="text-sm text-gray-900">
                              {new Date(selectedProject.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {selectedProject.actualCost && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Actual Cost</label>
                            <p className="text-sm text-gray-900">
                              ${parseFloat(selectedProject.actualCost).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Building className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a project to get started
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Choose a project from the sidebar to view its timeline, messages, and details
                  </p>
                  <Link href="/">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}