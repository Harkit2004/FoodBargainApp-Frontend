import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileLayout } from '@/components/MobileLayout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Percent, MapPin } from 'lucide-react';

interface DealFormData {
  title: string;
  description: string;
  restaurantId: string;
  discountPercentage: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  cuisineIds: string[];
  dietaryPreferenceIds: string[];
  maxClaims: string;
  isActive: boolean;
}

const mockRestaurants = [
  { id: '1', name: "Mario's Pizzeria" },
  { id: '2', name: "Burger Palace" },
  { id: '3', name: "Sakura Sushi" },
];

const cuisineTypes = [
  { id: '1', name: 'Italian', emoji: '🍝' },
  { id: '2', name: 'American', emoji: '🍔' },
  { id: '3', name: 'Japanese', emoji: '🍣' },
  { id: '4', name: 'Mexican', emoji: '🌮' },
];

const dietaryPreferences = [
  { id: '1', name: 'Vegetarian', emoji: '🥗' },
  { id: '2', name: 'Vegan', emoji: '🌱' },
  { id: '3', name: 'Gluten-Free', emoji: '🌾' },
  { id: '4', name: 'Keto', emoji: '🥑' },
];

export const CreateDeal: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<DealFormData>({
    title: '',
    description: '',
    restaurantId: '',
    discountPercentage: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    cuisineIds: [],
    dietaryPreferenceIds: [],
    maxClaims: '',
    isActive: true,
  });

  const handleInputChange = (field: keyof DealFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'cuisineIds' | 'dietaryPreferenceIds', id: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter(item => item !== id)
        : [...prev[field], id]
    }));
  };

  const validateForm = () => {
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

    if (!formData.discountPercentage || parseInt(formData.discountPercentage) <= 0 || parseInt(formData.discountPercentage) > 100) {
      toast({
        title: "Invalid Discount",
        description: "Please enter a valid discount percentage (1-100)",
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
      // Here you would call your API to create the deal
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Deal Created Successfully!",
        description: `${formData.title} has been created and is now live.`,
      });
      
      navigate('/partner');
    } catch (error) {
      toast({
        title: "Failed to Create Deal",
        description: "Something went wrong. Please try again.",
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
                    {mockRestaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount">Discount Percentage *</Label>
                <div className="relative mt-1">
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="50"
                    value={formData.discountPercentage}
                    onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                    className="pr-8"
                  />
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
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
                        <span className="text-xl block mb-1">{cuisine.emoji}</span>
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
                        <span className="text-xl block mb-1">{dietary.emoji}</span>
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
      </div>
    </MobileLayout>
  );
};