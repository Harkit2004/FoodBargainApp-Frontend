import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MobileLayout } from '@/components/MobileLayout';
import { LocationPicker } from '@/components/LocationPicker';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { SignUp, useUser } from '@clerk/clerk-react';
import { preferencesService, CuisineType, DietaryPreference } from '@/services/preferencesService';

// Emoji mapping for cuisines and dietary preferences
const cuisineEmojis: Record<string, string> = {
  'Italian': '🍝',
  'Mexican': '🌮',
  'Chinese': '🥡',
  'Indian': '🍛',
  'Japanese': '🍣',
  'American': '🍔',
  'Thai': '🍜',
  'French': '🥐',
  'Mediterranean': '🫒',
  'Korean': '🍜',
  'Vietnamese': '🍲',
  'Greek': '🥙',
};

const dietaryEmojis: Record<string, string> = {
  'Vegetarian': '🥗',
  'Vegan': '🌱',
  'Gluten-Free': '🌾',
  'Keto': '🥑',
  'Halal': '☪️',
  'Kosher': '✡️',
  'Dairy-Free': '🥛',
  'Nut-Free': '🥜',
};

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { completeRegistration } = useAuth();
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  
  // Check if we're coming from Clerk auth or need to complete registration
  const clerkData = location.state;
  const needsCompletion = (clerkData?.clerkUserId) || (isSignedIn && clerkUser);

  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    location: '',
    cuisinePreferences: [] as number[],
    dietaryPreferences: [] as number[],
  });

  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);

  // Fetch preferences from backend
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setPreferencesLoading(true);
        const preferences = await preferencesService.getAllPreferences();
        setCuisineTypes(preferences.cuisines);
        setDietaryPreferences(preferences.dietaryPreferences);
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
        toast({
          title: "Warning",
          description: "Failed to load cuisine and dietary preferences. You can still complete registration.",
          variant: "destructive",
        });
      } finally {
        setPreferencesLoading(false);
      }
    };

    fetchPreferences();
  }, [toast]);

  // Update form data when Clerk user is available
  useEffect(() => {
    if (clerkUser && clerkUser.firstName && clerkUser.lastName) {
      setFormData(prev => ({
        ...prev,
        displayName: `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
      }));
    } else if (clerkData?.firstName && clerkData?.lastName) {
      setFormData(prev => ({
        ...prev,
        displayName: `${clerkData.firstName} ${clerkData.lastName}`.trim()
      }));
    }
  }, [clerkUser, clerkData]);

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

  const handleCompleteRegistration = async () => {
    if (!formData.displayName || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and location",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await completeRegistration(formData);
      
      toast({
        title: "Registration Complete!",
        description: "Welcome to FoodBargain! You can now discover amazing deals.",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If user needs to complete registration after Clerk signup
  if (needsCompletion) {
    return (
      <MobileLayout
        showHeader={true}
        headerTitle="Complete Registration"
        showBackButton={false}
      >
        <div className="px-mobile py-6 bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Almost Done!</h2>
            <p className="text-gray-400">Complete your profile to get personalized deals</p>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="displayName" className="text-white">Full Name</Label>
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
              <Label htmlFor="phone" className="text-white">Phone Number (Optional)</Label>
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

            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Favorite Cuisines (Optional)</h3>
              {preferencesLoading ? (
                <div className="text-center py-8 text-gray-400">Loading cuisines...</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {cuisineTypes.map((cuisine) => (
                    <div
                      key={cuisine.id}
                      onClick={() => handleCuisineToggle(cuisine.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.cuisinePreferences.includes(cuisine.id)
                          ? 'border-blue-500 bg-blue-500/20 shadow-sm shadow-blue-500/30'
                          : 'border-gray-600 bg-gray-800 hover:border-blue-500/50 hover:bg-gray-700'
                      }`}
                    >
                      <div className="text-center">
                        <span className="text-2xl mb-2 block">
                          {cuisineEmojis[cuisine.name] || '🍽️'}
                        </span>
                        <span className="text-sm font-medium text-white">{cuisine.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Dietary Preferences (Optional)</h3>
              {preferencesLoading ? (
                <div className="text-center py-8 text-gray-400">Loading dietary preferences...</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {dietaryPreferences.map((dietary) => (
                    <div
                      key={dietary.id}
                      onClick={() => handleDietaryToggle(dietary.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.dietaryPreferences.includes(dietary.id)
                          ? 'border-green-500 bg-green-500/20 shadow-sm shadow-green-500/30'
                          : 'border-gray-600 bg-gray-800 hover:border-green-500/50 hover:bg-gray-700'
                      }`}
                    >
                      <div className="text-center">
                        <span className="text-2xl mb-2 block">
                          {dietaryEmojis[dietary.name] || '🥘'}
                        </span>
                        <span className="text-sm font-medium text-white">{dietary.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              variant="neon"
              size="lg" 
              onClick={handleCompleteRegistration}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Show Clerk SignUp component for initial registration
  return (
    <MobileLayout
      showHeader={true}
      headerTitle="Sign Up"
      showBackButton={true}
      onBackClick={() => navigate('/')}
    >
      <div className="px-mobile py-6 min-h-[calc(100vh-80px)] flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
            <p className="text-gray-400">Join FoodBargain to discover amazing food deals</p>
          </div>

          {/* Clerk SignUp Component */}
          <div className="w-full max-w-md mx-auto">
            <SignUp 
              routing="virtual"
              signInUrl="/login"
              redirectUrl="/register"
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/25',
                  card: 'shadow-none border-0 bg-gray-800/50 backdrop-blur-sm',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  formFieldInput: 'bg-gray-700 border-gray-600 text-white focus:border-blue-500',
                  formFieldLabel: 'text-gray-300',
                  identityPreviewText: 'text-gray-300',
                  identityPreviewEditButton: 'text-blue-400 hover:text-blue-300',
                  footerActionText: 'text-gray-400',
                  footerActionLink: 'text-blue-400 hover:text-blue-300',
                  dividerText: 'text-gray-400',
                  dividerLine: 'bg-gray-600',
                  socialButtonsBlockButton: 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600',
                  otpCodeFieldInput: 'bg-gray-700 border-gray-600 text-white',
                }
              }}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 font-medium hover:underline hover:text-blue-300 transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};