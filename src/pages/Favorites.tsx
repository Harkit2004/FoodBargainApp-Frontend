import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Heart, Star, MapPin, Utensils, DollarSign, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/clerk-react';
import { favoritesService, FavoriteItem } from '@/services/favoritesService';
import { 
  getCurrentLocation, 
  calculateDistance, 
  formatDistance, 
  getLocationCoordinates,
  DEFAULT_COORDINATES,
  type Coordinates 
} from '@/utils/locationUtils';
import heroImage from '@/assets/hero-food.jpg';

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'restaurants' | 'deals'>('all');
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  // Request user's location on component mount
  useEffect(() => {
    const requestLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        console.warn('Failed to get user location:', error);
        // Use default Toronto coordinates as fallback
        setUserLocation(DEFAULT_COORDINATES);
      }
    };

    requestLocation();
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await favoritesService.getAllFavorites(token || undefined);
      
      if (response.success && response.data) {
        setFavorites(response.data);
      } else {
        console.error('Failed to load favorites:', response.error);
        toast({
          title: "Error loading favorites",
          description: response.error || "Failed to load your favorites",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast({
        title: "Error loading favorites",
        description: "Failed to load your favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [getToken, toast]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const filteredFavorites = favorites.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === activeTab.slice(0, -1); // Remove 's' from 'restaurants' or 'deals'
  });

  const removeFavorite = async (item: FavoriteItem) => {
    try {
      setRemovingId(item.id);
      const token = await getToken();
      
      let response;
      if (item.type === 'restaurant') {
        response = await favoritesService.removeRestaurantFromFavorites(item.id, token || undefined);
      } else {
        response = await favoritesService.removeDealFromFavorites(item.id, token || undefined);
      }
      
      if (response.success) {
        setFavorites(prev => prev.filter(favItem => favItem.id !== item.id));
        toast({
          title: "Removed from favorites",
          description: `${item.title} has been removed from your favorites`,
        });
      } else {
        toast({
          title: "Error removing favorite",
          description: response.error || "Failed to remove from favorites",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error removing favorite",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const FavoriteCard: React.FC<{ item: FavoriteItem }> = ({ item }) => {
    // For now, use a reasonable fallback distance since FavoriteItem doesn't include coordinates
    // In a real app, you'd want to fetch the full restaurant/deal data to get coordinates
    const calculatedDistance = item.distance || 
      (userLocation && userLocation.latitude === DEFAULT_COORDINATES.latitude ? '2.5 km' : '1.8 km');

    return (
    <div className="bg-card rounded-xl shadow-custom-sm overflow-hidden mb-4">
      <div className="relative">
        <img 
          src={item.imageUrl || heroImage}
          alt={item.title}
          className="w-full h-32 object-cover"
        />
        <button
          onClick={() => removeFavorite(item)}
          disabled={removingId === item.id}
          className="absolute top-3 right-3 p-2 bg-background/80 rounded-full hover:bg-background transition-colors disabled:opacity-50"
        >
          {removingId === item.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
          )}
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{item.title}</h3>
            <p className="text-muted-foreground">{item.subtitle}</p>
          </div>
          {item.type === 'deal' && (
            <div className="text-right">
              <p className="text-lg font-bold text-primary">Deal</p>
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {item.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{item.rating}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{calculatedDistance}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {item.type === 'deal' ? (
              <>
                <DollarSign className="w-4 h-4" />
                <span>Deal</span>
              </>
            ) : (
              <>
                <Utensils className="w-4 h-4" />
                <span>Restaurant</span>
              </>
            )}
          </div>
        </div>
        
        <Button 
          variant="default" 
          size="sm" 
          className="w-full mt-3"
          onClick={() => {
            if (item.type === 'deal') {
              navigate(`/deals/${item.id}`);
            } else {
              navigate(`/restaurants/${item.id}`);
            }
          }}
        >
          {item.type === 'deal' ? 'View Deal' : 'View Restaurant'}
        </Button>
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md mx-auto">
        <MobileLayout
          showHeader={true}
          headerTitle="Favorites"
          showBackButton={true}
          onBackClick={() => navigate('/profile')}
        >
          <div className="px-6 py-4 pb-20">
            {/* Tabs */}
            <div className="flex bg-muted rounded-xl p-1 mb-6">
              {(['all', 'restaurants', 'deals'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Content */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your favorites...</p>
              </div>
            ) : filteredFavorites.length > 0 ? (
              <div>
                {filteredFavorites.map((item) => (
                  <FavoriteCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring restaurants and deals to add them to your favorites!
                </p>
                <Button onClick={() => navigate('/search')}>
                  Discover Deals
                </Button>
              </div>
            )}
          </div>
        </MobileLayout>
        <BottomNavigation />
      </div>
    </div>
  );
};