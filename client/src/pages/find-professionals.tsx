import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  Award, 
  CheckCircle,
  User,
  Filter,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import { Link } from "wouter";

export default function FindProfessionals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchFilters, setSearchFilters] = useState({
    specialty: '',
    location: '',
    search: ''
  });

  // Fetch all professionals
  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['/api/contractors', searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchFilters.specialty && searchFilters.specialty !== 'all') params.append('specialty', searchFilters.specialty);
      if (searchFilters.location) params.append('location', searchFilters.location);
      if (searchFilters.search) params.append('search', searchFilters.search);
      
      const response = await fetch(`/api/contractors?${params.toString()}`);
      return response.json();
    }
  });

  const specialtyOptions = [
    'General Contracting',
    'Electrical',
    'Plumbing',
    'HVAC',
    'Roofing',
    'Flooring',
    'Painting',
    'Carpentry',
    'Masonry',
    'Landscaping',
    'Kitchen Remodeling',
    'Bathroom Remodeling',
    'Home Additions',
    'Concrete Work',
    'Fencing',
    'Insulation',
    'Drywall',
    'Windows & Doors',
    'Demolition',
    'Handyman Services'
  ];

  const handleContactProfessional = (professional: any) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to contact professionals.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Contact Initiated",
      description: `You can now message ${professional.businessName}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Construction Professionals</h1>
          <p className="mt-2 text-lg text-slate-600">
            Connect with skilled professionals for your construction projects
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  placeholder="Search by business name or description..."
                  value={searchFilters.search}
                  onChange={(e) => setSearchFilters({...searchFilters, search: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Select 
                  value={searchFilters.specialty} 
                  onValueChange={(value) => setSearchFilters({...searchFilters, specialty: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All specialties</SelectItem>
                    {specialtyOptions.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  placeholder="City, State"
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                onClick={() => setSearchFilters({ specialty: '', location: '', search: '' })}
                variant="outline"
                size="sm"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Professionals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
                  <div className="h-10 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : professionals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional: any) => (
              <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {professional.businessName}
                      </h3>
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <Award className="mr-1 h-3 w-3" />
                        {professional.yearsExperience} years experience
                      </div>
                      {professional.serviceArea && (
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="mr-1 h-3 w-3" />
                          {professional.serviceArea}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Star className="mr-1 h-3 w-3 text-yellow-500" />
                      4.8
                    </div>
                  </div>

                  {/* Specialties */}
                  {professional.specialties && professional.specialties.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {professional.specialties.slice(0, 3).map((specialty: string) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {professional.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{professional.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {professional.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {professional.description}
                    </p>
                  )}

                  {/* Credentials */}
                  <div className="flex items-center space-x-3 mb-4 text-xs">
                    {professional.insurance && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Insured
                      </div>
                    )}
                    {professional.bondedAndInsured && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Bonded
                      </div>
                    )}
                    {professional.licenseNumber && (
                      <div className="flex items-center text-blue-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Licensed
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2 mb-4 text-sm">
                    {professional.phone && (
                      <div className="flex items-center text-slate-600">
                        <Phone className="mr-2 h-3 w-3" />
                        {professional.phone}
                      </div>
                    )}
                    {professional.email && (
                      <div className="flex items-center text-slate-600">
                        <Mail className="mr-2 h-3 w-3" />
                        {professional.email}
                      </div>
                    )}
                    {professional.website && (
                      <div className="flex items-center text-slate-600">
                        <Globe className="mr-2 h-3 w-3" />
                        <a 
                          href={professional.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link href={`/professionals/${professional.id}`}>
                      <Button size="sm" className="flex-1">
                        <User className="mr-1 h-3 w-3" />
                        View Profile
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleContactProfessional(professional)}
                      className="flex-1"
                    >
                      <MessageSquare className="mr-1 h-3 w-3" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Professionals Found</h3>
              <p className="text-slate-600 mb-4">
                {searchFilters.specialty || searchFilters.location || searchFilters.search 
                  ? "Try adjusting your search filters to find more professionals."
                  : "No professionals have created profiles yet."}
              </p>
              {(searchFilters.specialty || searchFilters.location || searchFilters.search) && (
                <Button 
                  onClick={() => setSearchFilters({ specialty: '', location: '', search: '' })}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Call to Action for Professionals */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Are you a construction professional?
            </h3>
            <p className="text-slate-600 mb-4">
              Join our platform to connect with homeowners and grow your business.
            </p>
            <Link href="/professional-portal">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Professional Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}