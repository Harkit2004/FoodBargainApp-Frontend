import { apiService, ApiResponse } from './api';

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  displayName: string;
  isPartner?: boolean;
  location?: string;
  phone?: string;
  cuisinePreferences?: number[];
  dietaryPreferences?: number[];
}

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

export interface LoginResponse {
  user: User;
  token?: string;
}

export interface PartnerProfile {
  id: string;
  businessName: string;
  streetAddress?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
}

class AuthService {
  async register(data: RegisterData): Promise<ApiResponse<LoginResponse>> {
    return apiService.post('/auth/register', data);
  }

  async login(clerkUserId: string): Promise<ApiResponse<LoginResponse>> {
    return apiService.post('/auth/login', { clerkUserId });
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(clerkUserId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.post('/auth/reset-password', { clerkUserId });
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiService.post('/auth/logout');
  }

  async registerAsPartner(data: PartnerRegisterData): Promise<ApiResponse<PartnerProfile>> {
    return apiService.post('/partner/register', data);
  }

  async getPartnerProfile(): Promise<ApiResponse<PartnerProfile>> {
    return apiService.get('/partner/profile');
  }

  async updatePartnerProfile(data: Partial<PartnerRegisterData>): Promise<ApiResponse<PartnerProfile>> {
    return apiService.put('/partner/profile', data);
  }
}

export const authService = new AuthService();