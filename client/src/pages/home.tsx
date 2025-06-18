import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calculator, Users, FileText } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: estimates = [], isLoading: estimatesLoading } = useQuery({
    queryKey: ["/api/estimates"],
  });

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
                onClick={() => window.location.href = '/#post-project'}
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
                onClick={() => window.location.href = '/#cost-estimator'}
              >
                Get Estimate
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Contractors</h3>
              <p className="text-sm text-slate-600 mb-4">Connect with verified professionals</p>
              <Button 
                variant="outline" 
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => window.location.href = '/contractors'}
              >
                Browse Contractors
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
                  {estimates.slice(0, 3).map((estimate: any) => (
                    <div key={estimate.id} className="border-l-4 border-green-600 pl-4">
                      <h4 className="font-semibold text-gray-900">
                        ${estimate.totalCostMin} - ${estimate.totalCostMax}
                      </h4>
                      <p className="text-sm text-slate-600">{estimate.timeline}</p>
                      <p className="text-xs text-slate-500">
                        Generated {new Date(estimate.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
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
    </div>
  );
}
