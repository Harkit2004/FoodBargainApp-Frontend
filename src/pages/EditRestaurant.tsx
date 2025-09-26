import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MobileLayout } from '@/components/MobileLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { Save, Loader2, Store, MapPin, Phone, Clock } from 'lucide-react';
import { partnerService, Restaurant } from '@/services/partnerService';

export const EditRestaurant: React.FC = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { toast } = useToast();
  const { getToken } = useClerkAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    streetAddress: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    latitude: '',
    longitude: '',
    openingTime: '',
    closingTime: '',
    isActive: true,
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) return;
      
      try {
        const token = await getToken();
        if (!token) return;

        setIsLoadingRestaurant(true);
        const response = await partnerService.getRestaurant(parseInt(restaurantId), token);

        if (response.success) {
          setRestaurant(response.data);
          setFormData({
            name: response.data.name,
            description: response.data.description || '',
            streetAddress: response.data.streetAddress || '',
            city: response.data.city || '',
            province: response.data.province || '',
            postalCode: response.data.postalCode || '',
            phone: response.data.phone || '',
            latitude: response.data.latitude?.toString() || '',
            longitude: response.data.longitude?.toString() || '',
            openingTime: response.data.openingTime || '',
            closingTime: response.data.closingTime || '',
            isActive: response.data.isActive,
          });
        } else {
          throw new Error(response.error || 'Failed to fetch restaurant');
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        toast({
          title: "Error",
          description: "Failed to load restaurant details. Please try again.",
          variant: "destructive",
        });
        navigate('/partner');
      } finally {
        setIsLoadingRestaurant(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId, getToken, toast, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
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
        description: "Restaurant name is required",
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

      const updateData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        streetAddress: formData.streetAddress?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        province: formData.province?.trim() || undefined,
        postalCode: formData.postalCode?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        openingTime: formData.openingTime || undefined,
        closingTime: formData.closingTime || undefined,
        isActive: formData.isActive,
      };

      const response = await partnerService.updateRestaurant(parseInt(restaurantId), updateData, token);

      if (response.success) {
        toast({
          title: "Success",
          description: "Restaurant updated successfully",
        });
        navigate('/partner');
      } else {
        throw new Error(response.error || 'Failed to update restaurant');
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update restaurant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingRestaurant) {
    return (
      <MobileLayout
        showHeader={true}
        headerTitle="Manage Restaurant"
        showBackButton={true}
        onBackClick={() => navigate('/partner')}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading restaurant details...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!restaurant) {
    return (
      <MobileLayout
        showHeader={true}
        headerTitle="Manage Restaurant"
        showBackButton={true}
        onBackClick={() => navigate('/partner')}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Restaurant Not Found</h3>
            <p className="text-muted-foreground">
              The restaurant you're looking for doesn't exist or you don't have permission to access it.
            </p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      showHeader={true}
      headerTitle="Manage Restaurant"
      showBackButton={true}
      onBackClick={() => navigate('/partner')}
    >
      <div className="px-mobile py-4 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter restaurant name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              className="h-12"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your restaurant, cuisine type, specialties..."
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Address</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input
                id="streetAddress"
                name="streetAddress"
                type="text"
                placeholder="123 Main Street"
                value={formData.streetAddress}
                onChange={handleInputChange}
                disabled={isLoading}
                className="h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Toronto"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  name="province"
                  type="text"
                  placeholder="ON"
                  value={formData.province}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                type="text"
                placeholder="M5V 3A8"
                value={formData.postalCode}
                onChange={handleInputChange}
                disabled={isLoading}
                className="h-12"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Contact</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isLoading}
                className="h-12"
              />
            </div>
          </div>

          {/* Location Coordinates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Coordinates (Optional)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="43.6532"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="-79.3832"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Operating Hours</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="openingTime">Opening Time</Label>
                <Input
                  id="openingTime"
                  name="openingTime"
                  type="time"
                  value={formData.openingTime}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closingTime">Closing Time</Label>
                <Input
                  id="closingTime"
                  name="closingTime"
                  type="time"
                  value={formData.closingTime}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
            </div>
          </div>

          {/* Restaurant Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Restaurant Active</Label>
              <p className="text-sm text-muted-foreground">
                Active restaurants are visible to customers
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleActiveChange}
              disabled={isLoading}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/partner')}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
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
                  Update Restaurant
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
};