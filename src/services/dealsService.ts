import { apiService } from './api';
import { ApiResponse } from './authService';

export interface Deal {
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
  isBookmarked?: boolean;
  createdAt: string;
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

class DealsService {
  async getDeals(params?: {
    page?: number;
    limit?: number;
    status?: string;
    restaurantId?: number;
  }): Promise<ApiResponse<{ deals: Deal[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.restaurantId) queryParams.append('restaurantId', params.restaurantId.toString());
    
    const endpoint = `/deals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get(endpoint);
  }

  async getFavoriteDeals(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{ deals: Deal[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const endpoint = `/deals/favorites${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get(endpoint);
  }

  async favoriteDeal(dealId: number): Promise<ApiResponse<any>> {
    return apiService.post(`/deals/${dealId}/favorite`);
  }

  async unfavoriteDeal(dealId: number): Promise<ApiResponse<any>> {
    return apiService.delete(`/deals/${dealId}/favorite`);
  }

  async getFavoriteStatus(dealId: number): Promise<ApiResponse<any>> {
    return apiService.get(`/deals/${dealId}/favorite-status`);
  }

  // Partner deals
  async getPartnerDeals(params?: {
    status?: string;
    restaurantId?: number;
  }): Promise<ApiResponse<Deal[]>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.restaurantId) queryParams.append('restaurantId', params.restaurantId.toString());
    
    const endpoint = `/partner-deals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get(endpoint);
  }

  async createDeal(data: CreateDealData): Promise<ApiResponse<Deal>> {
    return apiService.post('/partner-deals', data);
  }

  async updateDeal(dealId: number, data: Partial<CreateDealData>): Promise<ApiResponse<Deal>> {
    return apiService.put(`/partner-deals/${dealId}`, data);
  }

  async deleteDeal(dealId: number): Promise<ApiResponse<any>> {
    return apiService.delete(`/partner-deals/${dealId}`);
  }

  async activateDeal(dealId: number): Promise<ApiResponse<any>> {
    return apiService.put(`/partner-deals/${dealId}/activate`);
  }

  async archiveDeal(dealId: number): Promise<ApiResponse<any>> {
    return apiService.put(`/partner-deals/${dealId}/archive`);
  }
}

export const dealsService = new DealsService();