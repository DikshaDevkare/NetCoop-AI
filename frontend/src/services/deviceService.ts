import { apiClient } from './apiClient';
import type {
  DevicesListResponse,
  DeviceItem,
  DeviceTelemetryResponse,
  IncidentItem,
} from '../types/api';

export const deviceService = {
  async getDevices(
    page: number = 1,
    pageSize: number = 50,
    segment?: string
  ): Promise<DevicesListResponse> {
    const params: Record<string, any> = { page, page_size: pageSize };
    if (segment) params.segment = segment;
    const response = await apiClient.get<DevicesListResponse>('/api/devices', {
      params,
    });
    return response.data;
  },

  async getDeviceById(deviceId: string): Promise<DeviceItem> {
    const response = await apiClient.get<DeviceItem>(`/api/devices/${deviceId}`);
    return response.data;
  },

  async getDeviceTelemetry(
    deviceId: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<DeviceTelemetryResponse> {
    const response = await apiClient.get<DeviceTelemetryResponse>(
      `/api/devices/${deviceId}/telemetry`,
      { params: { page, page_size: pageSize } }
    );
    return response.data;
  },

  async getDeviceIncidents(deviceId: string): Promise<IncidentItem[]> {
    const response = await apiClient.get<IncidentItem[]>(
      `/api/devices/${deviceId}/incidents`
    );
    return response.data;
  },
};
