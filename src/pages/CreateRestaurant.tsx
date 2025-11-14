import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileLayout } from '@/components/MobileLayout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { Store, MapPin, Clock, Phone, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { restaurantService, type CreateRestaurantData } from '@/services/restaurantService';
import { uploadImage } from '@/services/blobService';

interface RestaurantFormData {
  name: string;
  description: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  imageUrl?: string;
}



export const CreateRestaurant: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getToken } = useClerkAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    description: '',
    streetAddress: '',
    city: '',
    province: 'ON',
    postalCode: '',
    phone: '',
    openingTime: '09:00',
    closingTime: '21:00',
    isActive: true,
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Partial<RestaurantFormData>>({});
  const [imageError, setImageError] = useState<string | null>(null);

  const handleInputChange = (field: keyof RestaurantFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageError(null);

    if (!file) {
      setFormData(prev => ({ ...prev, imageUrl: undefined }));
      setImagePreview(null);
      return;
    }

    try {
      setUploadingImage(true);
      const token = await getToken();
      if (!token) {
        throw new Error('You must be logged in to upload images');
      }

      const uploadResult = await uploadImage(file, {
        entityType: 'restaurant',
        ownerId: token,
      });

      setFormData(prev => ({ ...prev, imageUrl: uploadResult.url }));
      setImagePreview(uploadResult.url);
      toast({
        title: 'Image uploaded',
        description: 'Your restaurant image is ready.',
      });
    } catch (error) {
      console.error('Image upload failed', error);
      setImageError(error instanceof Error ? error.message : 'Image upload failed');
      setFormData(prev => ({ ...prev, imageUrl: undefined }));
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, imageUrl: undefined }));
    setImagePreview(null);
    setImageError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RestaurantFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Restaurant name is required';
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.province.trim()) {
      newErrors.province = 'Province is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'Please enter a valid Canadian postal code';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await getToken();
      
      const restaurantData: CreateRestaurantData = {
        name: formData.name,
        description: formData.description,
        streetAddress: formData.streetAddress,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode.toUpperCase(),
        phone: formData.phone,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        isActive: formData.isActive,
        imageUrl: formData.imageUrl || undefined,
      };

      const response = await restaurantService.createRestaurant(restaurantData, token);
      
      if (response.success) {
        toast({
          title: "Restaurant Created Successfully!",
          description: `${formData.name} has been added to your restaurants.`,
        });
        navigate('/partner');
      } else {
        toast({
          title: "Failed to Create Restaurant",
          description: response.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating restaurant:', error);
      toast({
        title: "Failed to Create Restaurant",
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
      headerTitle="Add Restaurant"
      showBackButton={true}
      onBackClick={() => navigate('/partner')}
    >
      <div className="px-mobile py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-card rounded-xl p-4 shadow-custom-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5" />
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Mario's Italian Bistro"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label>Restaurant Image</Label>
                <div className="mt-1 border border-dashed rounded-xl p-4 flex flex-col gap-3">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img src={imagePreview} alt="Restaurant preview" className="w-full h-40 object-cover rounded-lg" />
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setImagePreview(imagePreview)}>
                          Preview
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleImageRemove}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center gap-2 py-4">
                      <ImagePlus className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload a cover image to showcase your restaurant</p>
                      <Input type="file" accept="image/png,image/jpeg" onChange={handleImageChange} disabled={uploadingImage || loading} />
                    </div>
                  )}
                  {uploadingImage && <p className="text-sm text-muted-foreground">Uploading image...</p>}
                  {imageError && <p className="text-sm text-red-500">{imageError}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your restaurant..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

            </div>
          </div>

          {/* Location Information */}
          <div className="bg-card rounded-xl p-4 shadow-custom-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="streetAddress">Street Address *</Label>
                <Input
                  id="streetAddress"
                  placeholder="123 Main Street"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  className={`mt-1 ${errors.streetAddress ? 'border-red-500' : ''}`}
                />
                {errors.streetAddress && <p className="text-sm text-red-500 mt-1">{errors.streetAddress}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Toronto"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`mt-1 ${errors.city ? 'border-red-500' : ''}`}
                  />
                  {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                </div>
                
                <div>
                  <Label htmlFor="province">Province *</Label>
                  <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
                    <SelectTrigger className={`mt-1 ${errors.province ? 'border-red-500' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ON">Ontario</SelectItem>
                      <SelectItem value="BC">British Columbia</SelectItem>
                      <SelectItem value="AB">Alberta</SelectItem>
                      <SelectItem value="SK">Saskatchewan</SelectItem>
                      <SelectItem value="MB">Manitoba</SelectItem>
                      <SelectItem value="QC">Quebec</SelectItem>
                      <SelectItem value="NB">New Brunswick</SelectItem>
                      <SelectItem value="NS">Nova Scotia</SelectItem>
                      <SelectItem value="PE">Prince Edward Island</SelectItem>
                      <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                      <SelectItem value="YT">Yukon</SelectItem>
                      <SelectItem value="NT">Northwest Territories</SelectItem>
                      <SelectItem value="NU">Nunavut</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.province && <p className="text-sm text-red-500 mt-1">{errors.province}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  placeholder="M5V 3A8"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className={`mt-1 ${errors.postalCode ? 'border-red-500' : ''}`}
                />
                {errors.postalCode && <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-card rounded-xl p-4 shadow-custom-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </h3>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(416) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Hours */}
          <div className="bg-card rounded-xl p-4 shadow-custom-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Operating Hours
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="openingTime">Opening Time</Label>
                <Input
                  id="openingTime"
                  type="time"
                  value={formData.openingTime}
                  onChange={(e) => handleInputChange('openingTime', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="closingTime">Closing Time</Label>
                <Input
                  id="closingTime"
                  type="time"
                  value={formData.closingTime}
                  onChange={(e) => handleInputChange('closingTime', e.target.value)}
                  className="mt-1"
                />
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
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Restaurant...
                </>
              ) : (
                'Add Restaurant 🎉'
              )}
            </Button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
};