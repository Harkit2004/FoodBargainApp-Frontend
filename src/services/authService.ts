import { apiService } from './api';

export interface RegisterData {
  clerkUserId: string;
  displayName: string;
  location: string;
  phone?: string;
  cuisinePreferences: number[];
  dietaryPreferences: number[];
}

export interface PartnerRegisterData {
  businessName: string;
  streetAddress?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  requiresRegistration?: boolean;
}

class AuthService {
  async register(data: RegisterData): Promise<ApiResponse<any>> {
    return apiService.post('/auth/register', data);
  }

  async login(clerkUserId: string): Promise<ApiResponse<any>> {
    return apiService.post('/auth/login', { clerkUserId });
  }

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(clerkUserId: string): Promise<ApiResponse<any>> {
    return apiService.post('/auth/reset-password', { clerkUserId });
  }

  async logout(): Promise<ApiResponse<any>> {
    return apiService.post('/auth/logout');
  }

  async registerAsPartner(data: PartnerRegisterData): Promise<ApiResponse<any>> {
    return apiService.post('/partner/register', data);
  }

  async getPartnerProfile(): Promise<ApiResponse<any>> {
    return apiService.get('/partner/profile');
  }

  async updatePartnerProfile(data: Partial<PartnerRegisterData>): Promise<ApiResponse<any>> {
    return apiService.put('/partner/profile', data);
  }
}

export const authService = new AuthService();