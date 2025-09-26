import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MobileLayout } from '@/components/MobileLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { Save, Loader2 } from 'lucide-react';
import { menuService, MenuSection } from '@/services/menuService';

export const EditMenuSection: React.FC = () => {
  const navigate = useNavigate();
  const { restaurantId, sectionId } = useParams<{ restaurantId: string; sectionId: string }>();
  const { toast } = useToast();
  const { getToken } = useClerkAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSection, setIsLoadingSection] = useState(true);
  const [section, setSection] = useState<MenuSection | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    const fetchSection = async () => {
      if (!restaurantId || !sectionId) return;
      
      try {
        const token = await getToken();
        if (!token) return;

        setIsLoadingSection(true);
        const response = await menuService.getMenuSection(
          parseInt(restaurantId),
          parseInt(sectionId),
          token
        );

        if (response.success) {
          setSection(response.data);
          setFormData({
            title: response.data.title,
            description: response.data.description || '',
          });
        } else {
          throw new Error(response.error || 'Failed to fetch section');
        }
      } catch (error) {
        console.error('Error fetching menu section:', error);
        toast({
          title: "Error",
          description: "Failed to load menu section. Please try again.",
          variant: "destructive",
        });
        navigate(`/partner/restaurants/${restaurantId}/menu`);
      } finally {
        setIsLoadingSection(false);
      }
    };

    fetchSection();
  }, [restaurantId, sectionId, getToken, toast, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurantId || !sectionId) {
      toast({
        title: "Error",
        description: "Restaurant and section IDs are required",
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

      const response = await menuService.updateMenuSection(
        parseInt(restaurantId),
        parseInt(sectionId),
        {
          title: formData.title.trim(),
          description: formData.description?.trim() || undefined,
        },
        token
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Menu section updated successfully",
        });
        navigate(`/partner/restaurants/${restaurantId}/menu`);
      } else {
        throw new Error(response.error || 'Failed to update menu section');
      }
    } catch (error) {
      console.error('Error updating menu section:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update menu section",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingSection) {
    return (
      <MobileLayout
        showHeader={true}
        headerTitle="Edit Menu Section"
        showBackButton={true}
        onBackClick={() => navigate(`/partner/restaurants/${restaurantId}/menu`)}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading section...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!section) {
    return (
      <MobileLayout
        showHeader={true}
        headerTitle="Edit Menu Section"
        showBackButton={true}
        onBackClick={() => navigate(`/partner/restaurants/${restaurantId}/menu`)}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Section not found</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      showHeader={true}
      headerTitle="Edit Menu Section"
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Section
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
};