import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  Store,
  MapPin,
  Phone,
  Building,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { partnerService } from '@/services/partnerService';

interface PartnerFormData {
  businessName: string;
  description: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}

// Move InputField component outside to prevent re-creation on every render
const InputField: React.FC<{
  label: string;
  field: keyof PartnerFormData;
  placeholder: string;
  icon?: React.ReactNode;
  type?: string;
  required?: boolean;
  formData: PartnerFormData;
  errors: Partial<PartnerFormData>;
  onChange: (field: keyof PartnerFormData, value: string) => void;
}> = ({ label, field, placeholder, icon, type = 'text', required = false, formData, errors, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(field, e.target.value);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={field} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <Input
          id={field}
          name={field}
          type={type}
          placeholder={placeholder}
          value={formData[field] || ''}
          onChange={handleChange}
          className={`${icon ? 'pl-10' : ''} ${errors[field] ? 'border-red-500' : ''}`}
          autoComplete="off"
        />
      </div>
      {errors[field] && (
        <p className="text-sm text-red-500">{errors[field]}</p>
      )}
    </div>
  );
};

export const PartnerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, checkBackendAuth } = useAuth();
  const { getToken } = useClerkAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<PartnerFormData>({
    businessName: '',
    description: '',
    streetAddress: '',
    city: '',
    province: 'ON',
    postalCode: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<PartnerFormData>>({});

  const handleInputChange = (field: keyof PartnerFormData, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {
          ...prev,
          [field]: undefined
        };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PartnerFormData> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getToken();
      if (!token) return;

      const response = await partnerService.register(formData, token);

      if (response.success) {
        toast({
          title: "Registration Successful!",
          description: "Welcome to FoodBargain Partners! You can now create restaurants and deals.",
        });
        
        // Refresh user data to update partner status
        await checkBackendAuth();
        
        // Navigate to partner dashboard
        navigate('/partner');
      } else {
        toast({
          title: "Registration Failed",
          description: response.error || "Failed to register as partner. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Partner registration error:', error);
      toast({
        title: "Error",
        description: "Failed to register as partner. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md mx-auto">
        <MobileLayout
          showHeader={true}
          headerTitle="Become a Partner"
          showBackButton={true}
          onBackClick={() => navigate('/profile')}
        >
          <div className="px-6 py-4 pb-20">
            {/* Header */}
            <div className="bg-gradient-primary text-primary-foreground rounded-2xl p-6 mb-6 shadow-custom-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Store className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Partner Registration</h1>
                  <p className="text-primary-foreground/90 text-sm">
                    Join FoodBargain as a restaurant partner
                  </p>
                </div>
              </div>
              <p className="text-primary-foreground/80 text-sm">
                Fill out the information below to register your business and start offering amazing deals to customers.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Business Information */}
              <div className="bg-card rounded-xl p-4 shadow-custom-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Business Information
                </h2>
                
                <div className="space-y-4">
                  <InputField
                    label="Business Name"
                    field="businessName"
                    placeholder="e.g., Mario's Italian Restaurant"
                    icon={<Store className="w-4 h-4" />}
                    required
                    formData={formData}
                    errors={errors}
                    onChange={handleInputChange}
                  />

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Business Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your restaurant, cuisine type, and what makes you special..."
                      value={formData.description || ''}
                      onChange={(e) => {
                        handleInputChange('description', e.target.value);
                      }}
                      rows={3}
                      maxLength={500}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {(formData.description || '').length}/500
                    </div>
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-card rounded-xl p-4 shadow-custom-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Information
                </h2>
                
                <div className="space-y-4">
                  <InputField
                    label="Street Address"
                    field="streetAddress"
                    placeholder="123 Main Street"
                    icon={<MapPin className="w-4 h-4" />}
                    required
                    formData={formData}
                    errors={errors}
                    onChange={handleInputChange}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="City"
                      field="city"
                      placeholder="Toronto"
                      required
                      formData={formData}
                      errors={errors}
                      onChange={handleInputChange}
                    />
                    
                    <div className="space-y-2">
                      <label htmlFor="province" className="text-sm font-medium">
                        Province <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="province"
                        name="province"
                        value={formData.province || 'ON'}
                        onChange={(e) => {
                          handleInputChange('province', e.target.value);
                        }}
                        className={`w-full px-3 py-2 border border-input bg-background rounded-md text-sm ${errors.province ? 'border-red-500' : ''}`}
                      >
                        <option value="ON">Ontario</option>
                        <option value="BC">British Columbia</option>
                        <option value="AB">Alberta</option>
                        <option value="SK">Saskatchewan</option>
                        <option value="MB">Manitoba</option>
                        <option value="QC">Quebec</option>
                        <option value="NB">New Brunswick</option>
                        <option value="NS">Nova Scotia</option>
                        <option value="PE">Prince Edward Island</option>
                        <option value="NL">Newfoundland and Labrador</option>
                        <option value="YT">Yukon</option>
                        <option value="NT">Northwest Territories</option>
                        <option value="NU">Nunavut</option>
                      </select>
                      {errors.province && (
                        <p className="text-sm text-red-500">{errors.province}</p>
                      )}
                    </div>
                  </div>

                  <InputField
                    label="Postal Code"
                    field="postalCode"
                    placeholder="M5V 3A8"
                    required
                    formData={formData}
                    errors={errors}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-card rounded-xl p-4 shadow-custom-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </h2>
                
                <div className="space-y-4">
                  <InputField
                    label="Phone Number"
                    field="phone"
                    placeholder="(416) 123-4567"
                    icon={<Phone className="w-4 h-4" />}
                    type="tel"
                    required
                    formData={formData}
                    errors={errors}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="bg-card rounded-xl p-4 shadow-custom-sm">
                <p className="text-sm text-muted-foreground">
                  By registering as a partner, you agree to our Terms of Service and Privacy Policy. 
                  You'll be able to create restaurants, manage menus, and offer deals to customers.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSubmitting ? 'Registering...' : 'Complete Registration'}
              </Button>
            </div>
          </div>
        </MobileLayout>
        <BottomNavigation />
      </div>
    </div>
  );
};