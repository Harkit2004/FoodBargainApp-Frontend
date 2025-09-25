import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  Search as SearchIcon, 
  MapPin, 
  Filter, 
  Star, 
  Clock, 
  Heart,
  Utensils,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

const mockResults: SearchResult[] = [
  {
    id: 1,
    type: 'deal',
    title: "50% Off All Pizzas",
    subtitle: "Mario's Pizzeria",
    description: "Get half price on all our delicious wood-fired pizzas",
    rating: 4.8,
    distance: "0.3 km",
    discount: 50,
    price: "$12.49",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    isBookmarked: false,
    tags: ["Pizza", "Italian", "Hot Deal"]
  },
  {
    id: 2,
    type: 'restaurant',
    title: "Sakura Sushi",
    subtitle: "Japanese • Sushi Bar",
    description: "Authentic Japanese cuisine with fresh sushi and traditional dishes",
    rating: 4.9,
    distance: "1.2 km",
    imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
    isBookmarked: true,
    tags: ["Japanese", "Sushi", "Fine Dining"]
  },
  {
    id: 3,
    type: 'deal',
    title: "Buy 1 Get 1 Free Burgers",
    subtitle: "Burger Palace",
    description: "Double the deliciousness with our BOGO burger deal",
    rating: 4.6,
    distance: "0.8 km",
    discount: 50,
    price: "$9.50",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    isBookmarked: false,
    tags: ["Burger", "American", "BOGO"]
  }
];

const popularSearches = [
  "Pizza deals", "Sushi nearby", "Vegetarian options", "Fast delivery", 
  "Breakfast specials", "Coffee shops", "Late night food", "Family restaurants"
];

const categories = [
  { name: "Deals", icon: "🎯", filter: "deals" },
  { name: "Restaurants", icon: "🏪", filter: "restaurants" },
  { name: "Fast Food", icon: "🍔", filter: "fast-food" },
  { name: "Fine Dining", icon: "🍽️", filter: "fine-dining" },
  { name: "Delivery", icon: "🚚", filter: "delivery" },
  { name: "Takeout", icon: "🥡", filter: "takeout" }
];

export const Search: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      const filtered = mockResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 500);
  };

  const handleBookmarkToggle = (id: number) => {
    setSearchResults(prev =>
      prev.map(result =>
        result.id === id
          ? { ...result, isBookmarked: !result.isBookmarked }
          : result
      )
    );

    const result = searchResults.find(r => r.id === id);
    if (result) {
      toast({
        title: result.isBookmarked ? "Removed from favorites" : "Added to favorites",
        description: result.isBookmarked ? 
          `${result.title} removed from your favorites` : 
          `${result.title} added to your favorites`,
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
          onClick={() => handleBookmarkToggle(result.id)}
          className="absolute top-3 right-3 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
        >
          <Heart 
            className={`w-5 h-5 ${result.isBookmarked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
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
        
        <Button variant="default" size="sm" className="w-full">
          {result.type === 'deal' ? 'View Deal' : 'View Restaurant'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <MobileLayout showHeader={false}>
        {/* Search Header */}
        <div className="bg-gradient-primary text-primary-foreground px-mobile py-4 shadow-custom-md">
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

        <div className="px-mobile pt-4 pb-20">
          {!searchQuery && (
            <>
              {/* Categories */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Browse Categories</h2>
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.filter}
                      onClick={() => {
                        setSelectedFilter(category.filter);
                        toast({
                          title: "Filter Applied",
                          description: `Showing ${category.name.toLowerCase()}`,
                        });
                      }}
                      className="bg-card rounded-xl p-4 shadow-custom-sm hover:shadow-custom-md transition-all text-center"
                    >
                      <span className="text-2xl block mb-2">{category.icon}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Searches */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Popular Searches</h2>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(search);
                        handleSearch(search);
                      }}
                      className="px-3 py-2 bg-muted text-muted-foreground rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {isSearching ? 'Searching...' : `${searchResults.length} results for "${searchQuery}"`}
                </h2>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                </Button>
              </div>

              {isSearching ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Searching for delicious deals...</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No results found for "{searchQuery}"</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </MobileLayout>
      <BottomNavigation />
    </>
  );
};