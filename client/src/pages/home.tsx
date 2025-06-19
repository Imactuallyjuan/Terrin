import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calculator, Users, FileText, X } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import PostProjectFirebase from "@/components/PostProjectFirebase";
import EstimateForm from "@/components/EstimateForm";

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPostProject, setShowPostProject] = useState(false);
  const [showEstimator, setShowEstimator] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState(null);
  
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: estimates = [], isLoading: estimatesLoading } = useQuery({
    queryKey: ["/api/estimates"],
  });

  // Handle estimate generation events
  useEffect(() => {
    const handleEstimateGenerated = (event: CustomEvent) => {
      console.log('Estimate generated event received:', event.detail);
      // Invalidate estimates cache to trigger UI refresh
      queryClient.invalidateQueries({ queryKey: ['/api/estimates'] });
      setCurrentEstimate(event.detail);
    };

    // Listen for estimate generation events
    window.addEventListener('estimateGenerated', handleEstimateGenerated as EventListener);
    
    return () => {
      window.removeEventListener('estimateGenerated', handleEstimateGenerated as EventListener);
    };
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Manage your construction projects and connect with trusted professionals.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Plus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Post New Project</h3>
              <p className="text-sm text-slate-600 mb-4">Describe your construction project and get started</p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowPostProject(true)}
              >
                Create Project
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Calculator className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Cost Estimate</h3>
              <p className="text-sm text-slate-600 mb-4">AI-powered estimates for your projects</p>
              <Button 
                variant="outline" 
                className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                onClick={() => setShowEstimator(true)}
              >
                Get Estimate
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Professionals</h3>
              <p className="text-sm text-slate-600 mb-4">Connect with construction professionals</p>
              <Button 
                variant="outline" 
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => window.location.href = '/contractors'}
              >
                Browse Professionals
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">View Reports</h3>
              <p className="text-sm text-slate-600 mb-4">Track your project progress and costs</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/dashboard'}
              >
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects and Estimates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Projects</span>
                <Link href="/projects">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project: any) => (
                    <div key={project.id} className="border-l-4 border-blue-600 pl-4">
                      <h4 className="font-semibold text-gray-900">{project.title}</h4>
                      <p className="text-sm text-slate-600">{project.projectType}</p>
                      <p className="text-xs text-slate-500">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No projects yet</p>
                  <p className="text-sm text-slate-500">Create your first project to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Estimates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Estimates</span>
                <Link href="/estimates">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {estimatesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : estimates.length > 0 ? (
                <div className="space-y-4">
                  {estimates.slice(0, 3).map((estimate: any) => {
                    const inputData = estimate.inputData ? JSON.parse(estimate.inputData) : {};
                    const projectTitle = inputData.title || 'Construction Project';
                    
                    return (
                      <div key={estimate.id} className="border-l-4 border-green-600 pl-4">
                        <h4 className="font-semibold text-gray-900">
                          {projectTitle}
                        </h4>
                        <p className="text-sm text-slate-600">
                          ${parseInt(estimate.totalCostMin).toLocaleString()} - ${parseInt(estimate.totalCostMax).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {estimate.timeline} • Generated {new Date(estimate.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No estimates yet</p>
                  <p className="text-sm text-slate-500">Get your first AI-powered estimate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* Modal Overlays */}
      {showPostProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={() => setShowPostProject(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="p-6">
              <PostProjectFirebase />
            </div>
          </div>
        </div>
      )}

      {showEstimator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={() => setShowEstimator(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="p-6">
              {!currentEstimate ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Your AI-Powered Cost Estimate</h2>
                  <EstimateForm onEstimateComplete={(estimate: any) => {
                    console.log('Estimate completed:', estimate);
                    setCurrentEstimate(estimate);
                  }} />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your AI-Powered Cost Estimate</h2>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Project Estimate</h3>
                      <span className="bg-green-600 px-3 py-1 rounded-full text-sm font-medium">
                        AI Verified
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Total Cost Range</h4>
                        <p className="text-2xl font-bold">
                          ${parseInt(currentEstimate.totalCostMin).toLocaleString()} - ${parseInt(currentEstimate.totalCostMax).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Timeline</h4>
                        <p className="text-xl">{currentEstimate.timeline}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Materials:</strong> ${parseInt(currentEstimate.materialsCostMin).toLocaleString()} - ${parseInt(currentEstimate.materialsCostMax).toLocaleString()}</p>
                        <p><strong>Labor:</strong> ${parseInt(currentEstimate.laborCostMin).toLocaleString()} - ${parseInt(currentEstimate.laborCostMax).toLocaleString()}</p>
                      </div>
                      <div>
                        <p><strong>Permits:</strong> ${parseInt(currentEstimate.permitsCostMin).toLocaleString()} - ${parseInt(currentEstimate.permitsCostMax).toLocaleString()}</p>
                        <p><strong>Contingency:</strong> ${parseInt(currentEstimate.contingencyCostMin).toLocaleString()} - ${parseInt(currentEstimate.contingencyCostMax).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => {
                        setCurrentEstimate(null);
                        setShowEstimator(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Close
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentEstimate(null)}
                    >
                      New Estimate
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
