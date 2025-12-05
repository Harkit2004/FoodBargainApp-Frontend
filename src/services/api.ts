import { useAuth } from '@clerk/clerk-react';

declare global {
  interface Window {
    __clerk_token?: string;
  }
}

// API Configuration and Base Service
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  requiresRegistration?: boolean;
}

class ApiService {
  private async getAuthHeaders(token?: string): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...(await this.getAuthHeaders(token)),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
          ...data // Include other fields like isBanned, requiresRegistration
        };
      }

      // If response is already in our ApiResponse format
      if (typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>;
      }

      // Wrap raw data in ApiResponse format
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      console.error('API Request Error:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, token);
  }

  async post<T>(endpoint: string, data?: unknown, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }, token);
  }

  async put<T>(endpoint: string, data?: unknown, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }, token);
  }

  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, token);
  }

  async patch<T>(endpoint: string, data?: unknown, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    }, token);
  }
}

export const apiService = new ApiService();