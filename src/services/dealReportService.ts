import { API_BASE_URL } from './api';

export interface ReportDealRequest {
  dealId: number;
  reason: string;
}

export interface ReportDealResponse {
  reportId: number;
  dealId: number;
  jiraTicketId: string | null;
  message: string;
}

export interface ReportStatusResponse {
  hasReported: boolean;
  reportId: number | null;
  createdAt: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class DealReportService {
  private baseUrl = `${API_BASE_URL}/deal-reports`;

  /**
   * Submit a report for a deal
   */
  async reportDeal(
    request: ReportDealRequest,
    token?: string
  ): Promise<ApiResponse<ReportDealResponse>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to submit report',
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('Error submitting report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit report',
      };
    }
  }

  /**
   * Check if the current user has already reported a deal
   */
  async checkReportStatus(
    dealId: number,
    token?: string
  ): Promise<ApiResponse<ReportStatusResponse>> {
    try {
      const headers: HeadersInit = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/check/${dealId}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to check report status',
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('Error checking report status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check report status',
      };
    }
  }
}

export const dealReportService = new DealReportService();
