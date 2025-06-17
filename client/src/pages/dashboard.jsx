import { useEffect, useState } from "react";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, Clock, Plus, User, Building, Settings } from "lucide-react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, userRole, loading, isAuthenticated } = useFirebaseAuth();
  const [projects, setProjects] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

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
      let projectsQuery;
      
      if (userRole === 'homeowner' || userRole === 'both') {
        // Homeowners see their posted projects
        projectsQuery = query(
          collection(db, 'projects'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'contractor') {
        // Contractors see all open projects they can bid on
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
            Welcome back, {user?.email?.split('@')[0] || 'there'}!
          </h2>
          <p className="text-gray-600 mt-2">
            {userRole === 'homeowner' && "Manage your construction projects and track progress."}
            {userRole === 'contractor' && "Find new projects and grow your business."}
            {userRole === 'both' && "Manage your projects and find new work opportunities."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          {(userRole === 'homeowner' || userRole === 'both') && (
            <Link href="/#post-project">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Post New Project
              </Button>
            </Link>
          )}
          
          {(userRole === 'contractor' || userRole === 'both') && (
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              <Building className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          )}
        </div>

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