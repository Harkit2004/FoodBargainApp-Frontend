import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const ProfileNotifications: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    emailNotifications: true,
  });

  const updateSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been updated.",
    });
  };

  const NotificationToggle: React.FC<{
    icon: React.ReactNode;
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
  }> = ({ icon, label, description, enabled, onToggle }) => (
    <div className="bg-card rounded-xl p-4 shadow-custom-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md mx-auto">
        <MobileLayout
          showHeader={true}
          headerTitle="Notifications"
          showBackButton={true}
          onBackClick={() => navigate('/profile')}
        >
          <div className="px-6 py-4 pb-20">
            <div className="space-y-4">
              <NotificationToggle
                icon={<Mail className="w-5 h-5" />}
                label="Email Notifications"
                description="Receive updates via email"
                enabled={settings.emailNotifications}
                onToggle={() => updateSetting('emailNotifications')}
              />
            </div>

            <div className="bg-card rounded-xl p-4 shadow-custom-sm mt-6">
              <h3 className="font-semibold mb-2">About Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Currently, we only support email notifications. We'll let you know about:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• New deals from your favorite restaurants</li>
                <li>• Important account updates</li>
                <li>• Special promotions and offers</li>
              </ul>
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