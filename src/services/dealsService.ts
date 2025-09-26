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

export interface FavoriteResponse {
  success: boolean;
  message?: string;
}

export interface FavoriteStatusResponse {
  isBookmarked: boolean;
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
  }, token?: string): Promise<ApiResponse<{ deals: Deal[]; pagination: Pagination }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.restaurantId) queryParams.append('restaurantId', params.restaurantId.toString());
    
    const endpoint = `/deals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get(endpoint, token);
  }

  async getDealById(dealId: number, token?: string): Promise<ApiResponse<Deal>> {
    // Since there's no direct endpoint for individual deals, we'll fetch all deals and filter
    const response = await this.getDeals({ limit: 100 }, token);
    
    if (response.success && response.data) {
      const deal = response.data.deals.find(deal => deal.id === dealId);
      if (deal) {
        return {
          success: true,
          data: deal
        };
      } else {
        return {
          success: false,
          error: 'Deal not found'
        };
      }
    }
    
    return {
      success: false,
      error: response.error || 'Failed to fetch deals'
    };
  }

  async getFavoriteDeals(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }, token?: string): Promise<ApiResponse<{ deals: Deal[]; pagination: Pagination }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const endpoint = `/deals/favorites${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get(endpoint, token);
  }

  async favoriteDeal(dealId: number, token?: string): Promise<ApiResponse<FavoriteResponse>> {
    return apiService.post(`/deals/${dealId}/favorite`, {}, token);
  }

  async unfavoriteDeal(dealId: number, token?: string): Promise<ApiResponse<FavoriteResponse>> {
    return apiService.delete(`/deals/${dealId}/favorite`, token);
  }

  async getFavoriteStatus(dealId: number, token?: string): Promise<ApiResponse<FavoriteStatusResponse>> {
    return apiService.get(`/deals/${dealId}/favorite-status`, token);
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

  async deleteDeal(dealId: number): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return apiService.delete(`/partner-deals/${dealId}`);
  }

  async activateDeal(dealId: number): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return apiService.put(`/partner-deals/${dealId}/activate`);
  }

  async archiveDeal(dealId: number): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return apiService.put(`/partner-deals/${dealId}/archive`);
  }
}

export const dealsService = new DealsService();