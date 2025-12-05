import { apiService, ApiResponse } from './api';

export interface ReviewTag {
  id: number;
  name: string;
  isCustom: boolean;
  createdBy?: string;
  createdAt: string;
}

class TagService {
  async getTags(token?: string): Promise<ApiResponse<ReviewTag[]>> {
    return apiService.get('/tags', token);
  }

  async createTag(name: string, token: string): Promise<ApiResponse<ReviewTag>> {
    return apiService.post('/tags', { name }, token);
  }

  async deleteTag(id: number, token: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiService.delete(`/tags/${id}`, token);
  }
}

export const tagService = new TagService();
