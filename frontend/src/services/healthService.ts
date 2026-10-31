import { apiClient } from './api.ts';

export interface BackendHealthResponse {
  status: string;
  application: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface WelcomeResponse {
  message: string;
  status: string;
}

export async function checkBackendHealth(): Promise<{ connected: boolean; data: BackendHealthResponse | null; error?: string }> {
  try {
    const res = await apiClient.get<BackendHealthResponse>('/api/health');
    return {
      connected: true,
      data: res.data,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Backend unreachable';
    return {
      connected: false,
      data: null,
      error: errorMessage,
    };
  }
}

export async function getBackendWelcome(): Promise<{ connected: boolean; data: WelcomeResponse | null }> {
  try {
    const res = await apiClient.get<WelcomeResponse>('/');
    return {
      connected: true,
      data: res.data,
    };
  } catch {
    return {
      connected: false,
      data: null,
    };
  }
}
