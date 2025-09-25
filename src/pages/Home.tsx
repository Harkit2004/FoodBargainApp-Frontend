import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Search, MapPin, Bell, Filter, Heart, Star, UserPlus, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { dealsService, Deal as ApiDeal } from '@/services/dealsService';
import { useNavigate } from 'react-router-dom';
import heroFood from '@/assets/hero-food.jpg';

interface Deal {
  id: number;
  title: string;
  description: string;
  restaurant: {
    name: string;
    rating: number;
    distance: string;
  };
  discountPercentage: number;
  originalPrice: number;
  discountedPrice: number;
  imageUrl: string;
  isBookmarked: boolean;
  expiresAt: string;
  cuisineType: string;
}

const mockDeals: Deal[] = [
  {
    id: 1,
    title: "50% Off All Pizzas",
    description: "Get half price on all our delicious wood-fired pizzas",
    restaurant: {
      name: "Mario's Pizzeria",
      rating: 4.8,
      distance: "0.3 km"
    },
    discountPercentage: 50,
    originalPrice: 24.99,
    discountedPrice: 12.49,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    isBookmarked: false,
    expiresAt: "2024-01-25",
    cuisineType: "Italian"
  },
  {
    id: 2,
    title: "Buy 1 Get 1 Free Burgers",
    description: "Double the deliciousness with our BOGO burger deal",
    restaurant: {
      name: "Burger Palace",
      rating: 4.6,
      distance: "0.8 km"
    },
    discountPercentage: 50,
    originalPrice: 18.99,
    discountedPrice: 9.50,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    isBookmarked: true,
    expiresAt: "2024-01-24",
    cuisineType: "American"
  },
  {
    id: 3,
    title: "30% Off Sushi Platters",
    description: "Fresh sushi with authentic Japanese flavors",
    restaurant: {
      name: "Sakura Sushi",
      rating: 4.9,
      distance: "1.2 km"
    },
    discountPercentage: 30,
    originalPrice: 32.99,
    discountedPrice: 23.09,
    imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
    isBookmarked: false,
    expiresAt: "2024-01-26",
    cuisineType: "Japanese"
  }
];

export const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<ApiDeal[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const cuisineTypes = ['all', 'Italian', 'American', 'Japanese', 'Mexican', 'Chinese', 'Indian'];

  useEffect(() => {
    if (isAuthenticated) {
      loadDeals();
    }
  }, [isAuthenticated]);

  const loadDeals = async () => {
    try {
      setIsLoading(true);
      const response = await dealsService.getDeals({ status: 'active' });
      
      if (response.success && response.data) {
        setDeals(response.data.deals);
      }
    } catch (error) {
      console.error('Failed to load deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (dealId: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await dealsService.unfavoriteDeal(dealId);
        toast({
          title: "Removed from favorites",
          description: "Deal removed from your favorites.",
        });
      } else {
        await dealsService.favoriteDeal(dealId);
        toast({
          title: "Added to favorites",
          description: "Deal added to your favorites.",
        });
      }
      
      // Update local state
      setDeals(prevDeals =>
        prevDeals.map(deal =>
          deal.id === dealId
            ? { ...deal, isBookmarked: !currentStatus }
            : deal
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    }
  };

  const filteredDeals = selectedCuisine === 'all' 
    ? deals 
    : deals.filter(deal => deal.restaurant.name.toLowerCase().includes(selectedCuisine.toLowerCase()));

  // If user is not authenticated, show welcome screen
  if (!isAuthenticated) {
    return (
      <>
        <MobileLayout 
          showHeader={true} 
          headerTitle="FoodieDeals"
          showBackButton={false}
        >
          <div className="px-mobile py-8 text-center">
            {/* Hero Section */}
            <div className="relative mb-8">
              <img 
                src={heroFood} 
                alt="Delicious food deals"
                className="w-full h-64 object-cover rounded-2xl shadow-custom-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h1 className="text-3xl font-bold mb-2">Discover Amazing Food Deals</h1>
                <p className="text-white/90">Save up to 70% on your favorite restaurants</p>
              </div>
            </div>

            {/* Welcome Content */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Welcome to FoodieDeals!</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Join thousands of food lovers discovering exclusive deals from the best restaurants in your area.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/register')}
                  className="w-full gradient-primary h-12 text-base font-semibold"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </Button>
                
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline" 
                  className="w-full h-12 text-base font-semibold"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-4 mt-8">
                <div className="bg-card rounded-xl p-4 shadow-custom-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Save on Favorites</h3>
                      <p className="text-sm text-muted-foreground">Bookmark deals and never miss out</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-4 shadow-custom-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-success/10 rounded-lg p-3">
                      <MapPin className="w-6 h-6 text-success" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Find Nearby</h3>
                      <p className="text-sm text-muted-foreground">Discover deals in your area</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-4 shadow-custom-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent/10 rounded-lg p-3">
                      <Star className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Exclusive Offers</h3>
                      <p className="text-sm text-muted-foreground">Access member-only deals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MobileLayout>
      </>
    );
  }

  const DealCard: React.FC<{ deal: ApiDeal }> = ({ deal }) => (
    <div className="bg-card rounded-2xl shadow-custom-md overflow-hidden mb-4">
      <div className="relative">
        <img 
          src={heroFood} 
          alt={deal.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm font-bold">
            DEAL
          </span>
        </div>
        <button
          onClick={() => toggleFavorite(deal.id, deal.isBookmarked || false)}
          className="absolute top-3 right-3 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
        >
          <Heart 
            className={`w-5 h-5 ${deal.isBookmarked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
          />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{deal.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">{deal.description || 'Great deal available!'}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold">{deal.restaurant.name}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{deal.restaurant.city || 'Toronto'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">Active</p>
            <p className="text-sm text-muted-foreground">{deal.status}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="default" size="sm" className="flex-1">
            View Deal
          </Button>
          <Button variant="outline" size="sm">
            <MapPin className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Expires: {new Date(deal.endDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <MobileLayout showHeader={false}>
        {/* Custom Header */}
        <div className="bg-gradient-primary text-primary-foreground px-mobile py-4 shadow-custom-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">Good evening! 👋</h1>
              <div className="flex items-center gap-1 text-primary-foreground/90">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Toronto, ON</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-primary-foreground/20 rounded-full hover:bg-primary-foreground/30 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 bg-primary-foreground/20 rounded-full hover:bg-primary-foreground/30 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for restaurants, deals..."
              className="w-full bg-background text-foreground pl-10 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-primary-light"
            />
          </div>
        </div>

        <div className="px-mobile pt-4 pb-20">
          {/* Cuisine Filter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Cuisines</h2>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {cuisineTypes.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCuisine === cuisine
                      ? 'bg-primary text-primary-foreground shadow-custom-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cuisine === 'all' ? 'All' : cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Deals */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">🔥 Hot Deals Near You</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div>
                {filteredDeals.length > 0 ? (
                  filteredDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No deals found for {selectedCuisine} cuisine</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedCuisine('all')}
                    >
                      Show All Deals
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </MobileLayout>
      <BottomNavigation />
    </>
  );
};