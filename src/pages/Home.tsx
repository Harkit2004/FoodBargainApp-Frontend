import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Search, MapPin, Bell, Filter, Heart, Star, ArrowRight, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { dealsService, Deal as ApiDeal } from '@/services/dealsService';
import { useNavigate } from 'react-router-dom';
import { formatDateShort } from '@/utils/dateUtils';
import heroImage from '@/assets/hero-food.jpg';

// Helper function to format location - returns lat,lng for coordinates
const formatLocation = (locationString: string): string => {
  if (!locationString) return 'Location not set';
  
  // If it's coordinates (lat,lng), return as comma-separated values
  if (locationString.includes(',') && !locationString.includes(' ')) {
    return locationString; // Already in lat,lng format
  }
  
  return locationString;
};



export const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { getToken } = useClerkAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<ApiDeal[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // Static count for demo

  const cuisineTypes = ['all', 'Italian', 'American', 'Japanese', 'Mexican', 'Chinese', 'Indian'];

  const loadDeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await dealsService.getDeals({ status: 'active' }, token || undefined);
      
      if (response.success && response.data) {
        console.log('Deals loaded:', response.data.deals.length, 'deals');
        console.log('First deal bookmark status:', response.data.deals[0]?.isBookmarked);
        console.log('Sample deal structure:', Object.keys(response.data.deals[0] || {}));
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
  }, [toast, getToken]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDeals();
    }
  }, [isAuthenticated, loadDeals]);

  // Listen for bookmark changes from other pages
  useEffect(() => {
    const handleBookmarkChange = (event: CustomEvent) => {
      const { id, type, isBookmarked } = event.detail;
      if (type === 'deal') {
        setDeals(prev =>
          prev.map(deal =>
            deal.id === id
              ? { ...deal, isBookmarked }
              : deal
          )
        );
      }
    };

    window.addEventListener('bookmarkChanged', handleBookmarkChange as EventListener);
    return () => {
      window.removeEventListener('bookmarkChanged', handleBookmarkChange as EventListener);
    };
  }, []);

  const toggleFavorite = async (dealId: number, currentStatus: boolean) => {
    console.log('Home toggle favorite called:', { dealId, currentStatus });
    try {
      const token = await getToken();
      console.log('Token obtained:', !!token);
      
      if (currentStatus) {
        console.log('Unfavoriting deal...');
        await dealsService.unfavoriteDeal(dealId, token || undefined);
        toast({
          title: "Removed from favorites",
          description: "Deal removed from your favorites.",
        });
      } else {
        console.log('Favoriting deal...');
        await dealsService.favoriteDeal(dealId, token || undefined);
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

      // Trigger a custom event to notify other pages of bookmark changes
      window.dispatchEvent(new CustomEvent('bookmarkChanged', { 
        detail: { 
          id: dealId, 
          type: 'deal', 
          isBookmarked: !currentStatus 
        } 
      }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
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

  // If user is not authenticated, show beautiful welcome screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Cool neon background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-green-500/10"></div>
        {/* Animated background particles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%),radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center max-w-md mx-auto">
          {/* Logo/App Name */}
          <div className="mb-8 animate-fade-in-scale">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 rounded-3xl mb-4 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
              <span className="text-3xl">🍽️</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              FoodBargain
            </h1>
            <p className="text-lg text-gray-300 font-medium">
              Discover Amazing Food Deals Near You
            </p>
          </div>

          {/* Hero Image */}
          <div className="w-full max-w-sm mb-10 rounded-2xl overflow-hidden shadow-xl shadow-blue-500/20 ring-1 ring-blue-500/30 animate-fade-in-scale hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300">
            <img 
              src={heroImage} 
              alt="Delicious food collection" 
              className="w-full h-56 object-cover"
            />
          </div>

          {/* Main CTA */}
          <div className="space-y-3 w-full max-w-sm mb-12">
            <Button 
              variant="neon"
              size="lg"
              onClick={() => navigate('/register')}
              className="w-full group"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400 font-medium bg-gray-900/50 backdrop-blur-sm"
            >
              Sign In
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
            <div className="flex flex-col items-center group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 border border-blue-500/20">
                <Star className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-xs text-gray-300 font-medium leading-tight text-center">Premium<br />Restaurants</p>
            </div>
            
            <div className="flex flex-col items-center group">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-green-500/30 transition-all duration-300 border border-green-500/20">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-xs text-gray-300 font-medium leading-tight text-center">Verified<br />Deals</p>
            </div>
            
            <div className="flex flex-col items-center group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300 border border-purple-500/20">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
              <p className="text-xs text-gray-300 font-medium leading-tight text-center">Real-time<br />Updates</p>
            </div>
          </div>

          {/* Footer text */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Join thousands of food lovers saving money every day
            </p>
          </div>
        </div>
      </div>
    );
  }

  const DealCard: React.FC<{ deal: ApiDeal }> = ({ deal }) => (
    <div 
      className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-4 border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors"
      onClick={() => navigate(`/deals/${deal.id}`)}
    >
      <div className="relative">
        <img 
          src={heroImage} 
          alt={deal.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-bold shadow-lg">
            DEAL
          </span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const isCurrentlyBookmarked = deal.isBookmarked === true;
            console.log('Home heart button clicked!', deal.id, 'isBookmarked:', deal.isBookmarked, 'treated as:', isCurrentlyBookmarked);
            toggleFavorite(deal.id, isCurrentlyBookmarked);
          }}
          className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
        >
          <Heart 
            className={`w-5 h-5 ${deal.isBookmarked === true ? 'fill-red-500 text-red-500' : 'text-white'}`} 
          />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-white">{deal.title}</h3>
        <p className="text-gray-300 text-sm mb-3">{deal.description || 'Great deal available!'}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-white">{deal.restaurant.name}</p>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>
                {(() => {
                  const city = deal.restaurant.city?.trim();
                  const province = deal.restaurant.province?.trim();
                  const streetAddress = deal.restaurant.streetAddress?.trim();

                  // Handle cases where city/province might be empty strings or placeholder values
                  const hasValidCity = city && city !== '' && city.toLowerCase() !== 'unknown' && city.toLowerCase() !== 'location not set' && city.toLowerCase() !== 'null';
                  const hasValidProvince = province && province !== '' && province.toLowerCase() !== 'unknown' && province.toLowerCase() !== 'location not set' && province.toLowerCase() !== 'null';
                  const hasValidAddress = streetAddress && streetAddress !== '' && streetAddress.toLowerCase() !== 'unknown' && streetAddress.toLowerCase() !== 'null';
                  
                  if (hasValidAddress) {
                    return streetAddress;
                  } else if (hasValidCity && hasValidProvince) {
                    return `${city}, ${province}`;
                  } else if (hasValidCity) {
                    return city;
                  } else if (hasValidProvince) {
                    return province;
                  } else {
                    return 'Unknown';
                  }
                })()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-400">Active</p>
            <p className="text-sm text-gray-400">{deal.status}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="neon" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/deals/${deal.id}`);
            }}
          >
            View Deal
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/restaurants/${deal.restaurant.id}`);
            }}
          >
            <MapPin className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-xs text-gray-400 mt-2 text-center">
          Expires: {formatDateShort(deal.endDate)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex justify-center">
      <div className="w-full max-w-md mx-auto">
        <MobileLayout showHeader={false}>
          {/* Custom Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white px-6 py-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold">Welcome back! 👋</h1>
                <div className="flex items-center gap-1 text-white/90">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{formatLocation(user?.location || '')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm relative"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
                <button 
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                  onClick={() => navigate('/search')}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 pt-4 pb-20">
            {/* Cuisine Filter */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">Cuisines</h2>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Filter className="w-4 h-4 text-gray-300" />
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {cuisineTypes.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => setSelectedCuisine(cuisine)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCuisine === cuisine
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {cuisine === 'all' ? 'All' : cuisine}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Deals */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-white">🔥 Hot Deals Near You</h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div>
                  {filteredDeals.length > 0 ? (
                    filteredDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">No deals available yet</p>
                      <p className="text-gray-500 text-sm">Check back soon for exciting food deals!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </MobileLayout>
        <BottomNavigation />
      </div>
    </div>
  );
};