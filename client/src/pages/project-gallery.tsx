import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Calendar, Tag, Trash2, Edit, Save, X } from "lucide-react";

interface ProjectPhoto {
  id: number;
  fileName: string;
  filePath?: string;
  caption?: string;
  category: string;
  uploadedAt: string;
}

export default function ProjectGallery() {
  const [match, params] = useRoute("/projects/:id/gallery");
  const projectId = params?.id;
  const [editingPhoto, setEditingPhoto] = useState<number | null>(null);
  const [editData, setEditData] = useState({ fileName: '', caption: '' });
  const [allPhotos, setAllPhotos] = useState<ProjectPhoto[]>([]);
  const [hasMorePhotos, setHasMorePhotos] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load initial photos
  const { isLoading: initialLoading } = useQuery<ProjectPhoto[]>({
    queryKey: [`/api/projects/${projectId}/photos`, { limit: 10, offset: 0 }],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/photos?limit=10&offset=0`);
      const data = await response.json();
      const photos = Array.isArray(data) ? data : [];
      setAllPhotos(photos);
      setHasMorePhotos(photos.length === 10);
      setOffset(10);
      return photos;
    },
    enabled: !!projectId,
  });

  const loadMorePhotos = async () => {
    if (loadingMore || !hasMorePhotos) return;
    
    setLoadingMore(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/photos?limit=10&offset=${offset}`);
      const data = await response.json();
      const newPhotos = Array.isArray(data) ? data : [];
      
      if (newPhotos.length > 0) {
        setAllPhotos(prev => [...prev, ...newPhotos]);
        setOffset(prev => prev + newPhotos.length);
        setHasMorePhotos(newPhotos.length === 10);
      } else {
        setHasMorePhotos(false);
      }
    } catch (error) {
      console.error('Error loading more photos:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const { data: project } = useQuery<{ title: string }>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      return await apiRequest('DELETE', `/api/projects/photos/${photoId}`);
    },
    onSuccess: (_, photoId) => {
      // Immediately update local state
      setAllPhotos(prev => prev.filter(photo => photo.id !== photoId));
      // Only invalidate cache for project page (not gallery page)
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      toast({
        title: "Photo Deleted",
        description: "The photo has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updatePhotoMutation = useMutation({
    mutationFn: async ({ photoId, updates }: { photoId: number; updates: any }) => {
      return await apiRequest('PATCH', `/api/projects/photos/${photoId}`, updates);
    },
    onSuccess: (updatedPhoto, { photoId, updates }) => {
      // Immediately update local state
      setAllPhotos(prev => prev.map(photo => 
        photo.id === photoId ? { ...photo, ...updates } : photo
      ));
      // Only invalidate cache for project page (not gallery page)
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      setEditingPhoto(null);
      toast({
        title: "Photo Updated",
        description: "Photo details have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update photo. Please try again.",
        variant: "destructive",
      });
    }
  });

  const startEditing = (photo: ProjectPhoto) => {
    setEditingPhoto(photo.id);
    setEditData({
      fileName: photo.fileName,
      caption: photo.caption || ''
    });
  };

  const saveEdit = () => {
    if (editingPhoto) {
      updatePhotoMutation.mutate({
        photoId: editingPhoto,
        updates: editData
      });
    }
  };

  const cancelEdit = () => {
    setEditingPhoto(null);
    setEditData({ fileName: '', caption: '' });
  };

  if (initialLoading) {
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
            <Link href={`/projects`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
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
              {allPhotos.length} {allPhotos.length === 1 ? 'photo' : 'photos'}
            </p>
          </div>
        </div>

        {/* Photo Grid */}
        {allPhotos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg mb-4">No photos uploaded yet</p>
              <Link href={`/projects/${projectId}`}>
                <Button>Go back to upload photos</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allPhotos.map((photo: ProjectPhoto) => (
              <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {photo.filePath ? (
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
                  ) : (
                    <div className="flex items-center justify-center h-full text-center bg-gray-50">
                      <div>
                        <div className="h-12 w-12 text-gray-400 mx-auto mb-2">
                          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                        <div className="text-xs text-gray-400">Photo Available</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {photo.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  {editingPhoto === photo.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Title</label>
                        <Input
                          value={editData.fileName}
                          onChange={(e) => setEditData(prev => ({ ...prev, fileName: e.target.value }))}
                          className="text-sm"
                          placeholder="Photo title"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Description</label>
                        <Textarea
                          value={editData.caption}
                          onChange={(e) => setEditData(prev => ({ ...prev, caption: e.target.value }))}
                          className="text-sm resize-none"
                          rows={2}
                          placeholder="Photo description"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(photo.uploadedAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={saveEdit}
                            disabled={updatePhotoMutation.isPending}
                            className="h-7 px-2"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEdit}
                            className="h-7 px-2"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-sm truncate flex-1">{photo.fileName}</h3>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(photo)}
                            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePhotoMutation.mutate(photo.id)}
                            disabled={deletePhotoMutation.isPending}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {photo.caption && (
                        <p className="text-xs text-gray-600 line-clamp-2">{photo.caption}</p>
                      )}
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(photo.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            </div>
            
            {/* Load More Photos Button */}
            {hasMorePhotos && (
              <div className="text-center">
                <Button
                  onClick={loadMorePhotos}
                  disabled={loadingMore}
                  variant="outline"
                  className="px-8"
                >
                  {loadingMore ? "Loading..." : "Load More Photos"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}