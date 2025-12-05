import { apiService } from './api';

export interface DisputeResponse {
  ticketId: string;
  message: string;
}

export const disputeService = {
  async submitDispute(reason: string, message: string, token?: string) {
    return apiService.post<DisputeResponse>(
      '/disputes',
      { reason, message },
      token
    );
  },
};
