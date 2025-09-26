import { apiService, ApiResponse } from './api';

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  priceCents: number;
  imageUrl?: string;
  isAvailable: boolean;
  sectionId: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuSection {
  id: number;
  title: string;
  description?: string;
  position: number;
  restaurantId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items?: MenuItem[];
}

export interface CreateMenuSectionData {
  title: string;
  description?: string;
  position?: number;
}

export interface CreateMenuItemData {
  name: string;
  description?: string;
  priceCents: number;
  imageUrl?: string;
  isAvailable?: boolean;
  sectionId: number;
  position?: number;
}

class MenuService {
  /**
   * Get all menu sections for a restaurant with their items
   */
  async getMenuSections(restaurantId: number, token: string): Promise<ApiResponse<MenuSection[]>> {
    return apiService.get(`/menu/${restaurantId}/sections`, token);
  }

  /**
   * Get a specific menu section with its items
   */
  async getMenuSection(restaurantId: number, sectionId: number, token: string): Promise<ApiResponse<MenuSection>> {
    return apiService.get(`/menu/${restaurantId}/sections/${sectionId}`, token);
  }

  /**
   * Create a new menu section
   */
  async createMenuSection(restaurantId: number, data: CreateMenuSectionData, token: string): Promise<ApiResponse<MenuSection>> {
    return apiService.post(`/menu/${restaurantId}/sections`, data, token);
  }

  /**
   * Update a menu section
   */
  async updateMenuSection(restaurantId: number, sectionId: number, data: Partial<CreateMenuSectionData>, token: string): Promise<ApiResponse<MenuSection>> {
    return apiService.put(`/menu/${restaurantId}/sections/${sectionId}`, data, token);
  }

  /**
   * Delete a menu section
   */
  async deleteMenuSection(restaurantId: number, sectionId: number, token: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/menu/${restaurantId}/sections/${sectionId}`, token);
  }

  /**
   * Reorder menu sections
   */
  async reorderMenuSections(restaurantId: number, sectionIds: number[], token: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.patch(`/menu/${restaurantId}/sections/reorder`, { sectionIds }, token);
  }

  /**
   * Get all menu items for a section
   */
  async getMenuItems(restaurantId: number, sectionId: number, token: string): Promise<ApiResponse<MenuItem[]>> {
    return apiService.get(`/menu/${restaurantId}/sections/${sectionId}/items`, token);
  }

  /**
   * Get a specific menu item
   */
  async getMenuItem(restaurantId: number, sectionId: number, itemId: number, token: string): Promise<ApiResponse<MenuItem>> {
    return apiService.get(`/menu/${restaurantId}/sections/${sectionId}/items/${itemId}`, token);
  }

  /**
   * Create a new menu item
   */
  async createMenuItem(restaurantId: number, data: CreateMenuItemData, token: string): Promise<ApiResponse<MenuItem>> {
    return apiService.post(`/menu/${restaurantId}/items`, data, token);
  }

  /**
   * Update a menu item
   */
  async updateMenuItem(restaurantId: number, itemId: number, data: Partial<CreateMenuItemData>, token: string): Promise<ApiResponse<MenuItem>> {
    return apiService.put(`/menu/${restaurantId}/items/${itemId}`, data, token);
  }

  /**
   * Delete a menu item
   */
  async deleteMenuItem(restaurantId: number, itemId: number, token: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/menu/${restaurantId}/items/${itemId}`, token);
  }

  /**
   * Toggle menu item availability
   */
  async toggleItemAvailability(restaurantId: number, itemId: number, isAvailable: boolean, token: string): Promise<ApiResponse<MenuItem>> {
    return apiService.patch(`/menu/${restaurantId}/items/${itemId}/availability`, { isAvailable }, token);
  }

  /**
   * Reorder menu items within a section
   */
  async reorderMenuItems(restaurantId: number, sectionId: number, itemIds: number[], token: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.patch(`/menu/${restaurantId}/sections/${sectionId}/items/reorder`, { itemIds }, token);
  }
}

export const menuService = new MenuService();