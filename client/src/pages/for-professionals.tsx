import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Users, Calendar, DollarSign, Star, CheckCircle, Zap, Shield, Clock } from "lucide-react";
import { Link } from "wouter";

export default function ForProfessionals() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-50">
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
              <Button className="bg-orange-600 hover:bg-orange-700">
                Join as Professional
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Grow Your Construction Business
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Join Terrin's network of verified professionals and connect with qualified homeowners ready to start their construction projects. 
            No more chasing leads - let customers find you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                Apply to Join
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">50,000+</div>
                <p className="text-slate-600">Active Homeowners</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">$2.5M+</div>
                <p className="text-slate-600">Projects Completed</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">4.8★</div>
                <p className="text-slate-600">Average Rating</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">85%</div>
                <p className="text-slate-600">Lead Conversion</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Join Terrin?</h2>
            <p className="text-xl text-slate-600">
              Transform how you find and manage construction projects
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Quality Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Connect with homeowners who have already received AI cost estimates and are serious about their projects.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Pre-qualified homeowners
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Budget-verified projects
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Location-matched opportunities
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Streamlined Process</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Our platform handles the heavy lifting so you can focus on what you do best - building.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Automated lead matching
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Built-in project management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Digital contracts & payments
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Business Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Build your reputation, showcase your work, and grow your business with our marketing tools.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Professional profile showcase
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Review & rating system
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Portfolio management
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works for Contractors */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600">
              Simple steps to start growing your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Your Profile</h3>
              <p className="text-slate-600">
                Sign up and create your professional profile. Share your experience, specialties, and work samples.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Showcase Your Work</h3>
              <p className="text-slate-600">
                Upload project photos, highlight your specialties, and set your service areas to attract the right clients.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Receive Quality Leads</h3>
              <p className="text-slate-600">
                Get matched with homeowners in your area who need your specific services and have verified budgets.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Win Projects & Grow</h3>
              <p className="text-slate-600">
                Submit proposals, communicate with clients, and manage projects through our integrated platform.
              </p>
            </div>
          </div>
        </div>

        {/* Professional Dashboard Preview */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Professional Dashboard</h2>
            <p className="text-xl text-slate-600">
              Everything you need to manage your business in one place
            </p>
          </div>

          <Card className="max-w-5xl mx-auto">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dashboard Metrics */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">New Lead: Kitchen Renovation</p>
                          <p className="text-sm text-slate-600">San Francisco, CA • $45,000 - $75,000</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-600">New</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Review Received: 5 Stars</p>
                          <p className="text-sm text-slate-600">"Excellent work on our bathroom remodel!"</p>
                        </div>
                      </div>
                      <Badge className="bg-green-600">★ 5.0</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium">Project Completed</p>
                          <p className="text-sm text-slate-600">Deck Construction • $12,000</p>
                        </div>
                      </div>
                      <Badge className="bg-orange-600">Paid</Badge>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">This Month</h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">12</div>
                      <p className="text-sm text-slate-600">New Leads</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">8</div>
                      <p className="text-sm text-slate-600">Proposals Sent</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">5</div>
                      <p className="text-sm text-slate-600">Projects Won</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">4.9★</div>
                      <p className="text-sm text-slate-600">Avg Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requirements */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Community</h2>
            <p className="text-xl text-slate-600">
              We welcome professionals of all sizes - from solo freelancers to established companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Basic Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Valid trade license or certification (where required by local law)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Basic liability coverage (amount varies by project size)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Registered business entity or operating as sole proprietor
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Clean background check
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Valid ID and tax documentation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Professional Standards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Demonstrable skills in your trade
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Examples of completed work (photos or references)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    At least 1 customer reference (or work samples for new professionals)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Reliable communication and professionalism
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Commitment to quality workmanship
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-4xl mx-auto mt-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">New to the Industry?</h3>
                  <p className="text-blue-800 mb-4">
                    We support emerging professionals! If you're just starting out, we offer mentorship programs 
                    and can pair you with experienced professionals for larger projects.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Apply as New Professional
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline" className="border-blue-600 text-blue-600">
                        Learn About Mentorship
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-orange-600 to-orange-800 rounded-2xl text-white p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Join the network of trusted professionals and start receiving quality leads today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                Apply Now
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Schedule a Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-orange-200 mt-4">
            Application review typically takes 3-5 business days
          </p>
        </div>
      </div>
    </div>
  );
}