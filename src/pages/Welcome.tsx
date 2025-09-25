import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-food.jpg';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-mobile text-center">
        {/* Logo/App Name */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-primary-foreground mb-2">
            🍽️ FoodieDeals
          </h1>
          <p className="text-xl text-primary-foreground/90 font-medium">
            Discover Amazing Food Deals
          </p>
        </div>

        {/* Hero Image */}
        <div className="w-full max-w-md mb-8 rounded-3xl overflow-hidden shadow-custom-xl">
          <img 
            src={heroImage} 
            alt="Delicious food collection" 
            className="w-full h-64 object-cover"
          />
        </div>

        {/* Main CTA */}
        <div className="space-y-4 w-full max-w-sm">
          <Button 
            variant="hero" 
            size="mobile"
            onClick={() => navigate('/register')}
            className="animate-pulse hover:animate-none"
          >
            Get Started
          </Button>
          
          <Button 
            variant="outline" 
            size="mobile"
            onClick={() => navigate('/login')}
            className="bg-background/10 border-primary-foreground text-primary-foreground hover:bg-background hover:text-foreground"
          >
            Already have an account?
          </Button>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-sm text-primary-foreground/90 font-medium">Personalized Deals</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-sm text-primary-foreground/90 font-medium">Save Money</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-sm text-primary-foreground/90 font-medium">Real-time Updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};