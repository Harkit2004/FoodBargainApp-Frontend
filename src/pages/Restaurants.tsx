import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  MapPin, 
  Star, 
  Heart,
  Clock,
  Phone,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { restaurantService, Restaurant } from '@/services/restaurantService';
import heroImage from '@/assets/hero-food.jpg';

export const Restaurants: React.FC = () => {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const cuisineFilters = ['all', 'Italian', 'Japanese', 'Indian', 'American', 'Chinese', 'Mexican'];

  const loadRestaurants = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      console.log('Loading restaurants with token:', !!token);
      const response = await restaurantService.searchRestaurants({ limit: 20 }, token || undefined);
      
      if (response.success && response.data) {
        console.log('Restaurants loaded:', response.data.restaurants.map(r => ({ id: r.id, name: r.name, isBookmarked: r.isBookmarked })));
        setRestaurants(response.data.restaurants);
      }
    } catch (error) {
      console.error('Failed to load restaurants:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, getToken]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  // Listen for bookmark changes from other pages
  useEffect(() => {
    const handleBookmarkChange = (event: CustomEvent) => {
      const { id, type, isBookmarked } = event.detail;
      if (type === 'restaurant') {
        setRestaurants(prev =>
          prev.map(restaurant =>
            restaurant.id === id
              ? { ...restaurant, isBookmarked }
              : restaurant
          )
        );
      }
    };

    window.addEventListener('bookmarkChanged', handleBookmarkChange as EventListener);
    return () => {
      window.removeEventListener('bookmarkChanged', handleBookmarkChange as EventListener);
    };
  }, []);

  const toggleBookmark = async (restaurantId: number, currentStatus: boolean) => {
    console.log('Toggle bookmark called:', { restaurantId, currentStatus });
    try {
      const token = await getToken();
      console.log('Token obtained:', !!token);
      
      if (currentStatus) {
        console.log('Unbookmarking restaurant...');
        await restaurantService.unbookmarkRestaurant(restaurantId, token || undefined);
        toast({
          title: "Removed from favorites",
          description: "Restaurant removed from your favorites.",
        });
      } else {
        console.log('Bookmarking restaurant...');
        await restaurantService.bookmarkRestaurant(restaurantId, true, token || undefined);
        toast({
          title: "Added to favorites",
          description: "Restaurant added to your favorites.",
        });
      }
      
      // Update local state
      setRestaurants(prevRestaurants =>
        prevRestaurants.map(restaurant =>
          restaurant.id === restaurantId
            ? { ...restaurant, isBookmarked: !currentStatus }
            : restaurant
        )
      );

      // Trigger a custom event to notify other pages of bookmark changes
      window.dispatchEvent(new CustomEvent('bookmarkChanged', { 
        detail: { 
          id: restaurantId, 
          type: 'restaurant', 
          isBookmarked: !currentStatus 
        } 
      }));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark status.",
        variant: "destructive",
      });
    }
  };

  const formatTime12Hour = (time24: string): string => {
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'p.m.' : 'a.m.';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const getHoursStatus = (openingTime?: string, closingTime?: string) => {
    if (!openingTime || !closingTime) return { status: 'Unknown', color: 'text-gray-400' };
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [openHour, openMinute] = openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = closingTime.split(':').map(Number);
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    
    if (currentTime >= openTime && currentTime <= closeTime) {
      return { status: 'Open', color: 'text-green-400' };
    } else {
      return { status: 'Closed', color: 'text-red-400' };
    }
  };

  const filteredRestaurants = selectedFilter === 'all' 
    ? restaurants 
    : restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(selectedFilter.toLowerCase()) ||
        restaurant.description?.toLowerCase().includes(selectedFilter.toLowerCase())
      );

  const RestaurantCard: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => {
    const hoursStatus = getHoursStatus(restaurant.openingTime, restaurant.closingTime);
    
    return (
      <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-4 border border-gray-700">
        <div className="relative">
          <img 
            src={heroImage} 
            alt={restaurant.name}
            className="w-full h-48 object-cover"
          />
          {restaurant.activeDealsCount && restaurant.activeDealsCount > 0 && (
            <div className="absolute top-3 left-3">
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold shadow-lg">
                {restaurant.activeDealsCount} DEALS
              </span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const isCurrentlyBookmarked = restaurant.isBookmarked === true;
              console.log('Heart button clicked!', restaurant.id, 'isBookmarked:', restaurant.isBookmarked, 'treated as:', isCurrentlyBookmarked);
              toggleBookmark(restaurant.id, isCurrentlyBookmarked);
            }}
            className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            <Heart 
              className={`w-5 h-5 ${restaurant.isBookmarked === true ? 'fill-red-500 text-red-500' : 'text-white'}`} 
            />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-white">{restaurant.name}</h3>
              <p className="text-gray-300 text-sm">{restaurant.description || 'Delicious food awaits!'}</p>
            </div>
            {restaurant.ratingAvg && restaurant.ratingCount && restaurant.ratingCount > 0 ? (
              <div className="flex items-center gap-1 ml-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  {parseFloat(restaurant.ratingAvg.toString()).toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  ({restaurant.ratingCount})
                </span>
              </div>
            ) : (
              <div className="text-xs text-gray-400 ml-2">
                No ratings yet
              </div>
            )}
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MapPin className="w-4 h-4" />
              <span>
                {(() => {
                  const streetAddress = restaurant.streetAddress?.trim();
                  const city = restaurant.city?.trim();
                  const province = restaurant.province?.trim();
                  
                  const hasValidAddress = streetAddress && streetAddress !== '' && streetAddress.toLowerCase() !== 'unknown';
                  const hasValidCity = city && city !== '' && city.toLowerCase() !== 'unknown';
                  const hasValidProvince = province && province !== '' && province.toLowerCase() !== 'unknown';
                  
                  if (hasValidAddress && hasValidCity && hasValidProvince) {
                    return `${streetAddress}, ${city}, ${province}`;
                  } else if (hasValidAddress && hasValidCity) {
                    return `${streetAddress}, ${city}`;
                  } else if (hasValidCity && hasValidProvince) {
                    return `${city}, ${province}`;
                  } else if (hasValidAddress) {
                    return streetAddress;
                  } else if (hasValidCity) {
                    return city;
                  } else if (hasValidProvince) {
                    return province;
                  } else {
                    return 'Toronto, ON';
                  }
                })()}
              </span>
            </div>
            
            {restaurant.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Phone className="w-4 h-4" />
                <span>{restaurant.phone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className={hoursStatus.color}>
                {hoursStatus.status}
              </span>
              {restaurant.openingTime && restaurant.closingTime && (
                <span className="text-gray-400">
                  • {formatTime12Hour(restaurant.openingTime)} - {formatTime12Hour(restaurant.closingTime)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="neon" 
              size="sm" 
              className="flex-1"
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            >
              View Menu
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => {
                toast({
                  title: "Directions",
                  description: `Opening directions to ${restaurant.name}`,
                });
              }}
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex justify-center">
      <div className="w-full max-w-md mx-auto">
        <MobileLayout 
          showHeader={true}
          headerTitle="Restaurants"
          showBackButton={true}
          onBackClick={() => navigate('/')}
        >
          <div className="px-6 pt-4 pb-20">
            {/* Filter Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">Filter by Cuisine</h2>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Filter className="w-4 h-4 text-gray-300" />
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {cuisineFilters.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => setSelectedFilter(cuisine)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedFilter === cuisine
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {cuisine === 'all' ? 'All Cuisines' : cuisine}
                  </button>
                ))}
              </div>
            </div>

            {/* Restaurant List */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-white">
                {filteredRestaurants.length} Restaurants Found
              </h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div>
                  {filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map((restaurant) => (
                      <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">No restaurants found</p>
                      <p className="text-gray-500 text-sm">Try adjusting your filters or check back soon!</p>
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