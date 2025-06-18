import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calculator, Users, CheckCircle, Star, Clock, MapPin, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How Terrin Works
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From project idea to completion - discover how our AI-powered platform revolutionizes construction project management
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">1. Get AI-Powered Estimates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Describe your project and get instant, location-aware cost estimates powered by advanced AI. 
                See detailed breakdowns by trade: carpentry, electrical, plumbing, and more.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">2. Find Verified Contractors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Connect with pre-screened, local contractors who match your project needs. 
                Browse profiles, ratings, and previous work examples.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">3. Manage & Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Use our project dashboard to track timeline, budget, and milestones. 
                Communicate with contractors and monitor progress in real-time.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Estimate Demo */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See AI Estimates in Action</h2>
            <p className="text-xl text-slate-600">
              Our AI considers your location, project type, and current market conditions
            </p>
          </div>
          
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Kitchen Renovation in San Francisco</CardTitle>
                <Badge className="bg-green-600 text-white">AI Verified</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-4">
                    <h3 className="text-lg font-semibold mb-3">Total Project Cost</h3>
                    <p className="text-3xl font-bold">$45,000 - $75,000</p>
                    <div className="flex items-center mt-2 text-blue-100">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>6-10 weeks</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Materials:</span>
                        <span className="font-medium">$25,000 - $40,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Labor:</span>
                        <span className="font-medium">$15,000 - $25,000</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Permits:</span>
                        <span className="font-medium">$2,000 - $4,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Contingency:</span>
                        <span className="font-medium">$3,000 - $6,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Trade-Specific Costs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Carpentry:</span>
                      <span className="font-medium">$12,000 - $18,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Electrical:</span>
                      <span className="font-medium">$3,000 - $5,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Plumbing:</span>
                      <span className="font-medium">$4,000 - $7,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Flooring:</span>
                      <span className="font-medium">$5,000 - $8,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Painting:</span>
                      <span className="font-medium">$2,000 - $4,000</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">AI Analysis</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• High-cost area pricing factored in</li>
                      <li>• Current material costs considered</li>
                      <li>• Local permit requirements included</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Benefits */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Terrin?</h2>
            <p className="text-xl text-slate-600">
              Built for modern construction projects with intelligent automation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">AI-Powered Accuracy</h3>
                <p className="text-sm text-slate-600">
                  Location-aware estimates that consider regional costs and market conditions
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Instant Results</h3>
                <p className="text-sm text-slate-600">
                  Get detailed cost breakdowns in seconds, not days
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Verified Contractors</h3>
                <p className="text-sm text-slate-600">
                  Connect with pre-screened professionals in your area
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Project Management</h3>
                <p className="text-sm text-slate-600">
                  Track progress, timelines, and communicate seamlessly
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl text-white p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of homeowners who trust Terrin for their construction projects
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Free Estimate
              </Button>
            </Link>
            <Link href="/find-contractors">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Browse Contractors
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}