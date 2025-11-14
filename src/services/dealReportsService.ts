import { apiService, ApiResponse } from './api';

export interface DealReportRequest {
  dealId: number;
  reason: string;
}

export interface DealReportResponse {
  dealId: number;
  jiraTicketId?: string | null;
  createdAt?: string | null;
}

export interface DealReportStatus {
  hasReported: boolean;
  createdAt: string | null;
  jiraTicketId: string | null;
  metadata?: Record<string, unknown> | null;
}

class DealReportsService {
  async submitReport(
    payload: DealReportRequest,
    token?: string
  ): Promise<ApiResponse<DealReportResponse>> {
    return apiService.post('/deal-reports', payload, token);
  }

  async checkReport(
    dealId: number,
    token?: string
  ): Promise<ApiResponse<DealReportStatus>> {
    return apiService.get(`/deal-reports/check/${dealId}`, token);
  }
}

export const dealReportsService = new DealReportsService();
