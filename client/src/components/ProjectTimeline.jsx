import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Plus,
  Edit3,
  Calendar,
  TrendingUp
} from 'lucide-react';

const statusColors = {
  planning: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export default function ProjectTimeline({ projectId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [projectUpdates, setProjectUpdates] = useState({
    status: '',
    priority: '',
    completionPercentage: '',
    notes: ''
  });

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId
  });

  // Fetch project updates/timeline
  const { data: updates = [], isLoading } = useQuery({
    queryKey: ['/api/projects', projectId, 'updates'],
    enabled: !!projectId
  });

  // Mutation for updating project
  const updateProjectMutation = useMutation({
    mutationFn: async (updates) => {
      return await apiRequest(`/api/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/projects']);
      setEditingProject(false);
      toast({
        title: "Project Updated",
        description: "Project details have been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation for adding project update
  const addUpdateMutation = useMutation({
    mutationFn: async (updateData) => {
      return await apiRequest(`/api/projects/${projectId}/updates`, {
        method: 'POST',
        body: JSON.stringify(updateData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/projects', projectId, 'updates']);
      setShowUpdateForm(false);
      toast({
        title: "Update Added",
        description: "Project update has been added successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleProjectUpdate = () => {
    const updates = {};
    if (projectUpdates.status) updates.status = projectUpdates.status;
    if (projectUpdates.priority) updates.priority = projectUpdates.priority;
    if (projectUpdates.completionPercentage !== '') {
      updates.completionPercentage = parseInt(projectUpdates.completionPercentage);
    }
    if (projectUpdates.notes) updates.notes = projectUpdates.notes;

    updateProjectMutation.mutate(updates);
  };

  const handleAddUpdate = () => {
    addUpdateMutation.mutate({
      updateType: 'note',
      title: 'Project Note',
      description: projectUpdates.notes || 'General project update'
    });
    setProjectUpdates({ status: '', priority: '', completionPercentage: '', notes: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUpdateIcon = (updateType) => {
    switch (updateType) {
      case 'status_change': return CheckCircle;
      case 'progress': return TrendingUp;
      case 'milestone': return Calendar;
      default: return FileText;
    }
  };

  if (!project) return <div>Loading project details...</div>;

  return (
    <div className="space-y-6">
      {/* Project Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingProject(!editingProject)}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              {editingProject ? (
                <Select 
                  value={projectUpdates.status || project.status}
                  onValueChange={(value) => setProjectUpdates(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={statusColors[project.status] || 'bg-gray-100 text-gray-800'}>
                  {project.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Priority</label>
              {editingProject ? (
                <Select 
                  value={projectUpdates.priority || project.priority}
                  onValueChange={(value) => setProjectUpdates(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={priorityColors[project.priority] || 'bg-gray-100 text-gray-800'}>
                  {project.priority?.toUpperCase()}
                </Badge>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Progress</label>
              {editingProject ? (
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Completion %"
                  value={projectUpdates.completionPercentage}
                  onChange={(e) => setProjectUpdates(prev => ({ ...prev, completionPercentage: e.target.value }))}
                />
              ) : (
                <div className="space-y-1">
                  <Progress value={project.completionPercentage || 0} className="h-2" />
                  <span className="text-sm text-gray-600">{project.completionPercentage || 0}% Complete</span>
                </div>
              )}
            </div>
          </div>

          {editingProject && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <Textarea
                  placeholder="Add project notes..."
                  value={projectUpdates.notes}
                  onChange={(e) => setProjectUpdates(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleProjectUpdate} disabled={updateProjectMutation.isPending}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingProject(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Project Timeline</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpdateForm(!showUpdateForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Update
          </Button>
        </CardHeader>
        <CardContent>
          {showUpdateForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <Textarea
                placeholder="Add a project update or note..."
                value={projectUpdates.notes}
                onChange={(e) => setProjectUpdates(prev => ({ ...prev, notes: e.target.value }))}
                className="mb-3"
              />
              <div className="flex space-x-2">
                <Button 
                  onClick={handleAddUpdate}
                  disabled={addUpdateMutation.isPending || !projectUpdates.notes}
                  size="sm"
                >
                  Add Update
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpdateForm(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-4">Loading timeline...</div>
          ) : updates.length > 0 ? (
            <div className="space-y-4">
              {updates.map((update, index) => {
                const IconComponent = getUpdateIcon(update.updateType);
                return (
                  <div key={update.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">{update.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {update.updateType ? update.updateType.replace('_', ' ') : 'update'}
                        </Badge>
                      </div>
                      {update.description && (
                        <p className="text-sm text-gray-600 mt-1">{update.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDate(update.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No updates yet</p>
              <p className="text-sm">Add the first update to track project progress</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}