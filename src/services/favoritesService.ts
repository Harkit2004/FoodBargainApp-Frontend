import { apiService, ApiResponse } from './api';
import { useAuth } from '@clerk/clerk-react';

export interface FavoriteRestaurant {
  id: number;
  name: string;
  description?: string;
  streetAddress?: string;
  city?: string;
  province?: string;
  phone?: string;
  ratingAvg?: number;
  ratingCount?: number;
  openingTime?: string;
  closingTime?: string;
  partner?: {
    id: number;
    businessName: string;
  };
  bookmarkInfo?: {
    notifyOnDeal: boolean;
    bookmarkedAt: string;
  };
  activeDealsCount?: number;
}

export interface FavoriteDeal {
  id: number;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'expired' | 'archived';
  startDate: string;
  endDate: string;
  restaurant: {
    id: number;
    name: string;
    streetAddress?: string;
    city?: string;
    province?: string;
  };
  partner: {
    id: number;
    businessName: string;
  };
  bookmarkedAt?: string;
  createdAt: string;
}

export interface FavoriteItem {
  id: number;
  type: 'restaurant' | 'deal';
  title: string;
  subtitle: string;
  description: string;
  rating?: number;
  distance?: string;
  imageUrl: string;
  location?: string;
}

class FavoritesService {
  // Get user's auth token
  private async getAuthToken(): Promise<string | null> {
    try {
      // Check if we're in a React component context
      if (typeof window !== 'undefined' && window.__clerk_token) {
        return window.__clerk_token;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Get bookmarked restaurants
  async getBookmarkedRestaurants(token?: string): Promise<ApiResponse<{
    restaurants: FavoriteRestaurant[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>> {
    const authToken = token || await this.getAuthToken();
    return apiService.get('/notifications/bookmarked-restaurants', authToken || undefined);
  }

  // Get favorite deals
  async getFavoriteDeals(token?: string): Promise<ApiResponse<{
    deals: FavoriteDeal[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>> {
    const authToken = token || await this.getAuthToken();
    return apiService.get('/deals/favorites', authToken || undefined);
  }

  // Add restaurant to favorites
  async addRestaurantToFavorites(restaurantId: number, notifyOnDeal: boolean = true, token?: string): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    const authToken = token || await this.getAuthToken();
    return apiService.post(`/notifications/restaurants/${restaurantId}/bookmark`, {
      notifyOnDeal
    }, authToken || undefined);
  }

  // Remove restaurant from favorites
  async removeRestaurantFromFavorites(restaurantId: number, token?: string): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    const authToken = token || await this.getAuthToken();
    return apiService.delete(`/notifications/restaurants/${restaurantId}/bookmark`, authToken || undefined);
  }

  // Add deal to favorites
  async addDealToFavorites(dealId: number, token?: string): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    const authToken = token || await this.getAuthToken();
    return apiService.post(`/deals/${dealId}/favorite`, {}, authToken || undefined);
  }

  // Remove deal from favorites
  async removeDealFromFavorites(dealId: number, token?: string): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    const authToken = token || await this.getAuthToken();
    return apiService.delete(`/deals/${dealId}/favorite`, authToken || undefined);
  }

  // Get all favorites (combined restaurants and deals)
  async getAllFavorites(token?: string): Promise<ApiResponse<FavoriteItem[]>> {
    try {
      const authToken = token || await this.getAuthToken();
      
      // Fetch both restaurants and deals in parallel
      const [restaurantsResponse, dealsResponse] = await Promise.all([
        this.getBookmarkedRestaurants(authToken || undefined),
        this.getFavoriteDeals(authToken || undefined)
      ]);

      const favoriteItems: FavoriteItem[] = [];

      // Process restaurants
      if (restaurantsResponse.success && restaurantsResponse.data) {
        const restaurants = restaurantsResponse.data.restaurants || [];
        restaurants.forEach(restaurant => {
          favoriteItems.push({
            id: restaurant.id,
            type: 'restaurant',
            title: restaurant.name,
            subtitle: `${restaurant.city || 'Unknown'}, ${restaurant.province || 'Unknown'}`,
            description: restaurant.description || 'Restaurant description',
            rating: restaurant.ratingAvg || undefined,
            distance: '2.5 km', // Mock distance for now
            imageUrl: '/placeholder.svg', // Using placeholder for now
            location: `${restaurant.city || 'Unknown'}, ${restaurant.province || 'Unknown'}`
          });
        });
      }

      // Process deals
      if (dealsResponse.success && dealsResponse.data) {
        const deals = dealsResponse.data.deals || [];
        deals.forEach(deal => {
          favoriteItems.push({
            id: deal.id,
            type: 'deal',
            title: deal.title,
            subtitle: deal.restaurant.name,
            description: deal.description || 'Deal description',
            distance: '2.5 km', // Mock distance for now
            imageUrl: '/placeholder.svg', // Using placeholder for now
            location: `${deal.restaurant.city || 'Unknown'}, ${deal.restaurant.province || 'Unknown'}`
          });
        });
      }

      return {
        success: true,
        data: favoriteItems
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch favorites'
      };
    }
  }

  // Check if restaurant is bookmarked
  async checkRestaurantBookmarkStatus(restaurantId: number, token?: string): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    const authToken = token || await this.getAuthToken();
    return apiService.get(`/search/restaurants/${restaurantId}/bookmark-status`, authToken || undefined);
  }

  // Check if deal is bookmarked
  async checkDealBookmarkStatus(dealId: number, token?: string): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    const authToken = token || await this.getAuthToken();
    return apiService.get(`/deals/${dealId}/favorite-status`, authToken || undefined);
  }
}

export const favoritesService = new FavoritesService();