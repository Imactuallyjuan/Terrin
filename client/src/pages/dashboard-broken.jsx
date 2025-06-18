import { useEffect, useState } from "react";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, DollarSign, Clock, Plus, User, Building, Settings, Calculator, MessageCircle, Activity, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ProjectTimeline from "@/components/ProjectTimeline";
import MessagingSystem from "@/components/MessagingSystem";

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

    if (user && userRole) {
      fetchDashboardData();
    }
  }, [user, userRole, loading, isAuthenticated]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch projects from Firestore
      let projectsQuery;
      
      if (userRole === 'homeowner' || userRole === 'both') {
        projectsQuery = query(
          collection(db, 'projects'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'contractor') {
        projectsQuery = query(
          collection(db, 'projects'),
          where('status', '==', 'open'),
          orderBy('createdAt', 'desc')
        );
      }

      if (projectsQuery) {
        const querySnapshot = await getDocs(projectsQuery);
        const projectData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectData);
      }

      // Fetch estimates from API
      try {
        const response = await fetch('/api/estimates');
        if (response.ok) {
          const estimatesData = await response.json();
          setEstimates(estimatesData.slice(0, 3)); // Show only recent 3 estimates
        }
      } catch (estimateError) {
        console.error('Error fetching estimates:', estimateError);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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
            Manage your construction projects and communicate with contractors
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
                  <MessagingSystem 
                    projectId={selectedProject.id} 
                    projectTitle={selectedProject.title}
                  />
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
    );
  }
                }} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {estimates.map((estimate) => (
                <div key={estimate.id} className="transform scale-90">
                  <EstimateResults estimate={estimate} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {userRole === 'homeowner' || userRole === 'both' ? 'Your Projects' : 'Available Projects'}
          </h3>

          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mb-4">
                  {userRole === 'contractor' ? (
                    <Building className="h-12 w-12 text-gray-400 mx-auto" />
                  ) : (
                    <Plus className="h-12 w-12 text-gray-400 mx-auto" />
                  )}
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {userRole === 'contractor' ? 'No projects available' : 'No projects yet'}
                </h4>
                <p className="text-gray-600 mb-6">
                  {userRole === 'contractor' 
                    ? 'New projects will appear here when homeowners post them.'
                    : 'Start by posting your first construction project.'
                  }
                </p>
                {(userRole === 'homeowner' || userRole === 'both') && (
                  <Link href="/#post-project">
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">
                      Post Your First Project
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg truncate">{project.title}</CardTitle>
                      <Badge className={getStatusColor(project.status || 'open')}>
                        {project.status || 'open'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {project.location}
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {project.budgetRange}
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {project.timeline}
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Posted {formatDate(project.createdAt)}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      {userRole === 'contractor' ? (
                        <Button variant="outline" size="sm" className="w-full">
                          View Details & Bid
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            View Bids
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats for Contractors */}
        {userRole === 'contractor' && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Active Bids</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Building className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Projects Won</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">$0</div>
                  <div className="text-sm text-gray-600">Total Earnings</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}