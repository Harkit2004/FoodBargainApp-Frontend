import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileLayout } from '@/components/MobileLayout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { Calendar, Clock, Percent, MapPin, Loader2 } from 'lucide-react';
import { cuisineService, type CuisineType, type DietaryPreference } from '@/services/cuisineService';
import { restaurantService, type Restaurant } from '@/services/restaurantService';
import { partnerService } from '@/services/partnerService';

interface DealFormData {
  title: string;
  description: string;
  restaurantId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  cuisineIds: number[];
  dietaryPreferenceIds: number[];
  maxClaims: string;
  isActive: boolean;
}



export const CreateDeal: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getToken } = useClerkAuth();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Backend data
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);
  
  const [formData, setFormData] = useState<DealFormData>({
    title: '',
    description: '',
    restaurantId: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    cuisineIds: [],
    dietaryPreferenceIds: [],
    maxClaims: '',
    isActive: true,
  });

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        
        // Fetch partner's restaurants
        const restaurantsResponse = await restaurantService.getPartnerRestaurants(token);
        if (restaurantsResponse.success && restaurantsResponse.data) {
          setRestaurants(restaurantsResponse.data);
        } else {
          console.error('Failed to fetch restaurants:', restaurantsResponse.error);
        }

        // Fetch cuisine types
        const cuisineResponse = await cuisineService.getCuisineTypes();
        if (cuisineResponse.success && cuisineResponse.data) {
          setCuisineTypes(cuisineResponse.data);
        } else {
          console.error('Failed to fetch cuisine types:', cuisineResponse.error);
        }

        // Fetch dietary preferences
        const dietaryResponse = await cuisineService.getDietaryPreferences();
        if (dietaryResponse.success && dietaryResponse.data) {
          setDietaryPreferences(dietaryResponse.data);
        } else {
          console.error('Failed to fetch dietary preferences:', dietaryResponse.error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load form data. Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [getToken, toast]);

  const handleInputChange = (field: keyof DealFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'cuisineIds' | 'dietaryPreferenceIds', id: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter(item => item !== id)
        : [...prev[field], id]
    }));
  };

  const validateForm = () => {
    if (restaurants.length === 0) {
      toast({
        title: "No Restaurants Available",
        description: "You need to add a restaurant before creating deals.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a deal title",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.restaurantId) {
      toast({
        title: "Select Restaurant",
        description: "Please select a restaurant for this deal",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Missing Dates",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return false;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast({
        title: "Invalid Date Range",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await getToken();
      
      const dealData = {
        title: formData.title,
        description: formData.description,
        restaurantId: parseInt(formData.restaurantId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        cuisineIds: formData.cuisineIds,
        dietaryPreferenceIds: formData.dietaryPreferenceIds,
      };

      const response = await partnerService.createDeal(dealData, token);
      
      if (response.success) {
        toast({
          title: "Deal Created Successfully!",
          description: `${formData.title} has been created and is now live.`,
        });
        navigate('/partner');
      } else {
        toast({
          title: "Failed to Create Deal",
          description: response.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      toast({
        title: "Failed to Create Deal",
        description: "Something went wrong. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout
      showHeader={true}
      headerTitle="Create New Deal"
      showBackButton={true}
      onBackClick={() => navigate('/partner')}
    >
      <div className="px-mobile py-4">
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading form data...</p>
            </div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-card rounded-xl p-6 shadow-custom-sm text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-2">No Restaurants Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You need to add a restaurant before you can create deals.
            </p>
            <Button 
              variant="default"
              onClick={() => navigate('/partner')}
            >
              Go Back to Dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-card rounded-xl p-4 shadow-custom-sm">
            <h3 className="text-lg font-semibold mb-4">📋 Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Deal Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. 50% Off All Pizzas"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your amazing deal..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="restaurant">Restaurant *</Label>
                <Select value={formData.restaurantId} onValueChange={(value) => handleInputChange('restaurantId', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.length > 0 ? (
                      restaurants.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                          {restaurant.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No restaurants found - Please add a restaurant first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-card rounded-xl p-4 shadow-custom-sm">
            <h3 className="text-lg font-semibold mb-4">📅 Schedule</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startTime">Start Time (Optional)</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time (Optional)</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxClaims">Maximum Claims (Optional)</Label>
                <Input
                  id="maxClaims"
                  type="number"
                  min="1"
                  placeholder="Leave empty for unlimited"
                  value={formData.maxClaims}
                  onChange={(e) => handleInputChange('maxClaims', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-card rounded-xl p-4 shadow-custom-sm">
            <h3 className="text-lg font-semibold mb-4">🏷️ Categories</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Cuisine Types</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {cuisineTypes.map((cuisine) => (
                    <div
                      key={cuisine.id}
                      onClick={() => handleArrayToggle('cuisineIds', cuisine.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.cuisineIds.includes(cuisine.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-center">
                        <span className="text-xl block mb-1">🍽️</span>
                        <span className="text-xs font-medium">{cuisine.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Dietary Preferences</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {dietaryPreferences.map((dietary) => (
                    <div
                      key={dietary.id}
                      onClick={() => handleArrayToggle('dietaryPreferenceIds', dietary.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.dietaryPreferenceIds.includes(dietary.id)
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <div className="text-center">
                        <span className="text-xl block mb-1">🏷️</span>
                        <span className="text-xs font-medium">{dietary.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-20">
            <Button 
              type="submit" 
              variant="mobile" 
              size="mobile" 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating Deal...' : 'Create Deal 🚀'}
            </Button>
          </div>
          </form>
        )}
      </div>
    </MobileLayout>
  );
};