import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Target, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationPickerProps {
  onLocationSelect: (location: string, address: string) => void;
  initialLocation?: string;
  className?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  className = '',
}) => {
  const { toast } = useToast();
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Parse initial location if provided
  useEffect(() => {
    if (initialLocation && initialLocation.includes(',')) {
      const [lat, lng] = initialLocation.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCoordinates({ lat, lng });
        reverseGeocode(lat, lng);
      }
    }
  }, [initialLocation]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const geocodeAddress = async (query: string) => {
    try {
      setIsLoading(true);
      // Using OpenStreetMap Nominatim API for geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        setCoordinates({ lat, lng });
        setAddress(result.display_name);
        onLocationSelect(`${lat},${lng}`, result.display_name);
        
        toast({
          title: "Location Found",
          description: "Location has been set successfully.",
        });
      } else {
        toast({
          title: "Location Not Found",
          description: "Could not find the specified location. Please try a different search.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search for location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setCoordinates({ lat, lng });
        await reverseGeocode(lat, lng);
        onLocationSelect(`${lat},${lng}`, address);
        
        toast({
          title: "Location Detected",
          description: "Your current location has been set.",
        });
        setIsLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Location Access Denied",
          description: "Unable to access your location. Please search manually or enable location permissions.",
          variant: "destructive",
        });
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [onLocationSelect, address, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      geocodeAddress(searchInput.trim());
    }
  };

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    reverseGeocode(lat, lng);
    onLocationSelect(`${lat},${lng}`, address);
  }, [onLocationSelect, address]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search for a location (e.g., Toronto, ON)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !searchInput.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form>

      {/* Current Location Button */}
      <Button
        onClick={getCurrentLocation}
        disabled={isLoading}
        variant="outline"
        className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
      >
        <Target className="mr-2 h-4 w-4" />
        Use Current Location
      </Button>

      {/* Selected Location Display */}
      {coordinates && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Selected Location</p>
              <p className="text-xs text-gray-300 break-words mt-1">
                {address || `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Map Placeholder */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            <Navigation className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-medium">Interactive Map</p>
            <p className="text-gray-400 text-sm mt-1">
              Use the search above or "Use Current Location" to set your location
            </p>
            {coordinates && (
              <p className="text-green-400 text-sm mt-2">
                ✓ Location set successfully
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Search for your city, address, or landmark</p>
        <p>• Click "Use Current Location" to detect your position</p>
        <p>• Your location will be used to find nearby restaurant deals</p>
      </div>
    </div>
  );
};