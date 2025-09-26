import React from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Settings, Bell, Shield, Globe, Palette, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const SettingOption: React.FC<{
    icon: React.ReactNode;
    label: string;
    description: string;
    onClick?: () => void;
    rightElement?: React.ReactNode;
  }> = ({ icon, label, description, onClick, rightElement }) => (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-xl p-4 shadow-custom-sm flex items-center gap-3 hover:shadow-custom-md transition-all hover:bg-muted/30"
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {rightElement}
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md mx-auto">
        <MobileLayout
          showHeader={true}
          headerTitle="Account Settings"
          showBackButton={true}
          onBackClick={() => navigate('/profile')}
        >
          <div className="px-6 py-4 pb-20">
            <div className="space-y-4">
              <SettingOption
                icon={<Bell className="w-5 h-5" />}
                label="Notifications"
                description="Manage your notification preferences"
                onClick={() => navigate('/profile/notifications')}
              />

              <SettingOption
                icon={<Shield className="w-5 h-5" />}
                label="Privacy & Security"
                description="Control your privacy settings"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Privacy settings will be available soon!",
                  });
                }}
              />

              <SettingOption
                icon={<Globe className="w-5 h-5" />}
                label="Language & Region"
                description="Set your preferred language and location"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Language settings will be available soon!",
                  });
                }}
              />

              <SettingOption
                icon={<Palette className="w-5 h-5" />}
                label="Appearance"
                description="Customize the app's look and feel"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Theme customization will be available soon!",
                  });
                }}
              />

              <SettingOption
                icon={<Volume2 className="w-5 h-5" />}
                label="Sound & Haptics"
                description="Control app sounds and vibrations"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Sound settings will be available soon!",
                  });
                }}
              />
            </div>

            <div className="mt-8">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/profile')}
              >
                Back to Profile
              </Button>
            </div>
          </div>
        </MobileLayout>
        <BottomNavigation />
      </div>
    </div>
  );
};