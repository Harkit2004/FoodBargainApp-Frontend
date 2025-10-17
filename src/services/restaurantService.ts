import { apiService, ApiResponse } from './api';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Deal {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description?: string;
  streetAddress?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  openingTime?: string;
  closingTime?: string;
  isActive: boolean;
  ratingAvg?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
  partner?: {
    id: number;
    businessName: string;
  };
  isBookmarked?: boolean;
  activeDealsCount?: number;
  activeDeals?: Deal[];
}

export interface MenuSection {
  id: number;
  title: string;
  position: number;
  restaurantId: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  sectionId: number;
  restaurantId: number;
  section?: MenuSection;
}

export interface CreateRestaurantData {
  name: string;
  description?: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  openingTime: string;
  closingTime: string;
  cuisineIds: number[];
  priceRange: string;
  isActive: boolean;
}

class RestaurantService {
  // Partner-specific methods
  async getPartnerRestaurants(token?: string): Promise<ApiResponse<Restaurant[]>> {
    return apiService.get('/partner/restaurants', token);
  }

  async createRestaurant(data: CreateRestaurantData, token?: string): Promise<ApiResponse<Restaurant>> {
    return apiService.post('/partner/restaurants', data, token);
  }

  async updateRestaurant(restaurantId: number, data: Partial<CreateRestaurantData>, token?: string): Promise<ApiResponse<Restaurant>> {
    return apiService.put(`/partner/restaurants/${restaurantId}`, data, token);
  }

  // Public methods for all users
  async searchRestaurants(params: {
    query?: string;
    location?: string;
    cuisine?: string;
    dietaryPreference?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    page?: number;
    limit?: number;
  }, token?: string): Promise<ApiResponse<{ restaurants: Restaurant[]; pagination: Pagination }>> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.location) queryParams.append('location', params.location);
    if (params.cuisine) queryParams.append('cuisine', params.cuisine);
    if (params.dietaryPreference) queryParams.append('dietaryPreference', params.dietaryPreference);
    if (params.latitude !== undefined) queryParams.append('latitude', params.latitude.toString());
    if (params.longitude !== undefined) queryParams.append('longitude', params.longitude.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const endpoint = `/search/restaurants${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get(endpoint, token);
  }

  // Get restaurant by ID
  async getRestaurant(id: number, token?: string): Promise<ApiResponse<{
    restaurant: Restaurant;
    activeDeals: Deal[];
  }>> {
    return apiService.get(`/search/restaurants/${id}`, token);
  }

  // Menu methods
  async getMenuSections(restaurantId: number): Promise<ApiResponse<MenuSection[]>> {
    return apiService.get(`/menu/sections?restaurantId=${restaurantId}`);
  }

  async getMenuItems(sectionId: number): Promise<ApiResponse<MenuItem[]>> {
    return apiService.get(`/menu/items?sectionId=${sectionId}`);
  }

  async getRestaurantMenu(restaurantId: number): Promise<ApiResponse<{ sections: MenuSection[]; items: MenuItem[] }>> {
    return apiService.get(`/menu/restaurant/${restaurantId}`);
  }

  // Bookmarking methods
  async bookmarkRestaurant(restaurantId: number, notifyOnDeal: boolean = true, token?: string): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    return apiService.post(`/notifications/restaurants/${restaurantId}/bookmark`, {
      notifyOnDeal
    }, token);
  }

  async unbookmarkRestaurant(restaurantId: number, token?: string): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    return apiService.delete(`/notifications/restaurants/${restaurantId}/bookmark`, token);
  }

  async getBookmarkedRestaurants(token?: string): Promise<ApiResponse<Restaurant[]>> {
    return apiService.get('/notifications/bookmarked-restaurants', token);
  }

  // Rating methods
  async rateRestaurant(restaurantId: number, rating: number, comment?: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.post(`/restaurants/${restaurantId}/rating`, {
      rating,
      comment
    });
  }
}

export const restaurantService = new RestaurantService();