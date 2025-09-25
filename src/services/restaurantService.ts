import { apiService } from './api';
import { ApiResponse } from './authService';

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
}

export interface CreateRestaurantData {
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
}

class RestaurantService {
  async getPartnerRestaurants(): Promise<ApiResponse<Restaurant[]>> {
    return apiService.get('/partner/restaurants');
  }

  async createRestaurant(data: CreateRestaurantData): Promise<ApiResponse<Restaurant>> {
    return apiService.post('/partner/restaurants', data);
  }

  async updateRestaurant(restaurantId: number, data: Partial<CreateRestaurantData>): Promise<ApiResponse<Restaurant>> {
    return apiService.put(`/partner/restaurants/${restaurantId}`, data);
  }

  async searchRestaurants(params: {
    query?: string;
    location?: string;
    cuisine?: string;
    radius?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ restaurants: Restaurant[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.location) queryParams.append('location', params.location);
    if (params.cuisine) queryParams.append('cuisine', params.cuisine);
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const endpoint = `/restaurants/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get(endpoint);
  }
}

export const restaurantService = new RestaurantService();