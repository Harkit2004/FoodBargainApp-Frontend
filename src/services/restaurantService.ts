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
  cuisines?: Array<{ id: number; name: string }>;
  dietaryPreferences?: Array<{ id: number; name: string }>;
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
  imageUrl?: string;
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
  imageUrl?: string;
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
  latitude?: number;
  longitude?: number;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  imageUrl?: string;
}

class RestaurantService {
  private normalizeRestaurantDeals(restaurant: Restaurant, fallbackDeals?: Deal[]): Restaurant {
    const normalizedActiveDeals = restaurant.activeDeals ?? fallbackDeals ?? [];
    const normalizedCount =
      restaurant.activeDealsCount ?? (normalizedActiveDeals ? normalizedActiveDeals.length : 0);

    return {
      ...restaurant,
      activeDeals: normalizedActiveDeals,
      activeDealsCount: normalizedCount,
    };
  }

  // Partner-specific methods
  async getPartnerRestaurants(token?: string): Promise<ApiResponse<Restaurant[]>> {
    const response = await apiService.get<Restaurant[]>('/partner/restaurants', token);

    if (response.success && response.data) {
      response.data = response.data.map((restaurant) => this.normalizeRestaurantDeals(restaurant));
    }

    return response;
  }

  async createRestaurant(data: CreateRestaurantData, token?: string): Promise<ApiResponse<Restaurant>> {
    const response = await apiService.post<Restaurant>('/partner/restaurants', data, token);
    response.data = this.normalizeRestaurantDeals(response.data);
    return response;
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
    const response = await apiService.get<{ restaurants: Restaurant[]; pagination: Pagination }>(endpoint, token);

    if (response.success && response.data?.restaurants) {
      response.data.restaurants = response.data.restaurants.map((restaurant) =>
        this.normalizeRestaurantDeals(restaurant)
      );
    }

    return response;
  }

  // Get restaurant by ID
  async getRestaurant(id: number, token?: string): Promise<ApiResponse<{
    restaurant: Restaurant;
    activeDeals: Deal[];
  }>> {
    const response = await apiService.get<{
      restaurant: Restaurant;
      activeDeals: Deal[];
    }>(`/search/restaurants/${id}`, token);

    if (response.success && response.data?.restaurant) {
      response.data.restaurant = this.normalizeRestaurantDeals(
        {
          ...response.data.restaurant,
          activeDeals: response.data.activeDeals,
        },
        response.data.activeDeals
      );
    }

    return response;
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
    const response = await apiService.get<Restaurant[]>('/notifications/bookmarked-restaurants', token);
    if (response.success && response.data) {
      response.data = response.data.map((restaurant) => this.normalizeRestaurantDeals(restaurant));
    }
    return response;
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