import { apiService, ApiResponse } from './api';

export interface CuisineType {
  id: number;
  name: string;
}

export interface DietaryPreference {
  id: number;
  name: string;
}

export interface PreferencesResponse {
  cuisines?: CuisineType[];
  dietaryPreferences?: DietaryPreference[];
}

class PreferencesService {
  async getCuisines(): Promise<ApiResponse<PreferencesResponse>> {
    return apiService.get<PreferencesResponse>('/preferences/cuisines');
  }

  async getDietaryPreferences(): Promise<ApiResponse<PreferencesResponse>> {
    return apiService.get<PreferencesResponse>('/preferences/dietary');
  }

  async getAllPreferences(): Promise<{
    cuisines: CuisineType[];
    dietaryPreferences: DietaryPreference[];
  }> {
    try {
      const [cuisinesResponse, dietaryResponse] = await Promise.all([
        this.getCuisines(),
        this.getDietaryPreferences()
      ]);

      return {
        cuisines: cuisinesResponse.data?.cuisines || [],
        dietaryPreferences: dietaryResponse.data?.dietaryPreferences || []
      };
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return {
        cuisines: [],
        dietaryPreferences: []
      };
    }
  }
}

export const preferencesService = new PreferencesService();
