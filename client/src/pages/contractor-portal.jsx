import { useState, useEffect } from "react";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import ContractorProfile from "../components/ContractorProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, DollarSign, Clock, Building, Star, User } from "lucide-react";
import { collection, query, where, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link } from "wouter";

export default function ContractorPortal() {
  const { user, userRole } = useFirebaseAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [professionalProfile, setContractorProfile] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkContractorProfile();
      fetchAvailableProjects();
    }
  }, [user]);

  const checkContractorProfile = async () => {
    try {
      const professionalDoc = await getDoc(doc(db, 'professionals', user.uid));
      if (professionalDoc.exists()) {
        setHasProfile(true);
        setContractorProfile(professionalDoc.data());
      }
    } catch (error) {
      console.error('Error checking professional profile:', error);
    }
  };

  const fetchAvailableProjects = async () => {
    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(projectsQuery);
      const projectData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAvailableProjects(projectData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Terrin</h1>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Create Profile Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <Building className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">Welcome to Terrin Contractor Portal</h2>
            <p className="text-lg text-gray-600 mt-4">
              Create your professional profile to start receiving project opportunities
            </p>
          </div>
          
          <ContractorProfile />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Terrin</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Badge variant="secondary">Contractor Portal</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {professionalProfile?.businessName || 'Contractor'}!
          </h2>
          <p className="text-gray-600 mt-2">
            Manage your business profile and find new project opportunities.
          </p>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">Available Projects</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="stats">My Stats</TabsTrigger>
          </TabsList>

          {/* Available Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Available Projects ({availableProjects.length})
              </h3>
              <Button variant="outline" onClick={fetchAvailableProjects} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {loading ? (
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
            ) : availableProjects.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No projects available
                  </h4>
                  <p className="text-gray-600">
                    New projects will appear here when homeowners post them.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <Badge className="w-fit bg-green-100 text-green-800">
                        {project.projectType}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      
                      <div className="space-y-2 text-sm mb-4">
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
                      
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                        View Details & Submit Bid
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-6">
                  <img
                    src={professionalProfile?.profilePhotoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {professionalProfile?.businessName}
                    </h3>
                    <p className="text-gray-600 mb-2">{professionalProfile?.specialties}</p>
                    <p className="text-sm text-gray-600 mb-4">
                      {professionalProfile?.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{professionalProfile?.location}</span>
                      <span>{professionalProfile?.experience}</span>
                      <span>{professionalProfile?.phone}</span>
                    </div>
                  </div>
                  <Button variant="outline">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {professionalProfile?.rating || 5.0}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">$0</div>
                  <div className="text-sm text-gray-600">Total Earnings</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Start Bidding on Projects
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Your performance stats will appear here once you start winning projects.
                  </p>
                  <Button 
                    onClick={() => {
                      const element = document.querySelector('[data-state="active"][value="projects"]');
                      if (element) element.click();
                    }}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    View Available Projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}