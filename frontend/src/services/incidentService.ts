import { apiClient } from './apiClient';
import type {
  IncidentsListResponse,
  IncidentItem,
  FindingItem,
  RecommendationItem,
} from '../types/api';

export const incidentService = {
  async getIncidents(
    page: number = 1,
    pageSize: number = 20,
    status?: string,
    severity?: string
  ): Promise<IncidentsListResponse> {
    const params: Record<string, any> = { page, page_size: pageSize };
    if (status) params.status = status;
    if (severity) params.severity = severity;

    const response = await apiClient.get<IncidentsListResponse>('/api/incidents', {
      params,
    });
    return response.data;
  },

  async getIncidentById(incidentId: string): Promise<IncidentItem> {
    const response = await apiClient.get<IncidentItem>(`/api/incidents/${incidentId}`);
    return response.data;
  },

  async getIncidentFindings(incidentId: string): Promise<FindingItem[]> {
    const response = await apiClient.get<FindingItem[]>(
      `/api/incidents/${incidentId}/findings`
    );
    return response.data;
  },

  async getIncidentRecommendations(incidentId: string): Promise<RecommendationItem[]> {
    const response = await apiClient.get<RecommendationItem[]>(
      `/api/incidents/${incidentId}/recommendations`
    );
    return response.data;
  },
};
