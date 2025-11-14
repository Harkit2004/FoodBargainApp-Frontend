import { apiService, ApiResponse } from './api';

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
  partnerId: number;
  totalDeals: number;
  activeDeals: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface Deal {
  id: number;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'expired' | 'archived';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  restaurant: {
    id: number;
    name: string;
    streetAddress?: string;
    city?: string;
    province?: string;
  };
  cuisines: Array<{
    id: number;
    name: string;
  }>;
  dietaryPreferences: Array<{
    id: number;
    name: string;
  }>;
}

export interface CreateDealData {
  title: string;
  description?: string;
  restaurantId: number;
  startDate: string;
  endDate: string;
  cuisineIds?: number[];
  dietaryPreferenceIds?: number[];
}

export interface PartnerProfile {
  id: number;
  businessName: string;
  streetAddress?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

class PartnerService {
  /**
   * Register as a partner
   */
  async register(data: { businessName: string; streetAddress?: string; city?: string; province?: string; postalCode?: string; phone?: string }, token: string): Promise<ApiResponse<PartnerProfile>> {
    return apiService.post('/partner/register', data, token);
  }

  /**
   * Get partner profile information
   */
  async getProfile(token: string): Promise<ApiResponse<PartnerProfile>> {
    return apiService.get('/partner/profile', token);
  }

  /**
   * Update partner profile
   */
  async updateProfile(data: Partial<PartnerProfile>, token: string): Promise<ApiResponse<PartnerProfile>> {
    return apiService.put('/partner/profile', data, token);
  }

  /**
   * Get all restaurants owned by the partner
   */
  async getRestaurants(token: string): Promise<ApiResponse<Restaurant[]>> {
    return apiService.get('/partner/restaurants', token);
  }

  /**
   * Get a specific restaurant owned by the partner
   */
  async getRestaurant(restaurantId: number, token: string): Promise<ApiResponse<Restaurant>> {
    return apiService.get(`/partner/restaurants/${restaurantId}`, token);
  }

  /**
   * Create a new restaurant
   */
  async createRestaurant(data: Partial<Restaurant>, token: string): Promise<ApiResponse<Restaurant>> {
    return apiService.post('/partner/restaurants', data, token);
  }

  /**
   * Update restaurant information
   */
  async updateRestaurant(restaurantId: number, data: Partial<Restaurant>, token: string): Promise<ApiResponse<Restaurant>> {
    return apiService.put(`/partner/restaurants/${restaurantId}`, data, token);
  }

  /**
   * Get all deals for the partner
   */
  async getDeals(token: string, params?: { status?: string; restaurantId?: number }): Promise<ApiResponse<Deal[]>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.restaurantId) queryParams.append('restaurantId', params.restaurantId.toString());
    
    const url = queryParams.toString() ? `/partner-deals?${queryParams.toString()}` : '/partner-deals';
    return apiService.get(url, token);
  }

  /**
   * Get a specific deal by ID
   */
  async getDeal(dealId: number, token: string): Promise<ApiResponse<Deal>> {
    return apiService.get(`/partner-deals/${dealId}`, token);
  }

  /**
   * Create a new deal
   */
  async createDeal(data: CreateDealData, token: string): Promise<ApiResponse<Deal>> {
    return apiService.post('/partner-deals', data, token);
  }

  /**
   * Update a deal
   */
  async updateDeal(dealId: number, data: Partial<CreateDealData>, token: string): Promise<ApiResponse<Deal>> {
    return apiService.put(`/partner-deals/${dealId}`, data, token);
  }

  /**
   * Update deal status
   */
  async updateDealStatus(dealId: number, status: string, token: string): Promise<ApiResponse<{ message: string; data: unknown }>> {
    return apiService.patch(`/partner-deals/${dealId}/status`, { status }, token);
  }

  /**
   * Delete a deal (only draft deals can be deleted)
   */
  async deleteDeal(dealId: number, token: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/partner-deals/${dealId}`, token);
  }
}

export const partnerService = new PartnerService();