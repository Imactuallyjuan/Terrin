import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Home, 
  FileText, 
  Calculator, 
  Users, 
  MessageSquare, 
  Camera, 
  CreditCard, 
  Settings,
  CheckCircle,
  ArrowRight,
  Star,
  DollarSign,
  Calendar,
  Upload
} from "lucide-react";

export default function Tutorial() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Platform Tutorial</h1>
              <p className="text-gray-600 mt-2">Complete guide to using all Terrin features</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Getting Started */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Sign Up</h3>
                  <p className="text-sm text-gray-600">Create your account with Firebase authentication</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Choose Your Role</h3>
                  <p className="text-sm text-gray-600">Select Homeowner, Professional, or Both in Settings</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Start Your Journey</h3>
                  <p className="text-sm text-gray-600">Post projects or create your professional profile</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* For Homeowners */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Home className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">For Homeowners</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Post a Project */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  1. Post a Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Click "Post a Project"</p>
                      <p className="text-sm text-gray-600">Fill out project details, location, and timeline</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Set Your Budget</p>
                      <p className="text-sm text-gray-600">Choose from preset ranges or enter custom budget</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Add Photos</p>
                      <p className="text-sm text-gray-600">Upload current photos of your space</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Get AI Estimate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-purple-600" />
                  2. Get AI Cost Estimate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Click "Get AI Estimate"</p>
                      <p className="text-sm text-gray-600">Our AI analyzes your project for cost breakdown</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Review Detailed Breakdown</p>
                      <p className="text-sm text-gray-600">See materials, labor, permits, and timeline</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Save for Reference</p>
                      <p className="text-sm text-gray-600">All estimates saved in your dashboard</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Find Professionals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-orange-600" />
                  3. Find Professionals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Browse by Specialty</p>
                      <p className="text-sm text-gray-600">Filter by kitchen, bathroom, electrical, etc.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">View Profiles & Reviews</p>
                      <p className="text-sm text-gray-600">See ratings, experience, and past work</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Send Message</p>
                      <p className="text-sm text-gray-600">Contact professionals directly through platform</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manage Your Project */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  4. Manage Your Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Track Progress</p>
                      <p className="text-sm text-gray-600">Set milestones and monitor completion</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Monitor Costs</p>
                      <p className="text-sm text-gray-600">Track expenses and upload receipts</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Upload Photos</p>
                      <p className="text-sm text-gray-600">Document progress with before/after photos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* For Professionals */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Users className="h-6 w-6 mr-3 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">For Construction Professionals</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  1. Create Professional Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Visit Professional Portal</p>
                      <p className="text-sm text-gray-600">Complete your business information and specialties</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Set Your Rates</p>
                      <p className="text-sm text-gray-600">Enter hourly rates and service areas</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Add Experience</p>
                      <p className="text-sm text-gray-600">Highlight years of experience and certifications</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Set Up Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                  2. Set Up Stripe Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Click "Set Up Payouts"</p>
                      <p className="text-sm text-gray-600">Complete Stripe Express onboarding</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Verify Identity</p>
                      <p className="text-sm text-gray-600">Provide tax information and bank details</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Start Receiving Payments</p>
                      <p className="text-sm text-gray-600">Automatic deposits to your bank account</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Find Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  3. Find Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Browse Available Projects</p>
                      <p className="text-sm text-gray-600">View projects matching your specialties</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Contact Homeowners</p>
                      <p className="text-sm text-gray-600">Send messages to discuss project details</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Request Deposits</p>
                      <p className="text-sm text-gray-600">Secure projects with upfront payments</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manage Work */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-orange-600" />
                  4. Manage Your Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Track Earnings</p>
                      <p className="text-sm text-gray-600">Monitor payments and payout history</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Communicate with Clients</p>
                      <p className="text-sm text-gray-600">Real-time messaging throughout project</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Build Your Reputation</p>
                      <p className="text-sm text-gray-600">Collect reviews and grow your business</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Star className="h-6 w-6 mr-3 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Key Platform Features</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Messaging */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Real-time Messaging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Direct communication between homeowners and professionals</li>
                  <li>• Conversation history and file sharing</li>
                  <li>• Payment requests and confirmations</li>
                  <li>• WebSocket connection for instant updates</li>
                </ul>
              </CardContent>
            </Card>

            {/* Photo Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-purple-600" />
                  Photo Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Upload multiple photos per project</li>
                  <li>• Categorize as before, progress, after, materials</li>
                  <li>• Edit photo titles and descriptions</li>
                  <li>• Gallery view with full-screen preview</li>
                </ul>
              </CardContent>
            </Card>

            {/* Payment System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                  Secure Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Stripe integration for secure processing</li>
                  <li>• Project deposits and milestone payments</li>
                  <li>• Direct professional payouts via Stripe Express</li>
                  <li>• 5% platform fee automatically handled</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mb-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <ArrowRight className="h-5 w-5 mr-2" />
                Quick Tips for Success
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">For Homeowners:</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Be detailed in project descriptions</li>
                    <li>• Upload clear photos of your space</li>
                    <li>• Set realistic budgets and timelines</li>
                    <li>• Communicate regularly with professionals</li>
                    <li>• Document progress with photos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">For Professionals:</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Complete your profile thoroughly</li>
                    <li>• Set up Stripe payouts immediately</li>
                    <li>• Respond promptly to messages</li>
                    <li>• Be transparent about pricing</li>
                    <li>• Request deposits before starting work</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-lg mb-6 opacity-90">
                Join thousands of homeowners and professionals using Terrin
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/post-project">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Post Your First Project
                  </Button>
                </Link>
                <Link href="/professional-portal">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Create Professional Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}