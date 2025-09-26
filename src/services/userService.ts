import { apiService, ApiResponse } from './api';

export interface UserProfile {
  id: string;
  clerkUserId: string;
  email: string;
  displayName: string;
  location?: string;
  phone?: string;
  cuisinePreferences?: number[];
  dietaryPreferences?: number[];
  isPartner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  displayName?: string;
  location?: string;
  phone?: string;
  cuisinePreferences?: number[];
  dietaryPreferences?: number[];
}

export interface NotificationSettings {
  dealAlerts: boolean;
  restaurantUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

class UserService {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiService.get('/user/profile');
  }

  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    return apiService.put('/user/profile', data);
  }

  async deleteAccount(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiService.delete('/user/account');
  }

  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    return apiService.get('/user/notifications/settings');
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    return apiService.put('/user/notifications/settings', settings);
  }

  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<ApiResponse<{
    notifications: Array<{
      id: string;
      title: string;
      message: string;
      isRead: boolean;
      createdAt: string;
      type: 'deal' | 'restaurant' | 'system';
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');
    
    const endpoint = `/user/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get(endpoint);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.put(`/user/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.put('/user/notifications/read-all');
  }
}

export const userService = new UserService();