import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MobileLayout } from '@/components/MobileLayout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface CuisineType {
  id: number;
  name: string;
  emoji: string;
}

interface DietaryPreference {
  id: number;
  name: string;
  emoji: string;
}

const cuisineTypes: CuisineType[] = [
  { id: 1, name: 'Italian', emoji: '🍝' },
  { id: 2, name: 'Mexican', emoji: '🌮' },
  { id: 3, name: 'Chinese', emoji: '🥡' },
  { id: 4, name: 'Indian', emoji: '🍛' },
  { id: 5, name: 'Japanese', emoji: '🍣' },
  { id: 6, name: 'American', emoji: '🍔' },
  { id: 7, name: 'Thai', emoji: '🍜' },
  { id: 8, name: 'French', emoji: '🥐' },
];

const dietaryPreferences: DietaryPreference[] = [
  { id: 1, name: 'Vegetarian', emoji: '🥗' },
  { id: 2, name: 'Vegan', emoji: '🌱' },
  { id: 3, name: 'Gluten-Free', emoji: '🌾' },
  { id: 4, name: 'Keto', emoji: '🥑' },
  { id: 5, name: 'Halal', emoji: '☪️' },
  { id: 6, name: 'Kosher', emoji: '✡️' },
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phone: '',
    location: '',
    cuisinePreferences: [] as number[],
    dietaryPreferences: [] as number[],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCuisineToggle = (cuisineId: number) => {
    setFormData(prev => ({
      ...prev,
      cuisinePreferences: prev.cuisinePreferences.includes(cuisineId)
        ? prev.cuisinePreferences.filter(id => id !== cuisineId)
        : [...prev.cuisinePreferences, cuisineId]
    }));
  };

  const handleDietaryToggle = (dietaryId: number) => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(dietaryId)
        ? prev.dietaryPreferences.filter(id => id !== dietaryId)
        : [...prev.dietaryPreferences, dietaryId]
    }));
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.displayName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleStep1Submit = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleStep2Submit = () => {
    if (!formData.location) {
      toast({
        title: "Location Required",
        description: "Please provide your location for nearby deals",
        variant: "destructive",
      });
      return;
    }
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // Here you would integrate with Clerk and your backend API
      // For now, we'll simulate the registration process
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Registration Successful!",
        description: "Welcome to FoodieDeals! You can now discover amazing deals.",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Create Your Account</h2>
        <p className="text-muted-foreground">Join FoodieDeals to discover amazing food deals</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="displayName">Full Name</Label>
          <Input
            id="displayName"
            type="text"
            placeholder="John Doe"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter a strong password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <Button variant="mobile" size="mobile" onClick={handleStep1Submit}>
        Continue
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Your Location</h2>
        <p className="text-muted-foreground">Help us find deals near you</p>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          type="text"
          placeholder="Enter your city or address"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          We'll use this to show you nearby restaurant deals
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="mobile" onClick={() => setStep(1)} className="flex-1">
          Back
        </Button>
        <Button variant="mobile" size="mobile" onClick={handleStep2Submit} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Your Preferences</h2>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Favorite Cuisines</h3>
        <div className="grid grid-cols-2 gap-3">
          {cuisineTypes.map((cuisine) => (
            <div
              key={cuisine.id}
              onClick={() => handleCuisineToggle(cuisine.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                formData.cuisinePreferences.includes(cuisine.id)
                  ? 'border-primary bg-primary/10 shadow-custom-sm'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-center">
                <span className="text-2xl mb-2 block">{cuisine.emoji}</span>
                <span className="text-sm font-medium">{cuisine.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Dietary Preferences</h3>
        <div className="grid grid-cols-2 gap-3">
          {dietaryPreferences.map((dietary) => (
            <div
              key={dietary.id}
              onClick={() => handleDietaryToggle(dietary.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                formData.dietaryPreferences.includes(dietary.id)
                  ? 'border-accent bg-accent/10 shadow-custom-sm'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <div className="text-center">
                <span className="text-2xl mb-2 block">{dietary.emoji}</span>
                <span className="text-sm font-medium">{dietary.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="mobile" onClick={() => setStep(2)} className="flex-1">
          Back
        </Button>
        <Button 
          variant="success" 
          size="mobile" 
          onClick={handleFinalSubmit}
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </Button>
      </div>
    </div>
  );

  return (
    <MobileLayout
      showHeader={true}
      headerTitle="Sign Up"
      showBackButton={step > 1 || true}
      onBackClick={() => step > 1 ? setStep(step - 1) : navigate('/welcome')}
    >
      <div className="px-mobile py-6">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-3 h-3 rounded-full transition-colors ${
                  stepNumber <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </MobileLayout>
  );
};