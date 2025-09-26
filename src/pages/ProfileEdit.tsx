import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MobileLayout } from '@/components/MobileLayout';
import { LocationPicker } from '@/components/LocationPicker';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Save, ArrowLeft } from 'lucide-react';
import { userService } from '@/services/userService';

export const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    location: '',
  });

  // Load current user data
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        phone: user.phone || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      toast({
        title: "Validation Error",
        description: "Display name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update user profile
      await userService.updateProfile({
        displayName: formData.displayName,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      // Navigate back to profile
      navigate('/profile');
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout
      showHeader={true}
      headerTitle="Edit Profile"
      showBackButton={true}
      onBackClick={() => navigate('/profile')}
    >
      <div className="px-mobile py-6 bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen">
        <div className="space-y-6">
          <div>
            <Label htmlFor="displayName" className="text-white">Full Name *</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="John Doe"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-white">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-white">Location</Label>
            <div className="mt-2">
              <LocationPicker
                onLocationSelect={(coordinates, address) => {
                  handleInputChange('location', coordinates);
                }}
                initialLocation={formData.location}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              We'll use your location to show you nearby restaurant deals
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              disabled={loading}
              className="flex-1 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="neon"
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};