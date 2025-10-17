import { apiService } from './api';

interface NotificationPreferences {
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  dealId?: number;
}

interface BookmarkedRestaurant {
  id: number;
  name: string;
  description: string;
  streetAddress: string;
  city: string;
  province: string;
  phone: string;
  ratingAvg: string;
  ratingCount: number;
  openingTime: string;
  closingTime: string;
  partner: {
    id: number;
    businessName: string;
  };
  bookmarkInfo: {
    notifyOnDeal: boolean;
    bookmarkedAt: string;
  };
  activeDealsCount: number;
}

export const notificationService = {
  // Get user's notification preferences
  async getPreferences(token?: string): Promise<NotificationPreferences> {
    const response = await apiService.get<NotificationPreferences>('/notifications/preferences', token);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch notification preferences');
    }
    return response.data!;
  },

  // Update user's notification preferences
  async updatePreferences(preferences: { emailNotifications: boolean }, token?: string): Promise<NotificationPreferences> {
    const response = await apiService.put<NotificationPreferences>('/notifications/preferences', preferences, token);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update notification preferences');
    }
    return response.data!;
  },

  // Get user's notifications (fetch from backend)
  async getNotifications(page: number = 1, limit: number = 20, unreadOnly: boolean = false, token?: string): Promise<{
    notifications: Notification[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(unreadOnly && { unreadOnly: 'true' }),
    });

    const response = await apiService.get<{
      notifications: Notification[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    }>(`/notifications?${params}`, token);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch notifications');
    }
    return response.data!;
  },

  // Bookmark a restaurant
  async bookmarkRestaurant(restaurantId: number, notifyOnDeal: boolean = true, token?: string): Promise<void> {
    const response = await apiService.post(`/notifications/restaurants/${restaurantId}/bookmark`, {
      notifyOnDeal
    }, token);
    if (!response.success) {
      throw new Error(response.error || 'Failed to bookmark restaurant');
    }
  },

  // Remove restaurant bookmark
  async removeBookmark(restaurantId: number, token?: string): Promise<void> {
    const response = await apiService.delete(`/notifications/restaurants/${restaurantId}/bookmark`, token);
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove bookmark');
    }
  },

  // Update notification preference for a bookmarked restaurant
  async updateRestaurantNotification(restaurantId: number, notifyOnDeal: boolean, token?: string): Promise<void> {
    const response = await apiService.patch(`/notifications/restaurants/${restaurantId}/bookmark`, {
      notifyOnDeal
    }, token);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update restaurant notification preference');
    }
  },

  // Get bookmarked restaurants
  async getBookmarkedRestaurants(page: number = 1, limit: number = 20, token?: string): Promise<{
    restaurants: BookmarkedRestaurant[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const response = await apiService.get<{
      restaurants: BookmarkedRestaurant[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    }>(`/notifications/bookmarked-restaurants?page=${page}&limit=${limit}`, token);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch bookmarked restaurants');
    }
    return response.data!;
  },

  // Mark notifications as read
  async markAsRead(notificationId: number, token?: string): Promise<void> {
    const response = await apiService.patch(`/notifications/${notificationId}/read`, undefined, token);
    if (!response.success) {
      throw new Error(response.error || 'Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  async markAllAsRead(token?: string): Promise<void> {
    const response = await apiService.patch('/notifications/mark-all-read', undefined, token);
    if (!response.success) {
      throw new Error(response.error || 'Failed to mark all notifications as read');
    }
  },

  // Get unread notification count
  async getUnreadCount(token?: string): Promise<number> {
    const response = await apiService.get<{ count: number }>('/notifications/unread-count', token);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch unread count');
    }
    return response.data!.count;
  }
};