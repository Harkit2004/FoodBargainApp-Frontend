import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MobileLayout } from '@/components/MobileLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { Save, Loader2 } from 'lucide-react';
import { menuService, CreateMenuSectionData } from '@/services/menuService';

export const CreateMenuSection: React.FC = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { toast } = useToast();
  const { getToken } = useClerkAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CreateMenuSectionData>({
    title: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurantId) {
      toast({
        title: "Error",
        description: "Restaurant ID is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Error", 
        description: "Section title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const response = await menuService.createMenuSection(
        parseInt(restaurantId),
        {
          title: formData.title.trim(),
          description: formData.description?.trim() || undefined,
        },
        token
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Menu section created successfully",
        });
        navigate(`/partner/restaurants/${restaurantId}/menu`);
      } else {
        throw new Error(response.error || 'Failed to create menu section');
      }
    } catch (error) {
      console.error('Error creating menu section:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create menu section",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileLayout
      showHeader={true}
      headerTitle="Create Menu Section"
      showBackButton={true}
      onBackClick={() => navigate(`/partner/restaurants/${restaurantId}/menu`)}
    >
      <div className="px-mobile py-4 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Section Title *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Appetizers, Main Courses, Desserts"
              value={formData.title}
              onChange={handleInputChange}
              disabled={isLoading}
              className="h-12"
              required
            />
          </div>

          {/* Section Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description of this menu section..."
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/partner/restaurants/${restaurantId}/menu`)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Section
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
};