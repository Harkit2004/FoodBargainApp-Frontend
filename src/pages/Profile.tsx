import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  User, 
  MapPin, 
  Bell, 
  Heart, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  Edit,
  Star,
  Utensils
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  memberSince: string;
  totalSavings: number;
  favoriteCuisines: string[];
  dietaryPreferences: string[];
}

const mockProfile: UserProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  location: "Toronto, ON",
  memberSince: "January 2024",
  totalSavings: 347.50,
  favoriteCuisines: ["Italian", "Japanese", "Mexican"],
  dietaryPreferences: ["Vegetarian"]
};

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile] = useState<UserProfile>(mockProfile);

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/welcome');
  };

  const ProfileStat: React.FC<{ 
    label: string; 
    value: string; 
    icon: React.ReactNode;
    color?: string;
  }> = ({ label, value, icon, color = "primary" }) => (
    <div className="bg-card rounded-xl p-4 shadow-custom-sm text-center">
      <div className={`mx-auto w-12 h-12 rounded-full bg-${color}/10 flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );

  const MenuOption: React.FC<{
    icon: React.ReactNode;
    label: string;
    description?: string;
    onClick?: () => void;
    rightElement?: React.ReactNode;
    variant?: 'default' | 'destructive';
  }> = ({ icon, label, description, onClick, rightElement, variant = 'default' }) => (
    <button
      onClick={onClick}
      className={`w-full bg-card rounded-xl p-4 shadow-custom-sm flex items-center gap-3 hover:shadow-custom-md transition-all ${
        variant === 'destructive' ? 'hover:bg-destructive/5' : 'hover:bg-muted/30'
      }`}
    >
      <div className={`p-2 rounded-lg ${
        variant === 'destructive' 
          ? 'bg-destructive/10 text-destructive' 
          : 'bg-primary/10 text-primary'
      }`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className={`font-medium ${variant === 'destructive' ? 'text-destructive' : ''}`}>
          {label}
        </p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {rightElement}
    </button>
  );

  return (
    <>
      <MobileLayout
        showHeader={true}
        headerTitle="Profile"
        showBackButton={false}
      >
        <div className="px-mobile py-4 pb-20">
          {/* Profile Header */}
          <div className="bg-gradient-primary text-primary-foreground rounded-2xl p-6 mb-6 shadow-custom-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-primary-foreground/90">{profile.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.location}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile/edit')}
                className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold">${profile.totalSavings.toFixed(2)}</p>
              <p className="text-primary-foreground/90">Total Savings</p>
              <p className="text-sm text-primary-foreground/75 mt-1">
                Member since {profile.memberSince}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <ProfileStat
              label="Deals Used"
              value="23"
              icon={<Star className="w-6 h-6 text-primary" />}
            />
            <ProfileStat
              label="Favorites"
              value="12"
              icon={<Heart className="w-6 h-6 text-success" />}
              color="success"
            />
            <ProfileStat
              label="Reviews"
              value="8"
              icon={<Utensils className="w-6 h-6 text-accent" />}
              color="accent"
            />
          </div>

          {/* Quick Info */}
          <div className="bg-card rounded-xl p-4 shadow-custom-sm mb-6">
            <h3 className="font-semibold mb-3">Quick Info</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{profile.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Favorite Cuisines:</span>
                <span className="font-medium">{profile.favoriteCuisines.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dietary:</span>
                <span className="font-medium">{profile.dietaryPreferences.join(", ")}</span>
              </div>
            </div>
          </div>

          {/* Menu Options */}
          <div className="space-y-3">
            <MenuOption
              icon={<Settings className="w-5 h-5" />}
              label="Account Settings"
              description="Manage your account preferences"
              onClick={() => navigate('/profile/settings')}
            />

            <MenuOption
              icon={<Bell className="w-5 h-5" />}
              label="Notifications"
              description="Control your notification preferences"
              onClick={() => navigate('/profile/notifications')}
            />

            <MenuOption
              icon={<Heart className="w-5 h-5" />}
              label="Favorites"
              description="View your bookmarked deals and restaurants"
              onClick={() => navigate('/favorites')}
            />

            <MenuOption
              icon={<CreditCard className="w-5 h-5" />}
              label="Payment Methods"
              description="Manage your payment options"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Payment management will be available soon!",
                });
              }}
            />

            <MenuOption
              icon={<HelpCircle className="w-5 h-5" />}
              label="Help & Support"
              description="Get help and contact support"
              onClick={() => {
                toast({
                  title: "Support",
                  description: "Contact us at support@foodiedeals.com",
                });
              }}
            />

            <MenuOption
              icon={<LogOut className="w-5 h-5" />}
              label="Sign Out"
              description="Sign out of your account"
              onClick={handleLogout}
              variant="destructive"
            />
          </div>

          {/* App Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              FoodieDeals v1.0.0
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Made with ❤️ for food lovers
            </p>
          </div>
        </div>
      </MobileLayout>
      <BottomNavigation />
    </>
  );
};