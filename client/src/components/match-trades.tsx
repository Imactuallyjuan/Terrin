import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, DollarSign, Check, Users } from "lucide-react";

export default function MatchTrades() {
  const { data: contractors = [], isLoading } = useQuery({
    queryKey: ["/api/contractors"],
    queryFn: async () => {
      const response = await fetch("/api/contractors?limit=6");
      if (!response.ok) throw new Error("Failed to fetch contractors");
      return response.json();
    },
  });

  const handleContactContractor = (contractorId: number) => {
    // TODO: Implement contact functionality
    console.log("Contact contractor:", contractorId);
  };

  const renderStars = (rating: string | number) => {
    const numRating = parseFloat(rating.toString());
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(numRating) ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <section className="py-16 bg-slate-50" id="match-trades">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Match with Verified Professionals
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Connect with licensed contractors in your area
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                    <div className="ml-3 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : contractors.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contractors.map((contractor: any) => (
              <Card key={contractor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={`https://images.unsplash.com/photo-${
                        contractor.id % 2 === 0 ? '1507003211169-0a1dd7228f2d' : '1472099645785-5658abf4ff4e'
                      }?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150`}
                      alt={contractor.businessName}
                    />
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {contractor.businessName}
                      </h3>
                      <p className="text-sm text-slate-600">{contractor.specialty}</p>
                    </div>
                    {contractor.verified && (
                      <Badge className="bg-green-600 hover:bg-green-600 text-white">
                        <Check className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center mb-3">
                    <div className="flex">
                      {renderStars(contractor.rating || 0)}
                    </div>
                    <span className="ml-2 text-sm text-slate-600">
                      {parseFloat(contractor.rating || "0").toFixed(1)} ({contractor.reviewCount || 0} reviews)
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {contractor.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                    <span className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {contractor.location}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="mr-1 h-4 w-4" />
                      ${contractor.hourlyRate}/hr
                    </span>
                  </div>

                  <Button
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => handleContactContractor(contractor.id)}
                  >
                    Contact {contractor.businessName.split(' ')[0]}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contractors Available</h3>
            <p className="text-slate-600">
              We're working on adding more verified professionals to our platform.
            </p>
          </div>
        )}

        {contractors.length > 0 && (
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              View More Contractors
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
