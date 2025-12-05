import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Restaurant } from '@/services/restaurantService';
import { StarRating } from '@/components/ui/star-rating';
import { openMapNavigation, formatAddress } from '@/utils/locationUtils';
import heroImage from '@/assets/hero-food.jpg';
import { LazyImage } from './ui/LazyImage';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onToggleFavorite: (id: number, isBookmarked: boolean) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const formatTime12Hour = (time24: string): string => {
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'p.m.' : 'a.m.';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const handleOpenNavigation = (e: React.MouseEvent) => {
    e.stopPropagation();
    openMapNavigation(
      restaurant.latitude, 
      restaurant.longitude, 
      [restaurant.streetAddress, restaurant.city, restaurant.province],
      user?.location
    );
  };

  const hoursStatus = getHoursStatus(restaurant.openingTime, restaurant.closingTime);
  const coverImage = restaurant.imageUrl?.trim() ? restaurant.imageUrl : heroImage;
  
  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-4 border border-gray-700">
      <div className="relative">
        <LazyImage 
          src={coverImage}
          alt={restaurant.name}
          containerClassName="w-full h-48"
          className="object-cover"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(restaurant.id, restaurant.isBookmarked === true);
          }}
          className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
        >
          <Heart 
            className={`w-5 h-5 ${restaurant.isBookmarked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
          />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-white">{restaurant.name}</h3>
          <div className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded-lg">
            <StarRating rating={parseFloat((restaurant.ratingAvg || 0).toString())} readOnly size="sm" />
            <span className="text-sm font-bold text-white ml-1">
              {parseFloat((restaurant.ratingAvg || 0).toString()).toFixed(1)}
            </span>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {restaurant.description || 'Delicious food awaits!'}
        </p>
        
        <div className="space-y-2 mb-4">
          <div 
            className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-green-400 transition-colors"
            onClick={handleOpenNavigation}
            title="Get Directions"
          >
            <MapPin className="w-4 h-4" />
            <span>
              {formatAddress(restaurant.streetAddress, restaurant.city, restaurant.province)}
            </span>
          </div>
          
          {restaurant.openingTime && restaurant.closingTime && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime12Hour(restaurant.openingTime)} - {formatTime12Hour(restaurant.closingTime)}
              </span>
              <span className={`ml-auto font-medium ${hoursStatus.color}`}>
                {hoursStatus.status}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="neon" 
            size="sm" 
            className="flex-1"
            onClick={() => navigate(`/restaurants/${restaurant.id}`)}
          >
            View Menu
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={handleOpenNavigation}
            title="Get Directions"
          >
            <MapPin className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
