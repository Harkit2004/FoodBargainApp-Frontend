import { apiService, ApiResponse } from './api';
import type { Restaurant } from './restaurantService';
import type { Deal, Pagination } from './dealsService';

export type SearchShowType = 'all' | 'restaurants' | 'deals';
export type SearchSortBy = 'relevance' | 'rating' | 'distance';

export interface SearchRequest {
  query?: string;
  showType?: SearchShowType;
  sortBy?: SearchSortBy;
  sortOrder?: 'asc' | 'desc';
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  cuisineIds?: number[];
  dietaryPreferenceIds?: number[];
  page?: number;
  limit?: number;
  hasActiveDeals?: boolean;
}

export interface SearchResponse {
  restaurants: Array<Restaurant & { distanceKm?: number | null }>;
  deals: Array<Deal & { distanceKm?: number | null }>;
  pagination: {
    restaurants: Pagination;
    deals: Pagination;
  };
  filtersApplied: {
    query: string | null;
    showType: SearchShowType;
    cuisineIds: number[];
    dietaryPreferenceIds: number[];
    latitude: number | null;
    longitude: number | null;
    distanceKm: number | null;
    sortBy: SearchSortBy;
    sortOrder: 'asc' | 'desc';
  };
}

class SearchService {
  async search(params: SearchRequest, token?: string): Promise<ApiResponse<SearchResponse>> {
    const queryParams = new URLSearchParams();

    if (params.query) queryParams.append('query', params.query);
    if (params.showType) queryParams.append('showType', params.showType);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.latitude !== undefined) queryParams.append('latitude', params.latitude.toString());
    if (params.longitude !== undefined) queryParams.append('longitude', params.longitude.toString());
    if (params.distanceKm !== undefined && params.distanceKm !== null) {
      queryParams.append('distance', params.distanceKm.toString());
    }
    if (params.cuisineIds && params.cuisineIds.length > 0) {
      queryParams.append('cuisineIds', params.cuisineIds.join(','));
    }
    if (params.dietaryPreferenceIds && params.dietaryPreferenceIds.length > 0) {
      queryParams.append('dietaryPreferenceIds', params.dietaryPreferenceIds.join(','));
    }
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.hasActiveDeals) queryParams.append('hasActiveDeals', 'true');

    const endpoint = `/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get(endpoint, token);
  }
}

export const searchService = new SearchService();
