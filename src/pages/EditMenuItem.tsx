import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MobileLayout } from '@/components/MobileLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { Save, Loader2, DollarSign } from 'lucide-react';
import { menuService, MenuSection, MenuItem, CreateMenuItemData } from '@/services/menuService';
import { priceToCents, centsToPrice } from '@/utils/priceUtils';

export const EditMenuItem: React.FC = () => {
  const navigate = useNavigate();
  const { restaurantId, itemId } = useParams<{ restaurantId: string; itemId: string }>();
  const { toast } = useToast();
  const { getToken } = useClerkAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [item, setItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState<CreateMenuItemData & { price: string }>({
    name: '',
    description: '',
    price: '',
    priceCents: 0,
    imageUrl: '',
    isAvailable: true,
    sectionId: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId || !itemId) return;
      
      try {
        const token = await getToken();
        if (!token) return;

        setIsLoadingData(true);

        // Fetch sections and item data in parallel
        const [sectionsResponse, itemResponse] = await Promise.all([
          menuService.getMenuSections(parseInt(restaurantId), token),
          // Note: We need to fetch the item through sections since we don't have direct item endpoint
          menuService.getMenuSections(parseInt(restaurantId), token)
        ]);

        if (sectionsResponse.success) {
          setSections(sectionsResponse.data);
          
          // Find the item in the sections
          let foundItem: MenuItem | null = null;
          for (const section of sectionsResponse.data) {
            if (section.items) {
              const itemInSection = section.items.find(i => i.id === parseInt(itemId));
              if (itemInSection) {
                foundItem = itemInSection;
                break;
              }
            }
          }

          if (foundItem) {
            setItem(foundItem);
            
            setFormData({
              name: foundItem.name,
              description: foundItem.description || '',
              price: centsToPrice(foundItem.priceCents),
              priceCents: foundItem.priceCents,
              imageUrl: foundItem.imageUrl || '',
              isAvailable: foundItem.isAvailable,
              sectionId: foundItem.sectionId,
            });
          } else {
            throw new Error('Menu item not found');
          }
        } else {
          throw new Error(sectionsResponse.error || 'Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
        toast({
          title: "Error",
          description: "Failed to load menu item. Please try again.",
          variant: "destructive",
        });
        navigate(`/partner/restaurants/${restaurantId}/menu`);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [restaurantId, itemId, getToken, toast, navigate]);

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
    
    if (!restaurantId || !itemId) {
      toast({
        title: "Error",
        description: "Restaurant and item IDs are required",
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
      
      const submitData: Partial<CreateMenuItemData> = {
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

      const response = await menuService.updateMenuItem(
        parseInt(restaurantId),
        parseInt(itemId),
        submitData,
        token
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Menu item updated successfully",
        });
        navigate(`/partner/restaurants/${restaurantId}/menu`);
      } else {
        throw new Error(response.error || 'Failed to update menu item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update menu item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <MobileLayout
        showHeader={true}
        headerTitle="Edit Menu Item"
        showBackButton={true}
        onBackClick={() => navigate(`/partner/restaurants/${restaurantId}/menu`)}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading menu item...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!item) {
    return (
      <MobileLayout
        showHeader={true}
        headerTitle="Edit Menu Item"
        showBackButton={true}
        onBackClick={() => navigate(`/partner/restaurants/${restaurantId}/menu`)}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Menu item not found</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      showHeader={true}
      headerTitle="Edit Menu Item"
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Item
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
};