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
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { restaurantService, Restaurant } from '@/services/restaurantService';
import { RestaurantCard } from '@/components/RestaurantCard';
import heroImage from '@/assets/hero-food.jpg';

export const Restaurants: React.FC = () => {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
            {/* Restaurant List */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-white">
                {restaurants.length} Restaurants Found
              </h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div>
                  {restaurants.length > 0 ? (
                    restaurants.map((restaurant) => (
                      <RestaurantCard 
                        key={restaurant.id} 
                        restaurant={restaurant} 
                        onToggleFavorite={toggleBookmark}
                      />
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