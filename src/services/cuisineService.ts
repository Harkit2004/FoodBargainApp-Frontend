import { apiService, ApiResponse } from './api';

export interface CuisineType {
  id: number;
  name: string;
}

export interface DietaryPreference {
  id: number;
  name: string;
}

// Backend response format for preferences
interface PreferencesResponse {
  cuisines?: CuisineType[];
  dietaryPreferences?: DietaryPreference[];
}

class CuisineService {
  /**
   * Get all available cuisine types
   */
  async getCuisineTypes(): Promise<ApiResponse<CuisineType[]>> {
    try {
      const response = await apiService.get<PreferencesResponse>('/preferences/cuisines');
      if (response.success && response.data?.cuisines) {
        return {
          success: true,
          data: response.data.cuisines
        };
      }
      return {
        success: false,
        error: response.error || 'Failed to fetch cuisine types'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch cuisine types'
      };
    }
  }

  /**
   * Get all available dietary preferences
   */
  async getDietaryPreferences(): Promise<ApiResponse<DietaryPreference[]>> {
    try {
      const response = await apiService.get<PreferencesResponse>('/preferences/dietary');
      if (response.success && response.data?.dietaryPreferences) {
        return {
          success: true,
          data: response.data.dietaryPreferences
        };
      }
      return {
        success: false,
        error: response.error || 'Failed to fetch dietary preferences'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch dietary preferences'
      };
    }
  }
}

export const cuisineService = new CuisineService();