import React, { createContext, useContext, useState, useCallback } from 'react';

interface FavoritesContextType {
  bookmarkedRestaurants: Set<number>;
  favoritedDeals: Set<number>;
  toggleRestaurantBookmark: (restaurantId: number, isBookmarked: boolean) => void;
  toggleDealFavorite: (dealId: number, isFavorited: boolean) => void;
  refreshFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: React.ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [bookmarkedRestaurants, setBookmarkedRestaurants] = useState<Set<number>>(new Set());
  const [favoritedDeals, setFavoritedDeals] = useState<Set<number>>(new Set());

  const toggleRestaurantBookmark = useCallback((restaurantId: number, isBookmarked: boolean) => {
    setBookmarkedRestaurants(prev => {
      const newSet = new Set(prev);
      if (isBookmarked) {
        newSet.add(restaurantId);
      } else {
        newSet.delete(restaurantId);
      }
      return newSet;
    });
  }, []);

  const toggleDealFavorite = useCallback((dealId: number, isFavorited: boolean) => {
    setFavoritedDeals(prev => {
      const newSet = new Set(prev);
      if (isFavorited) {
        newSet.add(dealId);
      } else {
        newSet.delete(dealId);
      }
      return newSet;
    });
  }, []);

  const refreshFavorites = useCallback(() => {
    // This would typically fetch from the server and update the sets
    // For now, it's just a placeholder for future implementation
    console.log('Refreshing favorites state...');
  }, []);

  const value: FavoritesContextType = {
    bookmarkedRestaurants,
    favoritedDeals,
    toggleRestaurantBookmark,
    toggleDealFavorite,
    refreshFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};