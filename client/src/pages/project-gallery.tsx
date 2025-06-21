import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

interface ProjectPhoto {
  id: number;
  fileName: string;
  filePath: string;
  caption?: string;
  category: string;
  uploadedAt: string;
}

export default function ProjectGallery() {
  const [match, params] = useRoute("/projects/:id/gallery");
  const projectId = params?.id;

  const { data: photos = [], isLoading } = useQuery<ProjectPhoto[]>({
    queryKey: [`/api/projects/${projectId}/photos`, { limit: 100 }],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/photos?limit=100`);
      return response.json();
    },
    enabled: !!projectId,
  });

  const { data: project } = useQuery<{ title: string }>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/projects/${projectId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Gallery</h1>
              {project?.title && (
                <p className="text-gray-600 mt-1">{project.title}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </p>
          </div>
        </div>

        {/* Photo Grid */}
        {photos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg mb-4">No photos uploaded yet</p>
              <Link href={`/projects/${projectId}`}>
                <Button>Go back to upload photos</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo: ProjectPhoto) => (
              <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={photo.filePath}
                    alt={photo.caption || photo.fileName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'flex items-center justify-center h-full text-center';
                      fallback.innerHTML = '<div><div class="h-12 w-12 text-gray-400 mx-auto mb-2"><svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div><div class="text-xs text-gray-400">Image not found</div></div>';
                      e.currentTarget.parentElement?.appendChild(fallback);
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {photo.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm truncate">{photo.fileName}</h3>
                    {photo.caption && (
                      <p className="text-xs text-gray-600 line-clamp-2">{photo.caption}</p>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(photo.uploadedAt).toLocaleDateString()}
                    </div>
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