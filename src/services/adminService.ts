import { apiService } from './api';

export interface User {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  banReason: string | null;
  createdAt: string;
  isPartner: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export const adminService = {
  async getUsers(page = 1, limit = 20, query = '', token?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      q: query,
    });
    return apiService.get<UsersResponse>(`/admin/users?${params.toString()}`, token);
  },

  async banUser(userId: string, reason: string, token?: string) {
    return apiService.put<User>(
      `/admin/users/${userId}/ban`,
      { reason },
      token
    );
  },

  async unbanUser(userId: string, token?: string) {
    return apiService.put<User>(
      `/admin/users/${userId}/unban`,
      {},
      token
    );
  },
};
