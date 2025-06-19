import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Edit
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
    notes: ''
  });

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
    order: 1,
    progressWeight: 10
  });

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

  // Data queries
  const { data: costs = [] } = useQuery<ProjectCost[]>({
    queryKey: [`/api/projects/${project.id}/costs`],
  });

  const { data: milestones = [] } = useQuery<ProjectMilestone[]>({
    queryKey: [`/api/projects/${project.id}/milestones`],
  });

  const { data: photos = [] } = useQuery<ProjectPhoto[]>({
    queryKey: [`/api/projects/${project.id}/photos`],
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
        notes: ''
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
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/photos`] });
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
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a file storage service
      const mockPath = `/uploads/${file.name}`;
      setNewPhoto({
        ...newPhoto,
        fileName: file.name,
        filePath: mockPath
      });
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

  // Calculate total costs
  const totalCosts = costs.reduce((sum: number, cost: ProjectCost) => {
    return sum + parseFloat(cost.amount || '0');
  }, 0);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Budget: {project.budgetRange}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Timeline: {project.timeline}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Progress: {project.completionPercentage}%</span>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={project.completionPercentage} className="w-full" />
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
                    <span className="font-semibold">{project.completionPercentage}%</span>
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
                    <Select value={newCost.category} onValueChange={(value) => setNewCost({...newCost, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="materials">Materials</SelectItem>
                        <SelectItem value="labor">Labor</SelectItem>
                        <SelectItem value="permits">Permits</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <div key={cost.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{cost.category}</Badge>
                            <span className="font-medium">{cost.description}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {cost.vendor && `${cost.vendor} • `}
                            {new Date(cost.dateIncurred).toLocaleDateString()}
                          </div>
                          {cost.notes && (
                            <div className="text-sm text-muted-foreground mt-1">{cost.notes}</div>
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
                    <Select onValueChange={(value) => setNewMilestone({...newMilestone, progressWeight: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue placeholder={newMilestone.progressWeight.toString()} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">Minor Task (2%)</SelectItem>
                        <SelectItem value="5">Small Phase (5%)</SelectItem>
                        <SelectItem value="8">Medium Phase (8%)</SelectItem>
                        <SelectItem value="10">Standard Phase (10%)</SelectItem>
                        <SelectItem value="15">Major Phase (15%)</SelectItem>
                        <SelectItem value="20">Critical Phase (20%)</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <div key={milestone.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleMilestone(milestone)}
                          disabled={updateMilestoneMutation.isPending}
                        >
                          <Check className={`h-4 w-4 ${milestone.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'}`} />
                        </Button>
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
                <CardTitle>Add New Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="photo">Select Photo</Label>
                    <Input
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
                    <Label htmlFor="caption">Caption</Label>
                    <Input
                      value={newPhoto.caption}
                      onChange={(e) => setNewPhoto({...newPhoto, caption: e.target.value})}
                      placeholder="Describe this photo..."
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleAddPhoto} 
                  className="mt-4"
                  disabled={addPhotoMutation.isPending}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Project Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Document management coming soon.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload contracts, permits, and other project documents.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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