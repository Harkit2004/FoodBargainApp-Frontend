import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Filter, X } from 'lucide-react';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { preferencesService, CuisineType, DietaryPreference } from '../services/preferencesService';

export interface FilterOptions {
  distance: number | null; // in kilometers, null means "Any Distance"
  cuisines: number[]; // array of cuisine IDs
  dietaryPreferences: number[]; // array of dietary preference IDs
  showType: 'all' | 'restaurants' | 'deals'; // what to show
  sortBy: 'relevance' | 'rating'; // how to sort results
}

interface FilterSheetProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApply: (filters: FilterOptions) => void; // Pass filters to onApply
}

const DISTANCE_OPTIONS = [
  { label: 'Any Distance', value: null },
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
];

export default function FilterSheet({ filters, onFiltersChange, onApply }: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  const [cuisines, setCuisines] = useState<CuisineType[]>([]);
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Local state for filters - only update parent on Apply
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  // Sync local filters when sheet opens
  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await preferencesService.getAllPreferences();
      setCuisines(data.cuisines);
      setDietaryPrefs(data.dietaryPreferences);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDistanceChange = (value: string) => {
    const distance = value === 'null' ? null : Number(value);
    console.log('Distance filter changed to:', distance);
    setLocalFilters({ ...localFilters, distance });
  };

  const handleCuisineToggle = (cuisineId: number) => {
    const newCuisines = localFilters.cuisines.includes(cuisineId)
      ? localFilters.cuisines.filter((id) => id !== cuisineId)
      : [...localFilters.cuisines, cuisineId];
    console.log('Cuisine filter changed to:', newCuisines);
    setLocalFilters({ ...localFilters, cuisines: newCuisines });
  };

  const handleDietaryToggle = (dietaryId: number) => {
    const newDietary = localFilters.dietaryPreferences.includes(dietaryId)
      ? localFilters.dietaryPreferences.filter((id) => id !== dietaryId)
      : [...localFilters.dietaryPreferences, dietaryId];
    console.log('Dietary filter changed to:', newDietary);
    setLocalFilters({ ...localFilters, dietaryPreferences: newDietary });
  };

  const handleShowTypeChange = (value: string) => {
    const showType = value as 'all' | 'restaurants' | 'deals';
    console.log('Show type changed to:', showType);
    setLocalFilters({ ...localFilters, showType });
  };

  const handleSortByChange = (value: string) => {
    const sortBy = value as 'relevance' | 'rating';
    console.log('Sort by changed to:', sortBy);
    setLocalFilters({ ...localFilters, sortBy });
  };

  const handleClearAll = () => {
    console.log('Clearing all filters');
    const clearedFilters: FilterOptions = {
      distance: null,
      cuisines: [],
      dietaryPreferences: [],
      showType: 'all',
      sortBy: 'relevance',
    };
    setLocalFilters(clearedFilters);
  };

  const handleApply = () => {
    console.log('FilterSheet: Applying filters:', localFilters);
    onFiltersChange(localFilters);
    onApply(localFilters); // Pass the filters directly
    setOpen(false);
  };

  const activeFilterCount =
    (localFilters.distance !== null ? 1 : 0) +
    (localFilters.cuisines.length > 0 ? 1 : 0) +
    (localFilters.dietaryPreferences.length > 0 ? 1 : 0) +
    (localFilters.showType !== 'all' ? 1 : 0) +
    (localFilters.sortBy !== 'relevance' ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Distance filters apply to restaurant results. Cuisine and dietary filters apply to deals only.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-6 py-6">
            {/* Show Type Filter */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Show</Label>
              <RadioGroup
                value={localFilters.showType}
                onValueChange={handleShowTypeChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="show-all" />
                  <Label htmlFor="show-all" className="cursor-pointer font-normal">
                    All (Restaurants & Deals)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="restaurants" id="show-restaurants" />
                  <Label htmlFor="show-restaurants" className="cursor-pointer font-normal">
                    Restaurants Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deals" id="show-deals" />
                  <Label htmlFor="show-deals" className="cursor-pointer font-normal">
                    Deals Only
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Sort By Filter - Only show when specific type is selected */}
            {(localFilters.showType === 'restaurants' || localFilters.showType === 'deals') && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Sort By</Label>
                <RadioGroup
                  value={localFilters.sortBy}
                  onValueChange={handleSortByChange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="relevance" id="sort-relevance" />
                    <Label htmlFor="sort-relevance" className="cursor-pointer font-normal">
                      Relevance (Newest First)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rating" id="sort-rating" />
                    <Label htmlFor="sort-rating" className="cursor-pointer font-normal">
                      Highest Rating
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Distance Filter */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Distance (restaurants only)</Label>
              <p className="text-xs text-muted-foreground">
                Limit nearby restaurants. Deals will continue to show regardless of distance.
              </p>
              <RadioGroup
                value={localFilters.distance === null ? 'null' : String(localFilters.distance)}
                onValueChange={handleDistanceChange}
              >
                {DISTANCE_OPTIONS.map((option) => (
                  <div key={option.label} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.value === null ? 'null' : String(option.value)}
                      id={`distance-${option.label}`}
                    />
                    <Label htmlFor={`distance-${option.label}`} className="cursor-pointer font-normal">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Cuisine Filter */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Cuisine (deals only)</Label>
              <p className="text-xs text-muted-foreground">
                Applies to deals. Restaurants do not have cuisine associations yet.
              </p>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading cuisines...</div>
              ) : (
                <div className="space-y-2">
                  {cuisines.map((cuisine) => (
                    <div key={cuisine.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cuisine-${cuisine.id}`}
                        checked={localFilters.cuisines.includes(cuisine.id)}
                        onCheckedChange={() => handleCuisineToggle(cuisine.id)}
                      />
                      <Label htmlFor={`cuisine-${cuisine.id}`} className="cursor-pointer font-normal">
                        {cuisine.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dietary Preferences Filter */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Dietary Preferences (deals only)</Label>
              <p className="text-xs text-muted-foreground">
                Applies to deal results. Restaurants are not filtered by dietary preferences.
              </p>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading dietary preferences...</div>
              ) : (
                <div className="space-y-2">
                  {dietaryPrefs.map((pref) => (
                    <div key={pref.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dietary-${pref.id}`}
                        checked={localFilters.dietaryPreferences.includes(pref.id)}
                        onCheckedChange={() => handleDietaryToggle(pref.id)}
                      />
                      <Label htmlFor={`dietary-${pref.id}`} className="cursor-pointer font-normal">
                        {pref.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-3 border-t pt-4">
          <Button variant="outline" className="flex-1" onClick={handleClearAll}>
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
