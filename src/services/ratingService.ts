import { apiService, ApiResponse } from './api';

export interface Rating {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName: string;
  };
  tags?: Array<{
    id: number;
    name: string;
    isCustom: boolean;
  }>;
}

export interface RatingAggregate {
  averageRating: number;
  totalCount: number;
  distribution: Array<{
    rating: number;
    count: number;
  }>;
}

export interface RatingsResponse {
  ratings: Rating[];
  aggregate: RatingAggregate;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface MyRating {
  id: number;
  targetType: 'restaurant' | 'menu_item' | 'deal';
  targetId: number;
  targetName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  tags?: Array<{
    id: number;
    name: string;
    isCustom: boolean;
  }>;
}

export interface CreateRatingData {
  targetType: 'restaurant' | 'menu_item' | 'deal';
  targetId: number;
  rating: number;
  comment?: string;
  tags?: number[];
}

export interface UpdateRatingData {
  rating?: number;
  comment?: string;
  tags?: number[];
}

class RatingService {
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

  // Create a new rating
  async createRating(data: CreateRatingData, token?: string): Promise<ApiResponse<{
    id: number;
    targetType: string;
    targetId: number;
    targetName: string;
    rating: number;
    comment?: string;
    createdAt: string;
  }>> {
    const authToken = token || await this.getAuthToken();
    return apiService.post('/ratings', data, authToken || undefined);
  }

  // Update an existing rating
  async updateRating(ratingId: number, data: UpdateRatingData, token?: string): Promise<ApiResponse<{
    id: number;
    targetType: string;
    targetId: number;
    rating: number;
    comment?: string;
    updatedAt: string;
  }>> {
    const authToken = token || await this.getAuthToken();
    return apiService.put(`/ratings/${ratingId}`, data, authToken || undefined);
  }

  // Delete a rating
  async deleteRating(ratingId: number, token?: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const authToken = token || await this.getAuthToken();
    return apiService.delete(`/ratings/${ratingId}`, authToken || undefined);
  }

  // Get ratings for a specific target (restaurant, menu item, or deal)
  async getRatings(
    targetType: 'restaurant' | 'menu_item' | 'deal',
    targetId: number,
    params?: {
      page?: number;
      limit?: number;
    },
    token?: string
  ): Promise<ApiResponse<RatingsResponse>> {
    const authToken = token || await this.getAuthToken();
    const queryParams = new URLSearchParams();
    
    queryParams.append('targetType', targetType);
    queryParams.append('targetId', targetId.toString());
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const endpoint = `/ratings?${queryParams.toString()}`;
    return apiService.get(endpoint, authToken || undefined);
  }

  // Get current user's ratings
  async getMyRatings(params?: {
    page?: number;
    limit?: number;
    targetType?: 'restaurant' | 'menu_item' | 'deal';
  }, token?: string): Promise<ApiResponse<{
    ratings: MyRating[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>> {
    const authToken = token || await this.getAuthToken();
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.targetType) queryParams.append('targetType', params.targetType);
    
    const endpoint = `/ratings/my-ratings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get(endpoint, authToken || undefined);
  }

  // Check if user has already rated a specific item
  async hasUserRated(
    targetType: 'restaurant' | 'menu_item' | 'deal',
    targetId: number,
    token?: string
  ): Promise<{ hasRated: boolean; rating?: MyRating }> {
    try {
      const response = await this.getMyRatings({ targetType }, token);
      
      if (response.success && response.data) {
        const userRating = response.data.ratings.find(
          rating => rating.targetId === targetId && rating.targetType === targetType
        );
        
        return {
          hasRated: !!userRating,
          rating: userRating
        };
      }
      
      return { hasRated: false };
    } catch (error) {
      console.error('Error checking user rating:', error);
      return { hasRated: false };
    }
  }

  // Get rating statistics for a target
  async getRatingStats(
    targetType: 'restaurant' | 'menu_item' | 'deal',
    targetId: number,
    token?: string
  ): Promise<ApiResponse<RatingAggregate>> {
    try {
      const response = await this.getRatings(targetType, targetId, { limit: 1 }, token);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.aggregate
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to get rating statistics'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get rating statistics'
      };
    }
  }

  // Helper function to format rating display
  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  // Helper function to get star display
  getStarArray(rating: number): Array<{ filled: boolean; half: boolean }> {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push({ filled: true, half: false });
      } else if (i === fullStars && hasHalfStar) {
        stars.push({ filled: true, half: true });
      } else {
        stars.push({ filled: false, half: false });
      }
    }
    
    return stars;
  }

  // Helper function to validate rating input
  validateRating(rating: number): { valid: boolean; error?: string } {
    if (typeof rating !== 'number') {
      return { valid: false, error: 'Rating must be a number' };
    }
    
    if (rating < 1 || rating > 5) {
      return { valid: false, error: 'Rating must be between 1 and 5' };
    }
    
    if (!Number.isInteger(rating)) {
      return { valid: false, error: 'Rating must be a whole number' };
    }
    
    return { valid: true };
  }
}

export const ratingService = new RatingService();