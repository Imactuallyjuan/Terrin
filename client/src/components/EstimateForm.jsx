import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calculator, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EstimateForm({ onEstimateComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    squareFootage: '',
    projectType: '',
    budget: ''
  });
  const { toast } = useToast();

  const projectTypes = [
    'Kitchen Renovation',
    'Bathroom Remodel',
    'Home Addition',
    'Basement Finishing',
    'Roof Replacement',
    'Deck/Patio Construction',
    'Flooring Installation',
    'Interior Painting',
    'Exterior Siding',
    'HVAC Installation',
    'Electrical Work',
    'Plumbing',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.location || !formData.squareFootage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to get estimate: ${response.statusText}`);
      }

      const estimate = await response.json();
      
      toast({
        title: "Estimate Generated",
        description: "Your construction cost estimate is ready!",
      });

      if (onEstimateComplete) {
        onEstimateComplete(estimate);
      }

      setIsOpen(false);
      setFormData({
        description: '',
        location: '',
        squareFootage: '',
        projectType: '',
        budget: ''
      });

    } catch (error) {
      console.error('Error getting estimate:', error);
      toast({
        title: "Estimate Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <Calculator className="h-5 w-5 mr-2" />
          Get AI Cost Estimate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>AI Cost Estimator</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your construction project in detail..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="City, State"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="squareFootage">Square Footage *</Label>
              <Input
                id="squareFootage"
                type="number"
                placeholder="1200"
                value={formData.squareFootage}
                onChange={(e) => handleInputChange('squareFootage', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="projectType">Project Type</Label>
              <Select value={formData.projectType} onValueChange={(value) => handleInputChange('projectType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type..." />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="budget">Budget Range (Optional)</Label>
              <Input
                id="budget"
                placeholder="$50,000 - $100,000"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Estimate...
                </>
              ) : (
                'Get Estimate'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}