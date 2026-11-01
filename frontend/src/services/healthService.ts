import { apiClient } from './apiClient';
import type { HealthCheckResponse, SystemStatusResponse } from '../types/api';

export const healthService = {
  async checkHealth(): Promise<HealthCheckResponse> {
    const response = await apiClient.get<HealthCheckResponse>('/api/health');
    return response.data;
  },

  async getSystemStatus(): Promise<SystemStatusResponse> {
    const response = await apiClient.get<SystemStatusResponse>('/api/system/status');
    return response.data;
  },
};
