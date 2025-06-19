import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Globe, Award } from "lucide-react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";

export default function MatchTradesFirebase() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userRole } = useFirebaseAuth();

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      const contractorsRef = collection(db, 'contractors');
      const q = query(contractorsRef, orderBy('createdAt', 'desc'), limit(6));
      const querySnapshot = await getDocs(q);
      
      const contractorData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setContractors(contractorData);
    } catch (error) {
      console.error('Error fetching contractors:', error);
      // Fallback to sample data if Firestore is empty
      setContractors([
        {
          id: 'sample-1',
          businessName: 'Elite Construction Co.',
          specialties: 'General Contractor',
          location: 'San Francisco, CA',
          rating: 4.9,
          reviewCount: 127,
          experience: '15+ years',
          description: 'Premium construction services with attention to detail and customer satisfaction.',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
          phone: '(415) 555-0123',
          verified: true
        },
        {
          id: 'sample-2',
          businessName: 'Kitchen Masters LLC',
          specialties: 'Kitchen & Bath',
          location: 'Oakland, CA',
          rating: 4.8,
          reviewCount: 89,
          experience: '10+ years',
          description: 'Specializing in luxury kitchen and bathroom renovations with modern designs.',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          phone: '(510) 555-0456',
          verified: true
        },
        {
          id: 'sample-3',
          businessName: 'Bay Area Roofing',
          specialties: 'Roofing',
          location: 'San Jose, CA',
          rating: 4.7,
          reviewCount: 156,
          experience: '20+ years',
          description: 'Expert roofing solutions for residential and commercial properties.',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          phone: '(408) 555-0789',
          verified: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleContactContractor = (contractor) => {
    const message = `Hi ${contractor.businessName}, I found your profile on Terrin and I'm interested in your ${contractor.specialties.toLowerCase()} services. Could we discuss my project?`;
    const phoneNumber = contractor.phone?.replace(/\D/g, '');
    
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_blank');
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white" id="match-trades">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Finding Contractors...
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <Card className="h-96 bg-gray-200 rounded-lg"></Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white" id="match-trades">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Meet Our Verified Professionals
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Connect with top-rated contractors in your area
          </p>
        </div>

        {contractors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-6">
              No contractors found. Be the first to join our platform!
            </p>
            {userRole === 'contractor' || userRole === 'both' ? (
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Create Contractor Profile
              </Button>
            ) : (
              <p className="text-sm text-gray-500">
                Are you a contractor? Sign up to create your profile.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contractors.map((contractor) => (
              <Card key={contractor.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={contractor.profilePhotoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'}
                      alt={contractor.businessName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {contractor.businessName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {contractor.specialties}
                        </Badge>
                        {contractor.verified && (
                          <Award className="h-4 w-4 text-blue-600" title="Verified Professional" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{contractor.location}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(contractor.rating || 5)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {contractor.rating || 5.0} ({contractor.reviewCount || 0} reviews)
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Experience:</span> {contractor.experience}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {contractor.description}
                  </p>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleContactContractor(contractor)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                    
                    {contractor.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(contractor.website, '_blank')}
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-lg text-slate-600 mb-6">
            Ready to get started on your project?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                const element = document.getElementById('post-project');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Post Your Project
            </Button>
            <Button 
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => window.location.href = '/contractors'}
            >
              Browse All Contractors
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}