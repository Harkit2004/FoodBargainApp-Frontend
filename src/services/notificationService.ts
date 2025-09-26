import { apiService } from './api';

interface NotificationPreferences {
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  type: 'new_deal' | 'favorite_restaurant' | 'system';
  title: string;
  message: string;
  description?: string;
  createdAt: string;
  isRead?: boolean;
  data?: { dealId?: number; restaurantName?: string; [key: string]: unknown };
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
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiService.get<NotificationPreferences>('/notifications/preferences');
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch notification preferences');
    }
    return response.data!;
  },

  // Update user's notification preferences
  async updatePreferences(preferences: { emailNotifications: boolean }): Promise<NotificationPreferences> {
    const response = await apiService.put<NotificationPreferences>('/notifications/preferences', preferences);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update notification preferences');
    }
    return response.data!;
  },

  // Get user's notifications (mock implementation for now)
  async getNotifications(): Promise<Notification[]> {
    // For now, return mock notifications
    // In a real implementation, this would fetch from the backend
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'new_deal',
        title: 'New Deal Available!',
        message: '50% off all pizzas at Mario\'s Italian Bistro',
        description: 'Limited time offer - expires in 3 days',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isRead: false,
        data: { dealId: 1, restaurantName: 'Mario\'s Italian Bistro' }
      },
      {
        id: '2',
        type: 'new_deal',
        title: 'Sushi Happy Hour!',
        message: '30% off sushi rolls at Sakura Sushi House',
        description: 'Daily from 5-7 PM',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        isRead: false,
        data: { dealId: 2, restaurantName: 'Sakura Sushi House' }
      },
      {
        id: '3',
        type: 'system',
        title: 'Welcome to FoodBargain!',
        message: 'Start exploring amazing food deals near you',
        description: 'Bookmark your favorite restaurants to get notified of new deals',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        isRead: true,
      }
    ];

    return mockNotifications;
  },

  // Bookmark a restaurant
  async bookmarkRestaurant(restaurantId: number, notifyOnDeal: boolean = true): Promise<void> {
    const response = await apiService.post(`/notifications/restaurants/${restaurantId}/bookmark`, {
      notifyOnDeal
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to bookmark restaurant');
    }
  },

  // Remove restaurant bookmark
  async removeBookmark(restaurantId: number): Promise<void> {
    const response = await apiService.delete(`/notifications/restaurants/${restaurantId}/bookmark`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove bookmark');
    }
  },

  // Update notification preference for a bookmarked restaurant
  async updateRestaurantNotification(restaurantId: number, notifyOnDeal: boolean): Promise<void> {
    const response = await apiService.patch(`/notifications/restaurants/${restaurantId}/bookmark`, {
      notifyOnDeal
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to update restaurant notification preference');
    }
  },

  // Get bookmarked restaurants
  async getBookmarkedRestaurants(page: number = 1, limit: number = 20): Promise<{
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
    }>(`/notifications/bookmarked-restaurants?page=${page}&limit=${limit}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch bookmarked restaurants');
    }
    return response.data!;
  },

  // Mark notifications as read (mock implementation)
  async markAsRead(notificationIds: string[]): Promise<void> {
    // Mock implementation - in a real app, this would update the backend
    console.log('Marking notifications as read:', notificationIds);
  },

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.isRead).length;
  }
};