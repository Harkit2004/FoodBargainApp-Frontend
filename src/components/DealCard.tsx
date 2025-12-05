import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Share2, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Deal } from '@/services/dealsService';
import { formatDateShort } from '@/utils/dateUtils';
import { openMapNavigation, formatAddress } from '@/utils/locationUtils';
import heroImage from '@/assets/hero-food.jpg';

interface DealCardProps {
  deal: Deal;
  isAdmin?: boolean;
  onToggleFavorite: (id: number, isBookmarked: boolean) => void;
  onShare: (deal: Deal, e: React.MouseEvent) => void;
  onDelete?: (deal: Deal) => void;
  isDeleting?: boolean;
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  isAdmin = false,
  onToggleFavorite,
  onShare,
  onDelete,
  isDeleting = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleOpenNavigation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { latitude, longitude, streetAddress, city, province } = deal.restaurant;
    openMapNavigation(latitude, longitude, [streetAddress, city, province], user?.location);
  };

  return (
    <div 
      className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-4 border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors"
      onClick={() => navigate(`/deals/${deal.id}`)}
    >
      <div className="relative">
        <img 
          src={heroImage} 
          alt={deal.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-bold shadow-lg">
            DEAL
          </span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(deal.id, deal.isBookmarked === true);
          }}
          className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
        >
          <Heart 
            className={`w-5 h-5 ${deal.isBookmarked === true ? 'fill-red-500 text-red-500' : 'text-white'}`} 
          />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-white">{deal.title}</h3>
        <p className="text-gray-300 text-sm mb-3">{deal.description || 'Great deal available!'}</p>
        
        {/* Cuisine and Dietary Tags */}
        {((deal.cuisines && deal.cuisines.length > 0) || (deal.dietaryPreferences && deal.dietaryPreferences.length > 0)) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {deal.cuisines?.map((cuisine) => (
              <span
                key={`cuisine-${cuisine.id}`}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30"
              >
                {cuisine.name}
              </span>
            ))}
            {deal.dietaryPreferences?.map((dietary) => (
              <span
                key={`dietary-${dietary.id}`}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30"
              >
                {dietary.name}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <p 
              className="font-semibold text-white cursor-pointer hover:text-green-400 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/restaurants/${deal.restaurant.id}`);
              }}
            >
              {deal.restaurant.name}
            </p>
            <div  
              className="flex items-center gap-1 text-sm text-gray-400 cursor-pointer hover:text-green-400 transition-colors"
              onClick={handleOpenNavigation}
              title="Get Directions"
            >
              <MapPin className="w-4 h-4" />
              <span>
                {formatAddress(deal.restaurant.streetAddress, deal.restaurant.city, deal.restaurant.province)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-400">Active</p>
            <p className="text-sm text-gray-400">{deal.status}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="neon" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/deals/${deal.id}`);
            }}
          >
            View Deal
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
          <Button 
            variant="outline" 
            size="sm" 
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={(e) => onShare(deal, e)}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {isAdmin && onDelete && (
          <Button
            variant="destructive"
            size="sm"
            className="w-full mt-3"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(deal);
            }}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Remove deal everywhere
          </Button>
        )}
        
        <p className="text-xs text-gray-400 mt-2 text-center">
          Expires: {formatDateShort(deal.endDate)}
        </p>
      </div>
    </div>
  );
};
