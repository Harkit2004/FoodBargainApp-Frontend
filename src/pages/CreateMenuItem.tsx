import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MobileLayout } from '@/components/MobileLayout';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { Save, Loader2, DollarSign } from 'lucide-react';
import { menuService, MenuSection, CreateMenuItemData } from '@/services/menuService';
import { priceToCents } from '@/utils/priceUtils';

export const CreateMenuItem: React.FC = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { getToken } = useClerkAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [sections, setSections] = useState<MenuSection[]>([]);

  const preselectedSectionId = searchParams.get('sectionId');

  const [formData, setFormData] = useState<CreateMenuItemData & { price: string }>({
    name: '',
    description: '',
    price: '',
    priceCents: 0,
    imageUrl: '',
    isAvailable: true,
    sectionId: preselectedSectionId ? parseInt(preselectedSectionId) : 0,
  });

  useEffect(() => {
    const fetchSections = async () => {
      if (!restaurantId) return;
      
      try {
        const token = await getToken();
        if (!token) return;

        setIsLoadingSections(true);
        const response = await menuService.getMenuSections(parseInt(restaurantId), token);

        if (response.success) {
          setSections(response.data);
          // If no preselected section and we have sections, select the first one
          if (!preselectedSectionId && response.data.length > 0) {
            setFormData(prev => ({ ...prev, sectionId: response.data[0].id }));
          }
        } else {
          throw new Error(response.error || 'Failed to fetch sections');
        }
      } catch (error) {
        console.error('Error fetching menu sections:', error);
        toast({
          title: "Error",
          description: "Failed to load menu sections. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSections(false);
      }
    };

    fetchSections();
  }, [restaurantId, preselectedSectionId, getToken, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Handle price input - convert to cents using utility function
      const cents = priceToCents(value);
      console.log('Price input change:', { value, cents }); // Debug log
      setFormData(prev => ({ 
        ...prev, 
        price: value,
        priceCents: cents
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSectionChange = (value: string) => {
    setFormData(prev => ({ ...prev, sectionId: parseInt(value) }));
  };

  const handleAvailabilityChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isAvailable: checked }));
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

    if (!formData.name.trim()) {
      toast({
        title: "Error", 
        description: "Item name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.sectionId) {
      toast({
        title: "Error", 
        description: "Please select a menu section",
        variant: "destructive",
      });
      return;
    }

    // Validate price using the current input value
    const currentPriceCents = priceToCents(formData.price);
    if (currentPriceCents <= 0) {
      toast({
        title: "Error", 
        description: "Please enter a valid price",
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

      // Ensure price is properly converted before submission
      const finalPriceCents = priceToCents(formData.price);
      
      const submitData: CreateMenuItemData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        priceCents: finalPriceCents,
        imageUrl: formData.imageUrl?.trim() || undefined,
        isAvailable: formData.isAvailable,
        sectionId: formData.sectionId,
      };

      console.log('Debug - Price conversion:', {
        originalPrice: formData.price,
        storedPriceCents: formData.priceCents,
        finalPriceCents: finalPriceCents,
        submitData: submitData
      });

      const response = await menuService.createMenuItem(
        parseInt(restaurantId),
        submitData,
        token
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Menu item created successfully",
        });
        navigate(`/partner/restaurants/${restaurantId}/menu`);
      } else {
        throw new Error(response.error || 'Failed to create menu item');
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create menu item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingSections) {
    return (
      <MobileLayout
        showHeader={true}
        headerTitle="Create Menu Item"
        showBackButton={true}
        onBackClick={() => navigate(`/partner/restaurants/${restaurantId}/menu`)}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading sections...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (sections.length === 0) {
    return (
      <MobileLayout
        showHeader={true}
        headerTitle="Create Menu Item"
        showBackButton={true}
        onBackClick={() => navigate(`/partner/restaurants/${restaurantId}/menu`)}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No menu sections found</p>
            <p className="text-sm text-muted-foreground mb-6">You need to create at least one menu section before adding items.</p>
            <Button onClick={() => navigate(`/partner/restaurants/${restaurantId}/menu/sections/create`)}>
              Create Menu Section
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      showHeader={true}
      headerTitle="Create Menu Item"
      showBackButton={true}
      onBackClick={() => navigate(`/partner/restaurants/${restaurantId}/menu`)}
    >
      <div className="px-mobile py-4 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Margherita Pizza, Grilled Salmon"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              className="h-12"
              required
            />
          </div>

          {/* Menu Section */}
          <div className="space-y-2">
            <Label htmlFor="section">Menu Section *</Label>
            <Select 
              value={formData.sectionId.toString()} 
              onValueChange={handleSectionChange}
              disabled={isLoading}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select a menu section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id.toString()}>
                    {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={handleInputChange}
                disabled={isLoading}
                className="h-12 pl-10"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the dish, ingredients, allergens, etc..."
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={handleInputChange}
              disabled={isLoading}
              className="h-12"
            />
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="availability">Available for Order</Label>
              <p className="text-sm text-muted-foreground">
                Customers can order this item when available
              </p>
            </div>
            <Switch
              id="availability"
              checked={formData.isAvailable}
              onCheckedChange={handleAvailabilityChange}
              disabled={isLoading}
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
              disabled={isLoading || !formData.name.trim() || !formData.sectionId || formData.priceCents <= 0}
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
                  Create Item
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
};