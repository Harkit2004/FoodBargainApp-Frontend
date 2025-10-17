import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import FilterSheet, { FilterOptions } from '@/components/FilterSheet';
import { 
  Search as SearchIcon, 
  MapPin,
  Star, 
  Heart,
  Utensils,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { restaurantService, Restaurant } from '@/services/restaurantService';
import { dealsService, Deal } from '@/services/dealsService';
import { preferencesService } from '@/services/preferencesService';
import { 
  getCurrentLocation, 
  calculateDistance, 
  formatDistance, 
  getLocationCoordinates,
  DEFAULT_COORDINATES,
  type Coordinates 
} from '@/utils/locationUtils';
import heroImage from '@/assets/hero-food.jpg';

interface SearchResult {
  id: number;
  type: 'restaurant' | 'deal';
  title: string;
  subtitle: string;
  description: string;
  rating?: number;
  distance: string;
  price?: string;
  discount?: number;
  imageUrl: string;
  isBookmarked: boolean;
  tags: string[];
  originalData: Restaurant | Deal;
}

export const Search: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    distance: null,
    cuisines: [],
    dietaryPreferences: [],
    showType: 'all',
    sortBy: 'relevance',
  });
  const [cuisineNames, setCuisineNames] = useState<Map<number, string>>(new Map());
  const [dietaryNames, setDietaryNames] = useState<Map<number, string>>(new Map());

  // Request user's location on component mount
  useEffect(() => {
    const requestLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
        setLocationError(null);
      } catch (error) {
        console.warn('Failed to get user location:', error);
        setLocationError(error instanceof Error ? error.message : 'Location unavailable');
        // Use default Toronto coordinates as fallback
        setUserLocation(DEFAULT_COORDINATES);
      }
    };

    requestLocation();
  }, []);

  // Load preference names for mapping IDs to names
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await preferencesService.getAllPreferences();
        const cuisineMap = new Map(prefs.cuisines.map(c => [c.id, c.name]));
        const dietaryMap = new Map(prefs.dietaryPreferences.map(d => [d.id, d.name]));
        setCuisineNames(cuisineMap);
        setDietaryNames(dietaryMap);
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  // Listen for bookmark changes from other pages
  useEffect(() => {
    const handleBookmarkChange = (event: CustomEvent) => {
      const { id, type, isBookmarked } = event.detail;
      setSearchResults(prev =>
        prev.map(result =>
          result.id === id && result.type === type
            ? { ...result, isBookmarked }
            : result
        )
      );
    };

    window.addEventListener('bookmarkChanged', handleBookmarkChange as EventListener);
    return () => {
      window.removeEventListener('bookmarkChanged', handleBookmarkChange as EventListener);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const performSearch = useCallback(async (query: string = '', currentFilters: FilterOptions = filters) => {
    console.log('=== SEARCH STARTED ===');
    console.log('Search query:', query);
    console.log('Current filters:', currentFilters);
    console.log('User location:', userLocation);
    
    setIsSearching(true);
    try {
      const token = await getToken();
      
      // Build search parameters with filters
      const searchParams: {
        query?: string;
        limit: number;
        latitude?: number;
        longitude?: number;
        radius?: number;
        cuisine?: string;
        dietaryPreference?: string;
        sortBy?: string;
        sortOrder?: string;
      } = { limit: 20 };
      
      // Add query only if provided
      if (query.trim()) {
        searchParams.query = query;
      }
      
      // Add location and radius ONLY if distance filter is selected
      if (userLocation && currentFilters.distance !== null) {
        searchParams.latitude = userLocation.latitude;
        searchParams.longitude = userLocation.longitude;
        searchParams.radius = currentFilters.distance;
        console.log('Distance filter applied:', currentFilters.distance, 'km');
      } else {
        console.log('No distance filter applied');
      }
      
      // Add cuisine filter (send first selected cuisine name)
      if (currentFilters.cuisines.length > 0) {
        const firstCuisine = cuisineNames.get(currentFilters.cuisines[0]);
        if (firstCuisine) {
          searchParams.cuisine = firstCuisine;
          console.log('Cuisine filter applied:', firstCuisine);
        }
      }
      
      // Add dietary preference filter (send first selected dietary preference name)
      if (currentFilters.dietaryPreferences.length > 0) {
        const firstDietary = dietaryNames.get(currentFilters.dietaryPreferences[0]);
        if (firstDietary) {
          searchParams.dietaryPreference = firstDietary;
          console.log('Dietary filter applied:', firstDietary);
        }
      }

      // Add sorting parameters
      if (currentFilters.sortBy === 'rating') {
        searchParams.sortBy = 'ratingAvg';
        searchParams.sortOrder = 'desc';
        console.log('Sort by rating (highest first) applied');
      } else {
        searchParams.sortBy = 'relevance';
        console.log('Sort by relevance (newest first) applied');
      }
      
      console.log('API call params:', searchParams);
      
      // Always fetch both restaurants and deals
      // We'll filter deals on the frontend since backend doesn't support deal filtering yet
      const [restaurantResponse, dealResponse] = await Promise.all([
        restaurantService.searchRestaurants(searchParams, token || undefined),
        dealsService.getDeals({ status: 'active', limit: 100 }, token || undefined)
      ]);
      
      console.log('Restaurant API response:', restaurantResponse.success, 'Count:', restaurantResponse.data?.restaurants?.length || 0);
      console.log('Deal API response:', dealResponse.success, 'Count:', dealResponse.data?.deals?.length || 0);

      const results: SearchResult[] = [];
      const addedIds = new Set<string>(); // Track added items to prevent duplicates

      // Add restaurant results
      if (restaurantResponse.success && restaurantResponse.data) {
        console.log('Processing', restaurantResponse.data.restaurants.length, 'restaurants');
        restaurantResponse.data.restaurants.forEach((restaurant) => {
          const uniqueId = `restaurant-${restaurant.id}`;
          if (!addedIds.has(uniqueId)) {
            const city = restaurant.city?.trim();
            const province = restaurant.province?.trim();
            const streetAddress = restaurant.streetAddress?.trim();
            
            const hasValidCity = city && city !== '' && city.toLowerCase() !== 'unknown';
            const hasValidProvince = province && province !== '' && province.toLowerCase() !== 'unknown';
            const hasValidAddress = streetAddress && streetAddress !== '' && streetAddress.toLowerCase() !== 'unknown';
            
            let subtitle = '';
            if (hasValidAddress) {
              subtitle = streetAddress;
            } else if (hasValidCity && hasValidProvince) {
              subtitle = `${city}, ${province}`;
            } else if (hasValidCity) {
              subtitle = city;
            } else if (hasValidProvince) {
              subtitle = province;
            } else {
              subtitle = 'Unknown';
            }

            // Calculate actual distance
            let distance = '2.5 km'; // fallback
            if (userLocation) {
              const restaurantCoords = getLocationCoordinates(restaurant);
              if (restaurantCoords) {
                const distanceKm = calculateDistance(userLocation, restaurantCoords);
                distance = formatDistance(distanceKm);
              }
            }
            
            addedIds.add(uniqueId);
            results.push({
              id: restaurant.id,
              type: 'restaurant',
              title: restaurant.name,
              subtitle: subtitle,
              description: restaurant.description || 'Restaurant serving delicious food',
              rating: restaurant.ratingAvg ? parseFloat(restaurant.ratingAvg.toString()) : undefined,
              distance: distance,
              imageUrl: heroImage,
              isBookmarked: restaurant.isBookmarked || false,
              tags: [hasValidCity ? city : 'Toronto', 'Restaurant'],
              originalData: restaurant
            });
          }
        });
      }

      // Add deal results
      if (dealResponse.success && dealResponse.data) {
        console.log('Processing', dealResponse.data.deals.length, 'deals');
        dealResponse.data.deals.forEach((deal) => {
          const uniqueId = `deal-${deal.id}`;
          
          // If there's a query, filter deals by it; otherwise include all deals
          const matchesQuery = !query.trim() || 
            deal.title.toLowerCase().includes(query.toLowerCase()) ||
            deal.description?.toLowerCase().includes(query.toLowerCase()) ||
            deal.restaurant.name.toLowerCase().includes(query.toLowerCase());
          
          if (!addedIds.has(uniqueId) && matchesQuery) {
            
            const city = deal.restaurant.city?.trim();
            const province = deal.restaurant.province?.trim();
            const streetAddress = deal.restaurant.streetAddress?.trim();
            
            const hasValidCity = city && city !== '' && city.toLowerCase() !== 'unknown';
            const hasValidProvince = province && province !== '' && province.toLowerCase() !== 'unknown';
            const hasValidAddress = streetAddress && streetAddress !== '' && streetAddress.toLowerCase() !== 'unknown';
            
            let locationTag = 'Toronto';
            if (hasValidAddress) {
              locationTag = streetAddress;
            } else if (hasValidCity) {
              locationTag = city;
            } else if (hasValidProvince) {
              locationTag = province;
            }

            // Calculate actual distance using restaurant coordinates
            let distance = '2.5 km'; // fallback
            if (userLocation) {
              const restaurantCoords = getLocationCoordinates(deal.restaurant);
              if (restaurantCoords) {
                const distanceKm = calculateDistance(userLocation, restaurantCoords);
                distance = formatDistance(distanceKm);
              }
            }
            
            addedIds.add(uniqueId);
            results.push({
              id: deal.id,
              type: 'deal',
              title: deal.title,
              subtitle: deal.restaurant.name,
              description: deal.description || 'Great deal available!',
              rating: deal.restaurant.ratingAvg ? parseFloat(deal.restaurant.ratingAvg.toString()) : undefined,
              distance: distance,
              price: 'Deal',
              imageUrl: heroImage,
              isBookmarked: deal.isBookmarked || false,
              tags: ['Deal', locationTag],
              originalData: deal
            });
          }
        });
      }

      console.log('Results before frontend filtering:', results.length);
      
      let filteredResults = results;
      
      // Filter deals by cuisine (restaurants already filtered by backend)
      if (currentFilters.cuisines.length > 0) {
        console.log('Applying cuisine filter to deals. Selected cuisines:', currentFilters.cuisines);
        const beforeCount = filteredResults.length;
        filteredResults = filteredResults.filter(result => {
          if (result.type === 'deal') {
            const deal = result.originalData as Deal;
            // Check if the deal has any of the selected cuisines
            if (deal.cuisines && deal.cuisines.length > 0) {
              const dealCuisineIds = deal.cuisines.map(c => c.id);
              const hasMatchingCuisine = currentFilters.cuisines.some(cuisineId => 
                dealCuisineIds.includes(cuisineId)
              );
              console.log(`Deal "${deal.title}" cuisines: [${dealCuisineIds}] - ${hasMatchingCuisine ? 'INCLUDED' : 'EXCLUDED'}`);
              return hasMatchingCuisine;
            }
            console.log(`Deal "${deal.title}" has no cuisines - EXCLUDED`);
            return false; // Exclude deals without cuisine data when filter is active
          }
          return true; // Keep all restaurants (already filtered by backend)
        });
        console.log('After cuisine filter:', beforeCount, '->', filteredResults.length);
      }
      
      // Filter deals by dietary preferences (restaurants already filtered by backend)
      if (currentFilters.dietaryPreferences.length > 0) {
        console.log('Applying dietary filter to deals. Selected dietary prefs:', currentFilters.dietaryPreferences);
        const beforeCount = filteredResults.length;
        filteredResults = filteredResults.filter(result => {
          if (result.type === 'deal') {
            const deal = result.originalData as Deal;
            // Check if the deal has any of the selected dietary preferences
            if (deal.dietaryPreferences && deal.dietaryPreferences.length > 0) {
              const dealDietaryIds = deal.dietaryPreferences.map(d => d.id);
              const hasMatchingDietary = currentFilters.dietaryPreferences.some(dietaryId => 
                dealDietaryIds.includes(dietaryId)
              );
              console.log(`Deal "${deal.title}" dietary: [${dealDietaryIds}] - ${hasMatchingDietary ? 'INCLUDED' : 'EXCLUDED'}`);
              return hasMatchingDietary;
            }
            console.log(`Deal "${deal.title}" has no dietary preferences - EXCLUDED`);
            return false; // Exclude deals without dietary data when filter is active
          }
          return true; // Keep all restaurants (already filtered by backend)
        });
        console.log('After dietary filter:', beforeCount, '->', filteredResults.length);
      }
      
      // Apply distance filter to deals based on restaurant location
      if (currentFilters.distance !== null && userLocation) {
        console.log('Applying distance filter to deals:', currentFilters.distance, 'km');
        const beforeCount = filteredResults.length;
        filteredResults = filteredResults.filter(result => {
          if (result.type === 'deal') {
            const deal = result.originalData as Deal;
            if (deal.restaurant) {
              const restaurantCoords = getLocationCoordinates(deal.restaurant);
              if (restaurantCoords) {
                const distanceKm = calculateDistance(userLocation, restaurantCoords);
                const isWithinDistance = distanceKm <= currentFilters.distance!;
                console.log(`Deal "${deal.title}" at ${distanceKm.toFixed(2)}km - ${isWithinDistance ? 'INCLUDED' : 'EXCLUDED'}`);
                return isWithinDistance;
              }
            }
            return true;
          }
          return true; // Restaurants already filtered by backend
        });
        console.log('After distance filter:', beforeCount, '->', filteredResults.length);
      }
      
      // Filter by show type
      if (currentFilters.showType !== 'all') {
        console.log('Applying showType filter:', currentFilters.showType);
        const beforeCount = filteredResults.length;
        filteredResults = filteredResults.filter(result => {
          if (currentFilters.showType === 'restaurants') return result.type === 'restaurant';
          if (currentFilters.showType === 'deals') return result.type === 'deal';
          return true;
        });
        console.log('After showType filter:', beforeCount, '->', filteredResults.length);
      }

      // Apply sorting
      if (currentFilters.sortBy === 'rating') {
        console.log('Applying rating sort (highest first)');
        filteredResults.sort((a, b) => {
          // Get ratings - deals use restaurant rating, restaurants use own rating
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          
          // Sort descending (highest rating first)
          return ratingB - ratingA;
        });
      }

      console.log('=== FINAL RESULTS ===');
      console.log('Total results:', filteredResults.length);
      console.log('Restaurants:', filteredResults.filter(r => r.type === 'restaurant').length);
      console.log('Deals:', filteredResults.filter(r => r.type === 'deal').length);
      if (currentFilters.sortBy === 'rating') {
        console.log('Sorted by rating. Top 5 ratings:', filteredResults.slice(0, 5).map(r => ({ title: r.title, rating: r.rating })));
      }
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Error",
        description: "Failed to search. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [toast, getToken, userLocation, cuisineNames, dietaryNames, filters]);

  const handleSearch = useCallback((query: string) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query, filters); // Pass current filters explicitly
    }, 500); // 500ms debounce
  }, [performSearch, filters]);

  // Initial load - show all restaurants/deals when page loads
  useEffect(() => {
    if (userLocation && cuisineNames.size > 0) {
      performSearch('');
    }
  }, [userLocation, cuisineNames, performSearch]);

  const handleBookmarkToggle = async (id: number) => {
    console.log('Search bookmark toggle called:', id);
    const result = searchResults.find(r => r.id === id);
    if (!result) {
      console.log('No result found for id:', id);
      return;
    }

    console.log('Found result:', result.type, result.title, 'current bookmark status:', result.isBookmarked);

    try {
      const token = await getToken();
      console.log('Token obtained:', !!token);
      
      const isCurrentlyBookmarked = result.isBookmarked === true;
      
      if (result.type === 'restaurant') {
        if (isCurrentlyBookmarked) {
          console.log('Unbookmarking restaurant...');
          await restaurantService.unbookmarkRestaurant(id, token || undefined);
        } else {
          console.log('Bookmarking restaurant...');
          await restaurantService.bookmarkRestaurant(id, true, token || undefined);
        }
      } else if (result.type === 'deal') {
        if (isCurrentlyBookmarked) {
          console.log('Unfavoriting deal...');
          await dealsService.unfavoriteDeal(id, token || undefined);
        } else {
          console.log('Favoriting deal...');
          await dealsService.favoriteDeal(id, token || undefined);
        }
      }

      const newBookmarkStatus = !isCurrentlyBookmarked;
      
      // Update local state
      setSearchResults(prev =>
        prev.map(searchResult =>
          searchResult.id === id
            ? { ...searchResult, isBookmarked: newBookmarkStatus }
            : searchResult
        )
      );

      // Trigger a custom event to notify other pages of bookmark changes
      window.dispatchEvent(new CustomEvent('bookmarkChanged', { 
        detail: { 
          id, 
          type: result.type, 
          isBookmarked: newBookmarkStatus 
        } 
      }));

      toast({
        title: isCurrentlyBookmarked ? "Removed from favorites" : "Added to favorites",
        description: isCurrentlyBookmarked ? 
          `${result.title} removed from your favorites` : 
          `${result.title} added to your favorites`,
      });
    } catch (error) {
      console.error('Error in search bookmark toggle:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark status",
        variant: "destructive",
      });
    }
  };

  const ResultCard: React.FC<{ result: SearchResult }> = ({ result }) => (
    <div className="bg-card rounded-xl shadow-custom-sm overflow-hidden mb-4">
      <div className="relative">
        <img 
          src={result.imageUrl} 
          alt={result.title}
          className="w-full h-40 object-cover"
        />
        {result.type === 'deal' && result.discount && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm font-bold">
              {result.discount}% OFF
            </span>
          </div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const isCurrentlyBookmarked = result.isBookmarked === true;
            console.log('Search heart button clicked!', result.id, result.type, 'isBookmarked:', result.isBookmarked, 'treated as:', isCurrentlyBookmarked);
            handleBookmarkToggle(result.id);
          }}
          className="absolute top-3 right-3 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
        >
          <Heart 
            className={`w-5 h-5 ${result.isBookmarked === true ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
          />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{result.title}</h3>
            <p className="text-muted-foreground">{result.subtitle}</p>
          </div>
          {result.type === 'deal' && result.price && (
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{result.price}</p>
              <span className="text-xs text-muted-foreground">from</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{result.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            {result.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{result.rating}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{result.distance}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {result.type === 'deal' ? (
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
        
        <div className="flex flex-wrap gap-1 mb-3">
          {result.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <Button 
          variant="default" 
          size="sm" 
          className="w-full"
          onClick={() => {
            if (result.type === 'deal') {
              navigate(`/deals/${result.id}`);
            } else {
              navigate(`/restaurants/${result.id}`);
            }
          }}
        >
          {result.type === 'deal' ? 'View Deal' : 'View Restaurant'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md mx-auto">
        <MobileLayout showHeader={false}>
          {/* Search Header */}
          <div className="bg-gradient-primary text-primary-foreground px-6 py-4 shadow-custom-md">
          <h1 className="text-xl font-bold mb-4">Search</h1>
          
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search restaurants, deals, cuisines..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="pl-10 pr-12 bg-background text-foreground border-0 focus:ring-2 focus:ring-primary-light"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>
        </div>

          <div className="px-6 pt-4 pb-20">
          {/* Filter and Results Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {isSearching 
                ? 'Searching...' 
                : searchQuery 
                  ? `${searchResults.length} results for "${searchQuery}"`
                  : `${searchResults.length} restaurants & deals`
              }
            </h2>
            <FilterSheet
              filters={filters}
              onFiltersChange={(newFilters) => {
                console.log('Search: Filters changed to:', newFilters);
                setFilters(newFilters);
              }}
              onApply={(appliedFilters) => {
                console.log('Search: Apply clicked with filters:', appliedFilters);
                performSearch(searchQuery, appliedFilters);
              }}
            />
          </div>

          {/* Search Results */}
          {isSearching ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Searching for delicious deals...</p>
            </div>
          ) : (
            searchResults.map((result) => (
              <ResultCard key={`${result.type}-${result.id}`} result={result} />
            ))
          )}
          </div>
        </MobileLayout>
        <BottomNavigation />
      </div>
    </div>
  );
};