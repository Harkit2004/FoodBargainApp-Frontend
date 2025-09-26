import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { Save, Loader2, X } from 'lucide-react';
import { partnerService, Deal, Restaurant as ServiceRestaurant } from '@/services/partnerService';
import { cuisineService, CuisineType, DietaryPreference } from '@/services/cuisineService';

interface DealFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  restaurantId: number;
  cuisineIds: number[];
  dietaryPreferenceIds: number[];
  status: 'draft' | 'active' | 'expired' | 'archived';
}

export const EditDeal: React.FC = () => {
  const navigate = useNavigate();
  const { dealId } = useParams<{ dealId: string }>();
  const { toast } = useToast();
  const { getToken } = useClerkAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<DealFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    restaurantId: 0,
    cuisineIds: [],
    dietaryPreferenceIds: [],
    status: 'draft'
  });
  
  const [restaurants, setRestaurants] = useState<ServiceRestaurant[]>([]);
  const [cuisines, setCuisines] = useState<CuisineType[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        setIsLoading(true);

        // Load deal data, restaurants, cuisines, and dietary preferences in parallel
        const [dealResponse, restaurantsResponse, cuisinesResponse, dietaryPrefsResponse] = await Promise.all([
          partnerService.getDeal(parseInt(dealId!), token),
          partnerService.getRestaurants(token),
          cuisineService.getCuisineTypes(),
          cuisineService.getDietaryPreferences()
        ]);

        // Handle restaurants
        if (restaurantsResponse.success) {
          setRestaurants(restaurantsResponse.data || []);
        }

        // Handle cuisines
        if (cuisinesResponse.success) {
          setCuisines(cuisinesResponse.data || []);
        }

        // Handle dietary preferences
        if (dietaryPrefsResponse.success) {
          setDietaryPreferences(dietaryPrefsResponse.data || []);
        }

        // Handle deal data
        if (dealResponse.success && dealResponse.data) {
          const deal = dealResponse.data;
          setFormData({
            title: deal.title,
            description: deal.description || '',
            startDate: deal.startDate, // Keep the date as is from backend (YYYY-MM-DD format)
            endDate: deal.endDate,
            restaurantId: deal.restaurant.id,
            cuisineIds: deal.cuisines?.map(c => c.id) || [],
            dietaryPreferenceIds: deal.dietaryPreferences?.map(dp => dp.id) || [],
            status: deal.status
          });
        } else {
          throw new Error(dealResponse.error || 'Failed to load deal');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load deal data. Please try again.",
          variant: "destructive",
        });
        navigate('/partner');
      } finally {
        setIsLoading(false);
      }
    };

    if (dealId) {
      loadData();
    }
  }, [dealId, getToken, toast, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.restaurantId) {
      newErrors.restaurantId = 'Restaurant is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      const token = await getToken();
      if (!token) return;

      const response = await partnerService.updateDeal(parseInt(dealId!), {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        restaurantId: formData.restaurantId,
        cuisineIds: formData.cuisineIds,
        dietaryPreferenceIds: formData.dietaryPreferenceIds
      }, token);

      if (response.success) {
        toast({
          title: "Success",
          description: "Deal updated successfully.",
        });
        navigate(`/partner/deals/${dealId}`);
      } else {
        throw new Error(response.error || 'Failed to update deal');
      }
    } catch (error) {
      console.error('Error updating deal:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update deal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof DealFormData, value: string | number | DealFormData['status']) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleCuisine = (cuisineId: number) => {
    setFormData(prev => ({
      ...prev,
      cuisineIds: prev.cuisineIds.includes(cuisineId)
        ? prev.cuisineIds.filter(id => id !== cuisineId)
        : [...prev.cuisineIds, cuisineId]
    }));
  };

  const toggleDietaryPreference = (preferenceId: number) => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferenceIds: prev.dietaryPreferenceIds.includes(preferenceId)
        ? prev.dietaryPreferenceIds.filter(id => id !== preferenceId)
        : [...prev.dietaryPreferenceIds, preferenceId]
    }));
  };

  if (isLoading) {
    return (
      <MobileLayout
        showHeader={true}
        headerTitle="Edit Deal"
        showBackButton={true}
        onBackClick={() => navigate(`/partner/deals/${dealId}`)}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading deal details...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      showHeader={true}
      headerTitle="Edit Deal"
      showBackButton={true}
      onBackClick={() => navigate(`/partner/deals/${dealId}`)}
    >
      <div className="px-mobile py-4 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-card rounded-xl p-4 shadow-custom-sm">
            <h3 className="font-semibold mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Deal Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.title ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Enter deal title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  placeholder="Describe your deal..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Restaurant *
                </label>
                <select
                  value={formData.restaurantId}
                  onChange={(e) => handleInputChange('restaurantId', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.restaurantId ? 'border-destructive' : 'border-input'
                  }`}
                >
                  <option value={0}>Select a restaurant</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
                {errors.restaurantId && (
                  <p className="text-sm text-destructive mt-1">{errors.restaurantId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as DealFormData['status'])}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-card rounded-xl p-4 shadow-custom-sm">
            <h3 className="font-semibold mb-4">Duration</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.startDate ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.endDate ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cuisines */}
          {cuisines.length > 0 && (
            <div className="bg-card rounded-xl p-4 shadow-custom-sm">
              <h3 className="font-semibold mb-4">Cuisines</h3>
              <div className="flex flex-wrap gap-2">
                {cuisines.map(cuisine => (
                  <button
                    key={cuisine.id}
                    type="button"
                    onClick={() => toggleCuisine(cuisine.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.cuisineIds.includes(cuisine.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-primary/10'
                    }`}
                  >
                    {cuisine.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Preferences */}
          {dietaryPreferences.length > 0 && (
            <div className="bg-card rounded-xl p-4 shadow-custom-sm">
              <h3 className="font-semibold mb-4">Dietary Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {dietaryPreferences.map(preference => (
                  <button
                    key={preference.id}
                    type="button"
                    onClick={() => toggleDietaryPreference(preference.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.dietaryPreferenceIds.includes(preference.id)
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary/10'
                    }`}
                  >
                    {preference.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/partner/deals/${dealId}`)}
              className="flex-1"
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
};