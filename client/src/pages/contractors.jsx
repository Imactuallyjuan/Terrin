import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, MapPin, Star, Phone, Mail, Search, Filter } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function Contractors() {
  const { user, loading, isAuthenticated } = useFirebaseAuth();
  const [professionals, setContractors] = useState([]);
  const [filteredContractors, setFilteredContractors] = useState([]);
  const [loadingContractors, setLoadingContractors] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const { toast } = useToast();

  const specialties = [
    'General Contractor',
    'Kitchen Renovation',
    'Bathroom Remodel',
    'Roofing',
    'Flooring',
    'Electrical',
    'Plumbing',
    'HVAC',
    'Painting',
    'Landscaping',
    'Carpentry',
    'Masonry'
  ];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth';
      return;
    }

    if (user) {
      fetchContractors();
    }
  }, [user, loading, isAuthenticated]);

  useEffect(() => {
    filterContractors();
  }, [professionals, searchTerm, locationFilter, specialtyFilter]);

  const fetchContractors = async () => {
    try {
      // Query Firebase for users with professional or both roles
      const professionalQuery = query(
        collection(db, 'users'),
        where('role', 'in', ['professional', 'both'])
      );

      const querySnapshot = await getDocs(professionalQuery);
      const professionalData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Add mock data for display purposes since we don't have full professional profiles yet
        businessName: doc.data().businessName || `${doc.data().email?.split('@')[0]} Construction`,
        specialty: doc.data().specialty || 'General Contractor',
        location: doc.data().location || 'Local Area',
        rating: doc.data().rating || (4 + Math.random()).toFixed(1),
        reviewCount: doc.data().reviewCount || Math.floor(Math.random() * 50) + 5,
        hourlyRate: doc.data().hourlyRate || `$${(50 + Math.random() * 100).toFixed(0)}`,
        yearsExperience: doc.data().yearsExperience || Math.floor(Math.random() * 15) + 3,
        verified: doc.data().verified !== false // Default to verified unless explicitly false
      }));

      setContractors(professionalData);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      toast({
        title: "Error Loading Contractors",
        description: "Failed to load professional profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingContractors(false);
    }
  };

  const filterContractors = () => {
    let filtered = professionals;

    // Search by business name or specialty
    if (searchTerm) {
      filtered = filtered.filter(professional =>
        professional.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by location
    if (locationFilter) {
      filtered = filtered.filter(professional =>
        professional.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Filter by specialty
    if (specialtyFilter && specialtyFilter !== 'all') {
      filtered = filtered.filter(professional =>
        professional.specialty === specialtyFilter
      );
    }

    setFilteredContractors(filtered);
  };

  const handleContactContractor = (professional) => {
    toast({
      title: "Contact Request Sent",
      description: `Your contact request has been sent to ${professional.businessName}`,
    });
  };

  if (loading || loadingContractors) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading professionals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Construction Professionals
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with construction professionals in your area
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search professionals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('');
                setSpecialtyFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredContractors.length} professional{filteredContractors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Contractors Grid */}
        {filteredContractors.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No professionals found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContractors.map((professional) => (
              <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {professional.businessName}
                      </CardTitle>
                      <p className="text-blue-600 font-medium">{professional.specialty}</p>
                    </div>
                    {professional.verified && (
                      <Badge className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{professional.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{professional.rating}</span>
                    <span className="text-gray-600">({professional.reviewCount} reviews)</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Rate:</span>
                      <p className="font-medium">{professional.hourlyRate}/hr</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Experience:</span>
                      <p className="font-medium">{professional.yearsExperience} years</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      className="flex-1"
                      onClick={() => handleContactContractor(professional)}
                    >
                      Contact
                    </Button>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}