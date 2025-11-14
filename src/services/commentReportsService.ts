import { apiService, ApiResponse } from './api';

export interface CommentReportRequest {
  ratingId: number;
  reason: string;
}

export interface CommentReportResponse {
  ratingId: number;
  jiraTicketId?: string | null;
  createdAt?: string | null;
}

export interface CommentReportStatus {
  hasReported: boolean;
  ratingId: number;
  jiraTicketId: string | null;
  createdAt: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface CommentReportIssue {
  issueKey: string;
  status: string;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
  rating: {
    id: number;
    rating: number;
    comment: string | null;
    createdAt: string;
    reviewerName?: string | null;
    reviewerEmail?: string | null;
    restaurantName?: string | null;
  } | null;
}

class CommentReportsService {
  submitReport(payload: CommentReportRequest, token?: string) {
    return apiService.post<CommentReportResponse>('/comment-reports', payload, token);
  }

  checkReport(ratingId: number, token?: string) {
    return apiService.get<CommentReportStatus>(`/comment-reports/check/${ratingId}`, token);
  }

  listReports(token?: string) {
    return apiService.get<CommentReportIssue[]>('/comment-reports', token);
  }

  dismissReport(issueKey: string, data?: { note?: string }, token?: string) {
    return apiService.post<{ issueKey: string; dismissed: boolean }>(
      `/comment-reports/${issueKey}/dismiss`,
      data,
      token
    );
  }

  removeComment(
    issueKey: string,
    data?: { ratingId?: number; note?: string },
    token?: string
  ) {
    return apiService.post<{ issueKey: string; removed: boolean }>(
      `/comment-reports/${issueKey}/remove`,
      data,
      token
    );
  }
}

export const commentReportsService = new CommentReportsService();
