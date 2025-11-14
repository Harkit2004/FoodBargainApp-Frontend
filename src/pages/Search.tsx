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
import { searchService, type SearchRequest } from '@/services/searchService';
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
  cuisines?: Array<{ id: number; name: string }>;
  dietaryPreferences?: Array<{ id: number; name: string }>;
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
  const latestSearchIdRef = useRef(0);
  const [filters, setFilters] = useState<FilterOptions>({
    distance: null,
    cuisines: [],
    dietaryPreferences: [],
    showType: 'all',
    sortBy: 'relevance',
  });

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

  const performSearch = useCallback(
    async (query: string = '', currentFilters: FilterOptions = filters) => {
      const searchId = ++latestSearchIdRef.current;
      setIsSearching(true);
      try {
        const token = await getToken();

        const trimmedQuery = query.trim();
        const applyDistanceFilter = currentFilters.showType !== 'deals';
        const requestPayload: SearchRequest = {
          query: trimmedQuery || undefined,
          showType: currentFilters.showType,
          sortBy: currentFilters.sortBy === 'rating' ? 'rating' : 'relevance',
          sortOrder: currentFilters.sortBy === 'rating' ? 'desc' : 'desc',
          latitude: userLocation?.latitude,
          longitude: userLocation?.longitude,
          distanceKm: applyDistanceFilter ? currentFilters.distance ?? undefined : undefined,
          cuisineIds: currentFilters.cuisines.length ? currentFilters.cuisines : undefined,
          dietaryPreferenceIds: currentFilters.dietaryPreferences.length
            ? currentFilters.dietaryPreferences
            : undefined,
          limit: 50,
        };

        const response = await searchService.search(requestPayload, token || undefined);

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Unable to fetch search results');
        }

        const { restaurants: restaurantResults = [], deals: dealResults = [] } = response.data;

        const computeDistanceKm = (
          distanceKm?: number | null,
          coords?: Coordinates | null
        ): number | null => {
          if (typeof distanceKm === 'number') {
            return distanceKm;
          }
          if (userLocation && coords) {
            return calculateDistance(userLocation, coords);
          }
          return null;
        };

        const formatDistanceLabel = (distanceKmValue: number | null): string => {
          if (typeof distanceKmValue === 'number') {
            return formatDistance(distanceKmValue);
          }
          return userLocation ? '0 km' : 'N/A';
        };

        const matchesTagSelection = (
          tags: Array<{ id: number; name: string }> | undefined,
          selectedIds: number[]
        ): boolean => {
          if (!selectedIds.length) return true;
          if (!tags || tags.length === 0) return false;
          const tagIdSet = new Set(tags.map((tag) => tag.id));
          return selectedIds.some((id) => tagIdSet.has(id));
        };

        const mappedRestaurants: SearchResult[] = (restaurantResults ?? []).map((restaurant) => {
          const city = restaurant.city?.trim();
          const province = restaurant.province?.trim();
          const streetAddress = restaurant.streetAddress?.trim();

          const hasValidCity = city && city !== '' && city.toLowerCase() !== 'unknown';
          const hasValidProvince = province && province !== '' && province.toLowerCase() !== 'unknown';
          const hasValidAddress = streetAddress && streetAddress !== '' && streetAddress.toLowerCase() !== 'unknown';

          let subtitle = 'Unknown';
          if (hasValidAddress) {
            subtitle = streetAddress;
          } else if (hasValidCity && hasValidProvince) {
            subtitle = `${city}, ${province}`;
          } else if (hasValidCity) {
            subtitle = city;
          } else if (hasValidProvince) {
            subtitle = province;
          }

          const restaurantCoords = getLocationCoordinates(restaurant);
          const distanceValue = computeDistanceKm(restaurant.distanceKm, restaurantCoords);
          const distanceLabel = formatDistanceLabel(distanceValue);
          const image = restaurant.imageUrl?.trim()
            ? restaurant.imageUrl!
            : heroImage;
          return {
            id: restaurant.id,
            type: 'restaurant' as const,
            title: restaurant.name,
            subtitle,
            description: restaurant.description || 'Restaurant serving delicious food',
            rating: restaurant.ratingAvg ? parseFloat(restaurant.ratingAvg.toString()) : undefined,
            distance: distanceLabel,
            imageUrl: image,
            isBookmarked: restaurant.isBookmarked || false,
            tags: [hasValidCity ? city! : 'Toronto', 'Restaurant'],
            originalData: restaurant,
          };
        });

        const mappedDeals: SearchResult[] = [];
        (dealResults ?? []).forEach((deal) => {
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

          const restaurantCoords = getLocationCoordinates(deal.restaurant);
          const distanceValue = computeDistanceKm(deal.distanceKm, restaurantCoords);
          const distanceLabel = formatDistanceLabel(distanceValue);

          const cuisineTags = deal.cuisines ?? [];
          const dietaryTags = deal.dietaryPreferences ?? [];

          if (!matchesTagSelection(cuisineTags, currentFilters.cuisines)) {
            return;
          }

          if (!matchesTagSelection(dietaryTags, currentFilters.dietaryPreferences)) {
            return;
          }

          const dealImage = deal.restaurant.imageUrl?.trim()
            ? deal.restaurant.imageUrl!
            : heroImage;

          mappedDeals.push({
            id: deal.id,
            type: 'deal' as const,
            title: deal.title,
            subtitle: deal.restaurant.name,
            description: deal.description || 'Great deal available!',
            rating: deal.restaurant.ratingAvg
              ? parseFloat(deal.restaurant.ratingAvg.toString())
              : undefined,
            distance: distanceLabel,
            price: 'Deal',
            imageUrl: dealImage,
            isBookmarked: deal.isBookmarked || false,
            tags: ['Deal', locationTag],
            cuisines: cuisineTags,
            dietaryPreferences: dietaryTags,
            originalData: deal,
          });
        });

        let combinedResults: SearchResult[] = [];
        if (currentFilters.showType !== 'deals') {
          combinedResults = [...combinedResults, ...mappedRestaurants];
        }
        if (currentFilters.showType !== 'restaurants') {
          combinedResults = [...combinedResults, ...mappedDeals];
        }

        if (currentFilters.sortBy === 'rating') {
          combinedResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        if (searchId === latestSearchIdRef.current) {
          setSearchResults(combinedResults);
        }
      } catch (error) {
        console.error('Search failed:', error);
        if (searchId === latestSearchIdRef.current) {
          toast({
            title: 'Search Error',
            description: 'Failed to search. Please try again.',
            variant: 'destructive',
          });
          setSearchResults([]);
        }
      } finally {
        if (searchId === latestSearchIdRef.current) {
          setIsSearching(false);
        }
      }
    },
    [toast, getToken, userLocation, filters]
  );

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
    if (userLocation) {
      performSearch('');
    }
  }, [userLocation, performSearch]);

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
        
        {/* Cuisine and Dietary Tags */}
        {(result.cuisines && result.cuisines.length > 0) ||
        (result.dietaryPreferences && result.dietaryPreferences.length > 0) ? (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {result.cuisines?.map((cuisine) => (
              <span
                key={`cuisine-${cuisine.id}`}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30"
              >
                {cuisine.name}
              </span>
            ))}
            {result.dietaryPreferences?.map((dietary) => (
              <span
                key={`dietary-${dietary.id}`}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30"
              >
                {dietary.name}
              </span>
            ))}
          </div>
        ) : null}
        
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