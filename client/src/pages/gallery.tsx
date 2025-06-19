import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Filter, Image as ImageIcon, Calendar, MapPin } from "lucide-react";
import { Link } from "wouter";

interface ProjectPhoto {
  id: number;
  projectId: number;
  projectTitle: string;
  fileName: string;
  filePath: string;
  caption?: string;
  category: string;
  uploadedAt: string;
  location?: string;
  contractorName?: string;
}

export default function Gallery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState<ProjectPhoto | null>(null);

  // Fetch all project photos for gallery
  const { data: photos = [], isLoading } = useQuery<ProjectPhoto[]>({
    queryKey: ['/api/gallery/photos']
  });

  // Filter photos based on search and category
  const filteredPhotos = photos.filter((photo) => {
    const matchesSearch = !searchTerm || 
      photo.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.contractorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || photo.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "before", label: "Before" },
    { value: "progress", label: "Progress" },
    { value: "after", label: "After" },
    { value: "materials", label: "Materials" },
    { value: "issues", label: "Issues" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Gallery</h1>
              <p className="text-gray-600">Browse construction projects and transformations</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects, contractors, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'}
            {searchTerm && ` for "${searchTerm}"`}
            {categoryFilter !== "all" && ` in ${categories.find(c => c.value === categoryFilter)?.label}`}
          </p>
        </div>

        {/* Gallery Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No photos found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || categoryFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "No project photos have been uploaded yet"
              }
            </p>
            {!searchTerm && categoryFilter === "all" && (
              <Link href="/projects">
                <Button>
                  Start a Project
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map((photo) => (
              <Card 
                key={photo.id} 
                className="group cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => setSelectedImage(photo)}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={photo.filePath}
                    alt={photo.caption || photo.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="200" y="200" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="Arial, sans-serif" font-size="16">Image not found</text></svg>`;
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {categories.find(c => c.value === photo.category)?.label || photo.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {photo.projectTitle}
                  </h3>
                  {photo.caption && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {photo.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    {photo.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-20">{photo.location}</span>
                      </div>
                    )}
                  </div>
                  {photo.contractorName && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      by {photo.contractorName}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedImage.projectTitle}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <Badge variant="outline">
                        {categories.find(c => c.value === selectedImage.category)?.label || selectedImage.category}
                      </Badge>
                      <span>{new Date(selectedImage.uploadedAt).toLocaleDateString()}</span>
                      {selectedImage.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {selectedImage.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedImage(null)}>
                    ×
                  </Button>
                </div>
                <img
                  src={selectedImage.filePath}
                  alt={selectedImage.caption || selectedImage.fileName}
                  className="w-full h-auto rounded-lg mb-4"
                />
                {selectedImage.caption && (
                  <p className="text-gray-700 mb-4">{selectedImage.caption}</p>
                )}
                {selectedImage.contractorName && (
                  <p className="text-sm text-blue-600 font-medium">
                    Project by {selectedImage.contractorName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}