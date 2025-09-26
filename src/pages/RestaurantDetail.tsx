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
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Plus,
  Tag,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { restaurantService, Restaurant, MenuSection, MenuItem, Deal } from '@/services/restaurantService';
import { ratingService, MyRating } from '@/services/ratingService';
import { StarRating } from '@/components/ui/star-rating';
import { RatingDialog } from '@/components/RatingDialog';
import { RatingsView } from '@/components/RatingsView';
import heroImage from '@/assets/hero-food.jpg';

export const RestaurantDetail: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [menuItems, setMenuItems] = useState<{ [sectionId: number]: MenuItem[] }>({});
  const [expandedSections, setExpandedSections] = useState<{ [sectionId: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  
  // Rating state
  const [userRating, setUserRating] = useState<MyRating | null>(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showRatingsView, setShowRatingsView] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<{ id: number; name: string } | null>(null);

  const loadRestaurant = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await restaurantService.getRestaurant(parseInt(id), token || undefined);
      
      if (response.success && response.data) {
        console.log(response.data);
        setRestaurant(response.data.restaurant);
        setActiveDeals(response.data.activeDeals);
      } else {
        toast({
          title: "Error",
          description: "Restaurant not found.",
          variant: "destructive",
        });
        navigate('/restaurants');
      }
    } catch (error) {
      console.error('Failed to load restaurant:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurant details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast, navigate, getToken]);

  const loadMenu = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoadingMenu(true);
      const response = await restaurantService.getRestaurantMenu(parseInt(id));
      
      if (response.success && response.data) {
        setMenuSections(response.data.sections);
        
        // Group menu items by section
        const itemsBySection: { [sectionId: number]: MenuItem[] } = {};
        response.data.items.forEach(item => {
          if (!itemsBySection[item.sectionId]) {
            itemsBySection[item.sectionId] = [];
          }
          itemsBySection[item.sectionId].push(item);
        });
        setMenuItems(itemsBySection);
        
        // Auto-expand first section
        if (response.data.sections.length > 0) {
          setExpandedSections({ [response.data.sections[0].id]: true });
        }
      }
    } catch (error) {
      console.error('Failed to load menu:', error);
      toast({
        title: "Error",
        description: "Failed to load menu.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMenu(false);
    }
  }, [id, toast]);

  const loadUserRating = useCallback(async () => {
    if (!id) return;
    
    try {
      const token = await getToken();
      const { hasRated, rating } = await ratingService.hasUserRated('restaurant', parseInt(id), token || undefined);
      
      if (hasRated && rating) {
        setUserRating(rating);
      }
    } catch (error) {
      console.error('Failed to load user rating:', error);
    }
  }, [id, getToken]);

  useEffect(() => {
    loadRestaurant();
    loadMenu();
    loadUserRating();
  }, [loadRestaurant, loadMenu, loadUserRating]);

  const toggleBookmark = async () => {
    if (!restaurant) return;
    
    try {
      const token = await getToken();
      if (restaurant.isBookmarked) {
        await restaurantService.unbookmarkRestaurant(restaurant.id, token || undefined);
        toast({
          title: "Removed from bookmarks",
          description: "Restaurant removed from your bookmarks.",
        });
      } else {
        await restaurantService.bookmarkRestaurant(restaurant.id, true, token || undefined);
        toast({
          title: "Added to bookmarks",
          description: "Restaurant bookmarked successfully.",
        });
      }
      
      setRestaurant(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
      
      // Dispatch bookmark change event for cross-page sync
      window.dispatchEvent(new CustomEvent('bookmarkChanged', { 
        detail: { 
          id: restaurant.id, 
          type: 'restaurant', 
          isBookmarked: !restaurant.isBookmarked 
        } 
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark status.",
        variant: "destructive",
      });
    }
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const handleRateRestaurant = () => {
    setSelectedMenuItem(null);
    setShowRatingDialog(true);
  };

  const handleRateMenuItem = (item: MenuItem) => {
    // Menu item ratings are currently not fully supported
    toast({
      title: "Feature not available",
      description: "Menu item ratings are coming soon!",
      variant: "default",
    });
    // setSelectedMenuItem({ id: item.id, name: item.name });
    // setShowRatingDialog(true);
  };

  const handleRatingSubmitted = () => {
    // Reload restaurant data to get updated rating
    loadRestaurant();
    loadUserRating();
  };

  const handleViewRatings = (targetType: 'restaurant' | 'menu_item', targetId: number) => {
    // For now, we'll just show restaurant ratings. Menu item ratings can be added later.
    if (targetType === 'restaurant') {
      setShowRatingsView(true);
    }
  };

  const getHoursStatus = (openingTime?: string, closingTime?: string) => {
    if (!openingTime || !closingTime) return null;
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex justify-center">
        <div className="w-full max-w-md mx-auto">
          <MobileLayout 
            showHeader={true}
            headerTitle="Loading..."
            showBackButton={true}
            onBackClick={() => navigate('/restaurants')}
          >
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </MobileLayout>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex justify-center">
        <div className="w-full max-w-md mx-auto">
          <MobileLayout 
            showHeader={true}
            headerTitle="Restaurant Not Found"
            showBackButton={true}
            onBackClick={() => navigate('/restaurants')}
          >
            <div className="text-center py-8">
              <p className="text-gray-400">Restaurant not found</p>
            </div>
          </MobileLayout>
        </div>
      </div>
    );
  }

  const hoursStatus = getHoursStatus(restaurant.openingTime, restaurant.closingTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex justify-center">
      <div className="w-full max-w-md mx-auto">
        <MobileLayout 
          showHeader={true}
          headerTitle={restaurant.name}
          showBackButton={true}
          onBackClick={() => navigate('/restaurants')}
        >
          <div className="pb-20">
            {/* Restaurant Header */}
            <div className="relative">
              <img 
                src={heroImage} 
                alt={restaurant.name}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={toggleBookmark}
                className="absolute top-4 right-4 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
              >
                <Heart 
                  className={`w-6 h-6 ${restaurant.isBookmarked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                />
              </button>
              
              {activeDeals.length > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {activeDeals.length} ACTIVE DEALS
                  </span>
                </div>
              )}
            </div>

            {/* Restaurant Info */}
            <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-1">{restaurant.name}</h1>
                  <p className="text-gray-300">{restaurant.description || 'Delicious food awaits!'}</p>
                </div>
                {restaurant.ratingAvg && restaurant.ratingCount && restaurant.ratingCount > 0 ? (
                  <button
                    onClick={() => handleViewRatings('restaurant', restaurant.id)}
                    className="flex items-center gap-1 ml-4 hover:bg-gray-700 rounded-lg p-2 transition-colors"
                  >
                    <StarRating rating={parseFloat(restaurant.ratingAvg.toString())} readOnly size="sm" />
                    <span className="text-lg font-bold text-white ml-1">
                      {parseFloat(restaurant.ratingAvg.toString()).toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({restaurant.ratingCount})
                    </span>
                  </button>
                ) : (
                  <div className="text-sm text-gray-400 ml-4">
                    No ratings yet
                  </div>
                )}
              </div>

              {/* Rating Actions */}
              <div className="flex gap-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRateRestaurant}
                  className="flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  {userRating ? 'Update Rating' : 'Rate Restaurant'}
                </Button>
                
                {restaurant.ratingCount && restaurant.ratingCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewRatings('restaurant', restaurant.id)}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    View Reviews ({restaurant.ratingCount})
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                {(restaurant.streetAddress || restaurant.city) && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {[restaurant.streetAddress, restaurant.city].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                
                {restaurant.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Phone className="w-4 h-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
                
                {hoursStatus && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className={hoursStatus.color}>
                      {hoursStatus.status}
                    </span>
                    {restaurant.openingTime && restaurant.closingTime && (
                      <span className="text-gray-400">
                        • {restaurant.openingTime} - {restaurant.closingTime}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Active Deals */}
            {activeDeals.length > 0 && (
              <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Active Deals</h2>
                </div>
                <div className="space-y-3">
                  {activeDeals.map((deal) => (
                    <div key={deal.id} className="bg-gray-700 rounded-lg p-4 border border-green-500/20">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{deal.title}</h3>
                        <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold ml-2 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          DEAL
                        </div>
                      </div>
                      {deal.description && (
                        <p className="text-gray-300 text-sm mb-3">{deal.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Valid until: {new Date(deal.endDate).toLocaleDateString()}</span>
                        </div>
                        <span>Started: {new Date(deal.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menu */}
            <div className="px-6 py-4">
              <h2 className="text-xl font-bold text-white mb-4">Menu</h2>
              
              {isLoadingMenu ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : menuSections.length > 0 ? (
                <div className="space-y-4">
                  {menuSections.map((section) => (
                    <div key={section.id} className="bg-gray-800 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-gray-700 hover:bg-gray-600 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                        {expandedSections[section.id] ? (
                          <ChevronUp className="w-5 h-5 text-gray-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                      
                      {expandedSections[section.id] && menuItems[section.id] && (
                        <div className="p-4 space-y-4">
                          {menuItems[section.id].map((item) => (
                            <div key={item.id} className="border border-gray-600 rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-white">{item.name}</h4>
                                  <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                                </div>
                                <div className="ml-4 text-right">
                                  <span className="text-lg font-bold text-green-400">
                                    {formatPrice(item.priceCents)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Menu Item Actions */}
                              <div className="flex items-center justify-between pt-2 border-t border-gray-600">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRateMenuItem(item)}
                                  className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"
                                  disabled
                                >
                                  <Plus className="w-3 h-3" />
                                  Rate Item (Coming Soon)
                                </Button>
                                
                                {/* Placeholder for item rating display - can be expanded later */}
                                <div className="text-xs text-gray-500">
                                  Menu item ratings coming soon
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Menu not available</p>
                </div>
              )}
            </div>
          </div>
        </MobileLayout>
        <BottomNavigation />
        
        {/* Rating Dialog */}
        <RatingDialog
          isOpen={showRatingDialog}
          onClose={() => setShowRatingDialog(false)}
          targetType={selectedMenuItem ? 'menu_item' : 'restaurant'}
          targetId={selectedMenuItem ? selectedMenuItem.id : restaurant.id}
          targetName={selectedMenuItem ? selectedMenuItem.name : restaurant.name}
          existingRating={!selectedMenuItem && userRating ? {
            id: userRating.id,
            rating: userRating.rating,
            comment: userRating.comment
          } : undefined}
          onRatingSubmitted={handleRatingSubmitted}
        />
        
        {/* Ratings View */}
        <RatingsView
          isOpen={showRatingsView}
          onClose={() => setShowRatingsView(false)}
          targetType="restaurant"
          targetId={restaurant.id}
          targetName={restaurant.name}
        />
      </div>
    </div>
  );
};