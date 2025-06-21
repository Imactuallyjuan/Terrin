import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  DollarSign, 
  Camera,
  Trash2, 
  FileText, 
  Plus, 
  Check, 
  Clock,
  Eye, 
  Target,
  Upload,
  Edit,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  budgetRange: string;
  timeline: string;
  location: string;
  completionPercentage: number;
  actualCost?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface ProjectCost {
  id: number;
  category: string;
  description: string;
  amount: string;
  vendor?: string;
  dateIncurred: string;
  receipt?: string;
  notes?: string;
}

interface ProjectMilestone {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completedDate?: string;
  status: string;
  order: number;
  progressWeight?: number;
}

interface ProjectPhoto {
  id: number;
  fileName: string;
  filePath: string;
  caption?: string;
  category: string;
  uploadedAt: string;
}

interface ProjectDocument {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  category: string;
  description?: string;
  uploadedAt: string;
}

interface EnhancedProjectViewProps {
  project: Project;
}

export default function EnhancedProjectView({ project }: EnhancedProjectViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form states
  const [newCost, setNewCost] = useState({
    category: '',
    description: '',
    amount: '',
    vendor: '',
    dateIncurred: new Date().toISOString().split('T')[0],
    notes: '',
    receipt: ''
  });

  const [customCategory, setCustomCategory] = useState('');

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
    order: 1,
    progressWeight: 10
  });

  const [editingMilestone, setEditingMilestone] = useState<number | null>(null);
  const [editMilestoneData, setEditMilestoneData] = useState({
    title: '',
    description: '',
    progressWeight: 10
  });

  // Receipt viewing modal state
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  // Construction milestone presets with realistic weights
  const constructionPresets = [
    { title: 'Site Preparation', description: 'Clear land, excavation, utilities setup', weight: 5 },
    { title: 'Foundation', description: 'Pour concrete foundation and basement', weight: 15 },
    { title: 'Framing', description: 'Frame walls, roof structure, windows/doors', weight: 20 },
    { title: 'Electrical Rough-in', description: 'Install wiring, panels, outlets', weight: 8 },
    { title: 'Plumbing Rough-in', description: 'Install pipes, fixtures, water lines', weight: 8 },
    { title: 'HVAC Installation', description: 'Install heating, cooling, ductwork', weight: 7 },
    { title: 'Insulation', description: 'Install wall and attic insulation', weight: 5 },
    { title: 'Drywall', description: 'Hang, tape, and finish drywall', weight: 10 },
    { title: 'Flooring', description: 'Install hardwood, tile, carpet', weight: 8 },
    { title: 'Interior Paint', description: 'Prime and paint all interior walls', weight: 6 },
    { title: 'Kitchen Installation', description: 'Install cabinets, countertops, appliances', weight: 8 },
    { title: 'Bathroom Finishing', description: 'Install fixtures, tile, vanities', weight: 6 },
    { title: 'Exterior Siding', description: 'Install siding, trim, exterior paint', weight: 10 },
    { title: 'Roofing', description: 'Install shingles, gutters, flashing', weight: 12 },
    { title: 'Final Inspections', description: 'Final walkthrough and punch list', weight: 2 }
  ];

  const [selectedPhoto, setSelectedPhoto] = useState<ProjectPhoto | null>(null);
  
  const [newPhoto, setNewPhoto] = useState({
    fileName: '',
    filePath: '',
    caption: '',
    category: 'progress'
  });

  const [uploadingPhotos, setUploadingPhotos] = useState<Array<{
    fileName: string;
    filePath: string;
    caption: string;
    category: string;
    progress: number;
  }>>([]);

  const [newDocument, setNewDocument] = useState({
    fileName: '',
    filePath: '',
    fileType: '',
    fileSize: 0,
    category: 'general',
    description: ''
  });

  // Data queries
  const { data: costs = [] } = useQuery<ProjectCost[]>({
    queryKey: [`/api/projects/${project.id}/costs`],
  });

  const { data: milestones = [] } = useQuery<ProjectMilestone[]>({
    queryKey: [`/api/projects/${project.id}/milestones`],
  });

  const [photoOffset, setPhotoOffset] = useState(0);
  const [allPhotos, setAllPhotos] = useState<ProjectPhoto[]>([]);
  const [hasMorePhotos, setHasMorePhotos] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Load photos progressively to avoid database response size limits
  const loadPhotos = async (offset: number = 0, append: boolean = false) => {
    if (loadingPhotos) return;
    
    setLoadingPhotos(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/photos?offset=${offset}&limit=1`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebase-token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const newPhotos = await response.json();
        if (newPhotos.length === 0) {
          setHasMorePhotos(false);
        } else {
          setAllPhotos(prev => append ? [...prev, ...newPhotos] : newPhotos);
          if (append) {
            setPhotoOffset(offset + 1);
          }
        }
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  // Initial photo load
  useEffect(() => {
    loadPhotos(0, false);
  }, [project.id]);

  // Use allPhotos for rendering
  const photos = allPhotos;

  const { data: documents = [] } = useQuery<ProjectDocument[]>({
    queryKey: [`/api/projects/${project.id}/documents`],
  });

  // Mutations
  const addCostMutation = useMutation({
    mutationFn: async (costData: any) => {
      return await apiRequest('POST', `/api/projects/${project.id}/costs`, costData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/costs`] });
      setNewCost({
        category: '',
        description: '',
        amount: '',
        vendor: '',
        dateIncurred: new Date().toISOString().split('T')[0],
        notes: '',
        receipt: ''
      });
      toast({
        title: "Cost Added",
        description: "The cost has been recorded successfully.",
      });
    }
  });

  const addMilestoneMutation = useMutation({
    mutationFn: async (milestoneData: any) => {
      return await apiRequest('POST', `/api/projects/${project.id}/milestones`, milestoneData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/milestones`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setNewMilestone({
        title: '',
        description: '',
        dueDate: '',
        order: milestones.length + 1,
        progressWeight: 10
      });
      toast({
        title: "Milestone Added",
        description: "The milestone has been created successfully.",
      });
    }
  });

  const generateTimelineMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/projects/${project.id}/generate-timeline`);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/milestones`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "AI Timeline Generated",
        description: `Created ${data.milestonesCreated} smart milestones based on your project description.`,
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate timeline. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      return await apiRequest('PATCH', `/api/projects/milestones/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/milestones`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Milestone Updated",
        description: "The milestone has been updated successfully.",
      });
    }
  });

  const addPhotoMutation = useMutation({
    mutationFn: async (photoData: any) => {
      return await apiRequest('POST', `/api/projects/${project.id}/photos`, photoData);
    },
    onSuccess: () => {
      // Refresh photo list after successful upload
      loadPhotos(0, false);
      setPhotoOffset(0);
      setHasMorePhotos(true);
      
      setNewPhoto({
        fileName: '',
        filePath: '',
        caption: '',
        category: 'progress'
      });
      toast({
        title: "Photo Added",
        description: "The photo has been uploaded successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteCostMutation = useMutation({
    mutationFn: async (costId: number) => {
      return await apiRequest('DELETE', `/api/projects/costs/${costId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/costs`] });
      toast({
        title: "Cost Deleted",
        description: "The cost has been removed successfully.",
      });
    }
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: number) => {
      return await apiRequest('DELETE', `/api/projects/milestones/${milestoneId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/milestones`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Milestone Deleted",
        description: "The milestone has been removed successfully.",
      });
    }
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      return await apiRequest('DELETE', `/api/projects/photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/photos`] });
      toast({
        title: "Photo Deleted",
        description: "The photo has been removed successfully.",
      });
    }
  });

  const addDocumentMutation = useMutation({
    mutationFn: async (documentData: any) => {
      return await apiRequest('POST', `/api/projects/${project.id}/documents`, documentData);
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure UI refreshes
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/documents`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setNewDocument({
        fileName: '',
        filePath: '',
        fileType: '',
        fileSize: 0,
        category: 'general',
        description: ''
      });
      toast({
        title: "Document Added",
        description: "The document has been uploaded successfully.",
      });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return await apiRequest('DELETE', `/api/projects/documents/${documentId}`);
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure UI refreshes
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/documents`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Document Deleted",
        description: "The document has been removed successfully.",
      });
    }
  });

  // Handlers
  const handleAddCost = () => {
    if (!newCost.category || !newCost.description || !newCost.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const costData = {
      ...newCost,
      dateIncurred: new Date(newCost.dateIncurred + 'T00:00:00Z')
    };
    
    addCostMutation.mutate(costData);
  };

  const handleAddMilestone = () => {
    if (!newMilestone.title) {
      toast({
        title: "Missing Information",
        description: "Please enter a milestone title.",
        variant: "destructive",
      });
      return;
    }
    
    const milestoneData = {
      ...newMilestone,
      order: (milestones as any[]).length + 1,
      dueDate: newMilestone.dueDate ? new Date(newMilestone.dueDate + 'T00:00:00Z') : null
    };
    
    addMilestoneMutation.mutate(milestoneData);
  };

  const handleToggleMilestone = (milestone: ProjectMilestone) => {
    const isCompleted = milestone.status === 'completed';
    updateMilestoneMutation.mutate({
      id: milestone.id,
      updates: {
        status: isCompleted ? 'pending' : 'completed',
        completedDate: isCompleted ? null : new Date()
      }
    });
  }

  const startEditingMilestone = (milestone: ProjectMilestone) => {
    setEditingMilestone(milestone.id);
    setEditMilestoneData({
      title: milestone.title,
      description: milestone.description || '',
      progressWeight: milestone.progressWeight || 10
    });
  };

  const saveEditedMilestone = () => {
    if (editingMilestone) {
      updateMilestoneMutation.mutate({ 
        id: editingMilestone, 
        updates: editMilestoneData 
      });
      setEditingMilestone(null);
    }
  };

  const cancelEditingMilestone = () => {
    setEditingMilestone(null);
    setEditMilestoneData({ title: '', description: '', progressWeight: 10 });
  };;

  const handleMultiplePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate all files before processing
    const maxSize = 10 * 1024 * 1024; // 10MB per file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    // Calculate total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 50 * 1024 * 1024; // 50MB total limit
    
    if (totalSize > maxTotalSize) {
      toast({
        title: "Upload Too Large",
        description: "Total upload size cannot exceed 50MB. Please select fewer or smaller images.",
        variant: "destructive",
      });
      return;
    }

    // Validate individual files
    const invalidFiles = files.filter(file => 
      file.size > maxSize || !allowedTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      const oversizedFiles = invalidFiles.filter(f => f.size > maxSize);
      const invalidTypeFiles = invalidFiles.filter(f => !allowedTypes.includes(f.type));
      
      let errorMessage = "";
      if (oversizedFiles.length > 0) {
        errorMessage += `Files too large (>10MB): ${oversizedFiles.map(f => f.name).join(', ')}. `;
      }
      if (invalidTypeFiles.length > 0) {
        errorMessage += `Invalid file types: ${invalidTypeFiles.map(f => f.name).join(', ')}.`;
      }

      toast({
        title: "Invalid Files",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    // Process files
    setUploadingPhotos(files.map(file => ({
      fileName: file.name,
      filePath: '',
      caption: '',
      category: newPhoto.category,
      progress: 0
    })));

    toast({
      title: "Processing Photos",
      description: `Processing ${files.length} photos...`,
    });

    // Process files in batches to avoid overwhelming the browser
    const batchSize = 3;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (file, batchIndex) => {
        const overallIndex = i + batchIndex;
        
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onerror = () => {
            setUploadingPhotos(prev => prev.filter((_, idx) => idx !== overallIndex));
            reject(new Error(`Failed to read ${file.name}`));
          };
          
          reader.onload = async () => {
            try {
              const base64String = reader.result as string;
              
              // Update progress
              setUploadingPhotos(prev => prev.map((photo, idx) => 
                idx === overallIndex ? { ...photo, filePath: base64String, progress: 50 } : photo
              ));

              // Upload to server
              const photoData = {
                fileName: file.name,
                filePath: base64String,
                caption: '',
                category: newPhoto.category
              };

              await addPhotoMutation.mutateAsync(photoData);
              
              // Update progress to complete
              setUploadingPhotos(prev => prev.map((photo, idx) => 
                idx === overallIndex ? { ...photo, progress: 100 } : photo
              ));
              
              resolve();
            } catch (error) {
              console.error(`Error processing ${file.name}:`, error);
              setUploadingPhotos(prev => prev.filter((_, idx) => idx !== overallIndex));
              reject(error);
            }
          };
          
          reader.readAsDataURL(file);
        });
      }));
      
      // Small delay between batches to prevent overwhelming
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Clear uploading state after all files are processed
    setTimeout(() => {
      setUploadingPhotos([]);
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${files.length} photos.`,
      });
    }, 1000);

    // Reset file input
    event.target.value = '';
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid image file (JPEG, PNG, GIF, or WebP).",
          variant: "destructive",
        });
        return;
      }

      try {
        // Convert file to base64 for storage
        const reader = new FileReader();
        
        reader.onerror = () => {
          toast({
            title: "Upload Error",
            description: "Failed to read the selected image file.",
            variant: "destructive",
          });
        };
        
        reader.onload = () => {
          try {
            const base64String = reader.result as string;
            setNewPhoto({
              ...newPhoto,
              fileName: file.name,
              filePath: base64String
            });
          } catch (error) {
            console.error('Error processing file:', error);
            toast({
              title: "Processing Error",
              description: "Failed to process the image. Please try a different file.",
              variant: "destructive",
            });
          }
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error handling photo upload:', error);
        toast({
          title: "Upload Error",
          description: "Failed to process the selected image.",
          variant: "destructive",
        });
      }
    }
  }

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          setNewCost({
            ...newCost,
            receipt: base64String
          });
        };
        reader.readAsDataURL(file);
        
        toast({
          title: "Receipt Uploaded",
          description: "Receipt photo has been attached to this cost entry.",
        });
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "Failed to process the receipt image.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddPhoto = () => {
    if (!newPhoto.fileName) {
      toast({
        title: "No File Selected",
        description: "Please select a photo to upload.",
        variant: "destructive",
      });
      return;
    }
    addPhotoMutation.mutate(newPhoto);
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          setNewDocument({
            ...newDocument,
            fileName: file.name,
            filePath: base64String,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "Failed to process the selected document.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddDocument = () => {
    if (!newDocument.fileName) {
      toast({
        title: "No File Selected",
        description: "Please select a document to upload.",
        variant: "destructive",
      });
      return;
    }
    addDocumentMutation.mutate(newDocument);
  };

  // Calculate total costs
  const totalCosts = costs.reduce((sum: number, cost: ProjectCost) => {
    return sum + parseFloat(cost.amount || '0');
  }, 0);

  // Calculate project completion percentage based on completed milestones
  const completionPercentage = milestones.length > 0 ? 
    milestones
      .filter((m: ProjectMilestone) => m.status === 'completed')
      .reduce((sum: number, m: ProjectMilestone) => sum + (m.progressWeight || 10), 0) : 0;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'planning': return 'secondary';
      case 'active': return 'default';
      case 'in_progress': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{project.title}</CardTitle>
              <p className="text-muted-foreground mt-2">{project.description}</p>
            </div>
            <Badge variant={getStatusBadgeVariant(project.status)}>
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Budget: {project.budgetRange}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm">Actual: ${totalCosts.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Timeline: {project.timeline}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Progress: {completionPercentage}%</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Project Management Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Cost Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Spent:</span>
                    <span className="font-semibold">${totalCosts.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget Range:</span>
                    <span>{project.budgetRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recent Costs:</span>
                    <span>{costs.length} items</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Project Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Completion:</span>
                    <span className="font-semibold">{completionPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Milestones:</span>
                    <span>{milestones.filter((m: ProjectMilestone) => m.status === 'completed').length} of {milestones.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Photos:</span>
                    <span>{photos.length} uploaded</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs">
          <div className="space-y-6">
            {/* Add Cost Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newCost.category} onValueChange={(value) => {
                      if (value === 'custom') {
                        setNewCost({...newCost, category: customCategory});
                      } else {
                        setNewCost({...newCost, category: value});
                        setCustomCategory('');
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select or type category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="materials">Materials</SelectItem>
                        <SelectItem value="labor">Labor</SelectItem>
                        <SelectItem value="permits">Permits</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="tools">Tools</SelectItem>
                        <SelectItem value="custom">Type Custom Category...</SelectItem>
                      </SelectContent>
                    </Select>
                    {newCost.category === 'custom' || (newCost.category && !['materials', 'labor', 'permits', 'equipment', 'utilities', 'inspection', 'transportation', 'tools'].includes(newCost.category)) ? (
                      <div className="mt-2">
                        <Input
                          value={customCategory || newCost.category}
                          onChange={(e) => {
                            setCustomCategory(e.target.value);
                            setNewCost({...newCost, category: e.target.value});
                          }}
                          placeholder="Enter custom category"
                          className="w-full"
                        />
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newCost.amount}
                      onChange={(e) => setNewCost({...newCost, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      value={newCost.description}
                      onChange={(e) => setNewCost({...newCost, description: e.target.value})}
                      placeholder="What was purchased?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input
                      value={newCost.vendor}
                      onChange={(e) => setNewCost({...newCost, vendor: e.target.value})}
                      placeholder="Where was it purchased?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateIncurred">Date</Label>
                    <Input
                      type="date"
                      value={newCost.dateIncurred}
                      onChange={(e) => setNewCost({...newCost, dateIncurred: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      value={newCost.notes}
                      onChange={(e) => setNewCost({...newCost, notes: e.target.value})}
                      placeholder="Additional notes..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="receipt">Receipt Photo (optional)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a photo of your receipt to keep track of expenses
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleAddCost} 
                  className="mt-4"
                  disabled={addCostMutation.isPending}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Cost
                </Button>
              </CardContent>
            </Card>

            {/* Costs List */}
            <Card>
              <CardHeader>
                <CardTitle>Cost History</CardTitle>
              </CardHeader>
              <CardContent>
                {costs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No costs recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {costs.map((cost: ProjectCost) => (
                      <div key={cost.id} className="flex justify-between items-start p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{cost.category}</Badge>
                            <span className="font-medium">{cost.description}</span>
                            {cost.receipt && (
                              <Badge variant="secondary" className="text-xs">
                                📄 Receipt
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {cost.vendor && `${cost.vendor} • `}
                            {new Date(cost.dateIncurred).toLocaleDateString()}
                          </div>
                          {cost.notes && (
                            <div className="text-sm text-muted-foreground mt-1">{cost.notes}</div>
                          )}
                          {cost.receipt && (
                            <div className="mt-2">
                              <img 
                                src={cost.receipt} 
                                alt="Receipt" 
                                className="w-24 h-24 object-cover rounded border cursor-pointer hover:opacity-80"
                                onClick={() => setViewingReceipt(cost.receipt || '')}
                              />
                              <p className="text-xs text-muted-foreground mt-1">Click to view full size</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">${parseFloat(cost.amount).toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCostMutation.mutate(cost.id)}
                            disabled={deleteCostMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="space-y-6">
            {/* AI Timeline Generation */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Project Timeline</CardTitle>
                  <Button
                    onClick={() => generateTimelineMutation.mutate()}
                    disabled={generateTimelineMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {generateTimelineMutation.isPending ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Target className="mr-2 h-4 w-4" />
                        Generate AI Timeline
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Let AI create a complete project timeline with intelligent milestones based on your project description. 
                  Perfect for construction phases like foundation, framing, electrical, plumbing, and finishing work.
                </p>
              </CardHeader>
            </Card>

            {/* Add Milestone Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Milestone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="preset">Quick Add Construction Phase</Label>
                    <Select onValueChange={(value) => {
                      const preset = constructionPresets[parseInt(value)];
                      if (preset) {
                        setNewMilestone({
                          title: preset.title,
                          description: preset.description,
                          dueDate: '',
                          order: milestones.length + 1,
                          progressWeight: preset.weight
                        });
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a construction phase or create custom..." />
                      </SelectTrigger>
                      <SelectContent>
                        {constructionPresets.map((preset, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {preset.title} ({preset.weight}% weight)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Milestone Title</Label>
                    <Input
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                      placeholder="What needs to be completed?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      type="date"
                      value={newMilestone.dueDate}
                      onChange={(e) => setNewMilestone({...newMilestone, dueDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="progressWeight">Progress Weight (%)</Label>
                    <div className="flex items-center space-x-2">
                      <Select onValueChange={(value) => {
                        if (value === "custom") {
                          // Keep current value for custom input
                          return;
                        }
                        setNewMilestone({...newMilestone, progressWeight: parseInt(value)});
                      }}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select weight" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                          <SelectItem value="15">15%</SelectItem>
                          <SelectItem value="20">20%</SelectItem>
                          <SelectItem value="25">25%</SelectItem>
                          <SelectItem value="30">30%</SelectItem>
                          <SelectItem value="35">35%</SelectItem>
                          <SelectItem value="40">40%</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={newMilestone.progressWeight}
                        onChange={(e) => setNewMilestone({...newMilestone, progressWeight: parseInt(e.target.value) || 1})}
                        className="w-20"
                        placeholder="Custom"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="order">Order</Label>
                    <Input
                      type="number"
                      value={newMilestone.order}
                      onChange={(e) => setNewMilestone({...newMilestone, order: parseInt(e.target.value) || 1})}
                      placeholder="Sequence order"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                      placeholder="Additional details..."
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleAddMilestone} 
                  className="mt-4"
                  disabled={addMilestoneMutation.isPending}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Milestone
                </Button>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{project.completionPercentage || 0}%</span>
                    </div>
                    <Progress value={project.completionPercentage || 0} className="h-3" />
                  </div>
                  {milestones.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="ml-2 font-medium">
                          {milestones.filter((m: ProjectMilestone) => m.status === 'completed').length} of {milestones.length}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Weight:</span>
                        <span className="ml-2 font-medium">
                          {milestones.reduce((sum: number, m: ProjectMilestone) => sum + (m.progressWeight || 10), 0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Milestones List */}
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {milestones.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No milestones created yet.</p>
                ) : (
                  <div className="space-y-4">
                    {milestones.map((milestone: ProjectMilestone) => (
                      <div key={milestone.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleMilestone(milestone)}
                          disabled={updateMilestoneMutation.isPending}
                        >
                          <Check className={`h-4 w-4 ${milestone.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'}`} />
                        </Button>
                        
                        {editingMilestone === milestone.id ? (
                          <div className="flex-1 space-y-3">
                            <Input
                              value={editMilestoneData.title}
                              onChange={(e) => setEditMilestoneData({...editMilestoneData, title: e.target.value})}
                              placeholder="Milestone title"
                              className="font-medium"
                            />
                            <Textarea
                              value={editMilestoneData.description}
                              onChange={(e) => setEditMilestoneData({...editMilestoneData, description: e.target.value})}
                              placeholder="Description (optional)"
                              className="text-sm"
                              rows={2}
                            />
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`weight-${milestone.id}`} className="text-sm">Weight:</Label>
                              <div className="flex items-center space-x-2">
                                <Select 
                                  value={editMilestoneData.progressWeight.toString()} 
                                  onValueChange={(value) => {
                                    if (value === "custom") {
                                      // Keep current value for custom input
                                      return;
                                    }
                                    setEditMilestoneData({...editMilestoneData, progressWeight: parseInt(value)});
                                  }}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="5">5%</SelectItem>
                                    <SelectItem value="10">10%</SelectItem>
                                    <SelectItem value="15">15%</SelectItem>
                                    <SelectItem value="20">20%</SelectItem>
                                    <SelectItem value="25">25%</SelectItem>
                                    <SelectItem value="30">30%</SelectItem>
                                    <SelectItem value="35">35%</SelectItem>
                                    <SelectItem value="40">40%</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={editMilestoneData.progressWeight}
                                  onChange={(e) => setEditMilestoneData({...editMilestoneData, progressWeight: parseInt(e.target.value) || 1})}
                                  className="w-16 text-sm"
                                  placeholder="Custom"
                                />
                                <span className="text-xs text-muted-foreground">%</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={saveEditedMilestone} disabled={updateMilestoneMutation.isPending}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEditingMilestone}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${milestone.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                {milestone.title}
                              </span>
                              <Badge variant={milestone.status === 'completed' ? 'outline' : 'default'}>
                                {milestone.status}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {milestone.progressWeight || 10}% weight
                              </Badge>
                            </div>
                            {milestone.description && (
                              <div className="text-sm text-muted-foreground mt-1">{milestone.description}</div>
                            )}
                            <div className="text-sm text-muted-foreground mt-1">
                              {milestone.dueDate && `Due: ${new Date(milestone.dueDate).toLocaleDateString()}`}
                              {milestone.completedDate && ` • Completed: ${new Date(milestone.completedDate).toLocaleDateString()}`}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          {editingMilestone !== milestone.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingMilestone(milestone)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMilestoneMutation.mutate(milestone.id)}
                            disabled={deleteMilestoneMutation.isPending}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="photos">
          <div className="space-y-6">
            {/* Upload Photo Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add Photos</CardTitle>
                <p className="text-sm text-muted-foreground">Upload single photos or multiple photos at once (up to 50MB total)</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Single Photo Upload */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="single-photo">Single Photo</Label>
                      <Input
                        id="single-photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newPhoto.category} onValueChange={(value) => setNewPhoto({...newPhoto, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="before">Before</SelectItem>
                          <SelectItem value="progress">Progress</SelectItem>
                          <SelectItem value="after">After</SelectItem>
                          <SelectItem value="materials">Materials</SelectItem>
                          <SelectItem value="issues">Issues</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="caption">Caption (for single photo)</Label>
                      <Input
                        value={newPhoto.caption}
                        onChange={(e) => setNewPhoto({...newPhoto, caption: e.target.value})}
                        placeholder="Describe this photo..."
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleAddPhoto} 
                      disabled={addPhotoMutation.isPending || !newPhoto.filePath}
                      variant="outline"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Single Photo
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="multiple-photos">Multiple Photos (Bulk Upload)</Label>
                      <p className="text-xs text-muted-foreground">Select multiple images to upload with the selected category</p>
                      <Input
                        id="multiple-photos"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultiplePhotoUpload}
                        disabled={uploadingPhotos.length > 0}
                      />
                    </div>
                    
                    {uploadingPhotos.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium">Uploading Photos...</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {uploadingPhotos.map((photo, index) => (
                            <div key={index} className="flex items-center space-x-3 text-sm">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="truncate">{photo.fileName}</span>
                                  <Badge variant="outline" className="text-xs">{photo.category}</Badge>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div 
                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                    style={{ width: `${photo.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">{photo.progress}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photos Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Project Photos</CardTitle>
              </CardHeader>
              <CardContent>
                {photos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No photos uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {photos.map((photo: ProjectPhoto) => (
                      <div key={photo.id} className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="bg-gray-100 h-48 relative overflow-hidden group">
                          <img
                            src={photo.filePath}
                            alt={photo.caption || photo.fileName}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                              const fallback = document.createElement('div');
                              fallback.className = 'text-center';
                              fallback.innerHTML = '<div class="h-12 w-12 text-muted-foreground mx-auto mb-2"><svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div><div class="text-xs text-muted-foreground">Image not found</div>';
                              e.currentTarget.parentElement?.appendChild(fallback);
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <button 
                              className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-2 transform scale-75 group-hover:scale-100 transition-all duration-300"
                              onClick={() => setSelectedPhoto(photo)}
                            >
                              <Eye className="h-4 w-4 text-gray-700" />
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{photo.category}</Badge>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                {new Date(photo.uploadedAt).toLocaleDateString()}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deletePhotoMutation.mutate(photo.id)}
                                disabled={deletePhotoMutation.isPending}
                                className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {photo.caption && (
                            <p className="text-sm">{photo.caption}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* View All Photos Button */}
                {photos.length > 0 && (
                  <div className="text-center mt-4">
                    <Link href={`/projects/${project.id}/gallery`}>
                      <Button variant="outline">
                        View All Photos ({photos.length > 4 ? `${photos.length} total` : 'Gallery'})
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="space-y-6">
            {/* Upload Document Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="document">Select Document</Label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                      onChange={handleDocumentUpload}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newDocument.category} onValueChange={(value) => setNewDocument({...newDocument, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contracts">Contracts</SelectItem>
                        <SelectItem value="permits">Permits</SelectItem>
                        <SelectItem value="invoices">Invoices</SelectItem>
                        <SelectItem value="estimates">Estimates</SelectItem>
                        <SelectItem value="plans">Plans</SelectItem>
                        <SelectItem value="receipts">Receipts</SelectItem>
                        <SelectItem value="warranties">Warranties</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      value={newDocument.description}
                      onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                      placeholder="Describe this document..."
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleAddDocument} 
                  className="mt-4"
                  disabled={addDocumentMutation.isPending}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Project Documents ({documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents uploaded yet.</p>
                    <p className="text-sm text-muted-foreground">Upload contracts, permits, invoices, and other project documents.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc: ProjectDocument) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{doc.fileName}</h4>
                            {doc.description && (
                              <p className="text-sm text-muted-foreground">{doc.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-1">
                              <Badge variant="outline">{doc.category}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {(doc.fileSize / 1024).toFixed(1)} KB
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = doc.filePath;
                              link.download = doc.fileName;
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteDocumentMutation.mutate(doc.id)}
                            disabled={deleteDocumentMutation.isPending}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Receipt Viewing Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setViewingReceipt(null)}>
          <div className="relative max-w-4xl max-h-full">
            <img
              src={viewingReceipt}
              alt="Receipt"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
              onClick={() => setViewingReceipt(null)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-60 text-white p-3 rounded">
              <p className="text-sm">Receipt Image</p>
              <p className="text-xs opacity-75 mt-1">Click outside to close</p>
            </div>
          </div>
        </div>
      )}

      {/* Photo Expansion Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedPhoto.filePath}
              alt={selectedPhoto.caption || selectedPhoto.fileName}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
              onClick={() => setSelectedPhoto(null)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {selectedPhoto.caption && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-60 text-white p-3 rounded">
                <p className="text-sm">{selectedPhoto.caption}</p>
                <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                  <span>{selectedPhoto.category}</span>
                  <span>{new Date(selectedPhoto.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}