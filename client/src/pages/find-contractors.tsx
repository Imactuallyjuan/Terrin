import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, MapPin, Phone, Mail, Award, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function FindContractors() {
  // Sample contractor data for preview
  const sampleContractors = [
    {
      id: 1,
      name: "Bay Area Construction Co.",
      specialty: "Kitchen & Bathroom Remodeling",
      rating: 4.9,
      reviews: 127,
      location: "San Francisco, CA",
      verified: true,
      experience: "15+ years",
      completedProjects: 450,
      responseTime: "< 2 hours",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Elite Roofing Solutions",
      specialty: "Roofing & Exterior",
      rating: 4.8,
      reviews: 89,
      location: "Oakland, CA",
      verified: true,
      experience: "12+ years",
      completedProjects: 320,
      responseTime: "< 4 hours",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Modern Home Builders",
      specialty: "Home Additions & New Construction",
      rating: 4.7,
      reviews: 203,
      location: "San Jose, CA",
      verified: true,
      experience: "20+ years",
      completedProjects: 680,
      responseTime: "< 1 hour",
      photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
    }
  ];

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
            Find Verified Contractors
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Connect with pre-screened, highly-rated construction professionals in your area. 
            Every contractor is verified, insured, and ready to bring your project to life.
          </p>
          
          {/* Search Preview */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Project Type</label>
                  <div className="p-3 border border-slate-200 rounded-lg text-slate-500">
                    Kitchen Renovation
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <div className="p-3 border border-slate-200 rounded-lg text-slate-500">
                    San Francisco, CA
                  </div>
                </div>
                <div className="flex items-end">
                  <Link href="/" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Search Contractors
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Contractors */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Contractors</h2>
            <p className="text-lg text-slate-600">
              See the quality of professionals available on our platform
            </p>
          </div>

          <div className="space-y-6">
            {sampleContractors.map((contractor) => (
              <Card key={contractor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Contractor Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={contractor.photo} 
                            alt={contractor.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-semibold">{contractor.name}</h3>
                              {contractor.verified && (
                                <Badge className="bg-green-600 text-white">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-slate-600">{contractor.specialty}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="ml-1 font-medium">{contractor.rating}</span>
                                <span className="text-slate-500 ml-1">({contractor.reviews} reviews)</span>
                              </div>
                              <div className="flex items-center text-slate-600">
                                <MapPin className="h-4 w-4 mr-1" />
                                {contractor.location}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Experience:</span>
                          <p className="font-medium">{contractor.experience}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Projects:</span>
                          <p className="font-medium">{contractor.completedProjects}+ completed</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Response Time:</span>
                          <p className="font-medium">{contractor.responseTime}</p>
                        </div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-blue-600 mr-1" />
                          <span className="text-blue-600 font-medium">Top Rated</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 lg:w-48">
                      <Link href="/">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          View Profile
                        </Button>
                      </Link>
                      <Link href="/">
                        <Button variant="outline" className="w-full">
                          Get Quote
                        </Button>
                      </Link>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Verification Process */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Verification Process</h2>
            <p className="text-xl text-slate-600">
              Every contractor goes through our rigorous screening process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">License Verification</h3>
                <p className="text-sm text-slate-600">
                  Valid business license and contractor certifications verified
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Insurance Check</h3>
                <p className="text-sm text-slate-600">
                  General liability and workers compensation insurance confirmed
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Reference Review</h3>
                <p className="text-sm text-slate-600">
                  Past client references and project portfolio evaluated
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Background Check</h3>
                <p className="text-sm text-slate-600">
                  Criminal background and business history screening completed
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use Terrin to Find Contractors?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Pre-Screened Professionals</h3>
                  <p className="text-slate-600">Every contractor is verified, licensed, and insured before joining our platform.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Transparent Reviews</h3>
                  <p className="text-slate-600">Read authentic reviews from real customers who completed similar projects.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Project Management</h3>
                  <p className="text-slate-600">Track progress, communicate, and manage your project all in one place.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Fair Pricing</h3>
                  <p className="text-slate-600">Get competitive quotes and our AI estimates help you understand fair market pricing.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Find Your Contractor?</h3>
            <p className="text-blue-100 mb-6">
              Join thousands of homeowners who found their perfect contractor through Terrin. 
              Get started with a free estimate and browse verified professionals in your area.
            </p>
            <div className="space-y-3">
              <Link href="/">
                <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-gray-100">
                  Get Free Estimate
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="w-full border-white text-white hover:bg-white/10">
                  Browse All Contractors
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}