import { api } from './api';

export type SensorType = 'TEMPERATURE' | 'HUMIDITY';
export const SensorType = {
  TEMPERATURE: 'TEMPERATURE',
  HUMIDITY: 'HUMIDITY',
} as const;

export type SensorStatus = 'ACTIVE' | 'OFFLINE' | 'MAINTENANCE';
export const SensorStatus = {
  ACTIVE: 'ACTIVE',
  OFFLINE: 'OFFLINE',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export interface IoTSensor {
  id: string;
  organizationId: string;
  branchId?: string;
  sensorCode: string;
  name: string;
  type: SensorType;
  ccpId?: string;
  status: SensorStatus;
  batteryLevel: number;
  lastPingAt?: string;
  createdAt: string;
  updatedAt: string;
  ccp?: {
    id: string;
    code: string;
    name: string;
    criticalLimitMin?: number;
    criticalLimitMax?: number;
    warningLimitMin?: number;
    warningLimitMax?: number;
    unit: string;
  };
  telemetryReadings?: SensorTelemetry[];
}

export interface SensorTelemetry {
  id: string;
  organizationId: string;
  sensorId: string;
  value: number;
  unit: string;
  timestamp: string;
}

export const iotApi = {
  async getSensors(): Promise<IoTSensor[]> {
    const response = await api.get('/iot-sensors');
    return response.data;
  },

  async getSensor(id: string): Promise<IoTSensor> {
    const response = await api.get(`/iot-sensors/${id}`);
    return response.data;
  },

  async createSensor(data: {
    sensorCode: string;
    name: string;
    type: SensorType;
    ccpId?: string;
    batteryLevel?: number;
    status?: SensorStatus;
    branchId?: string;
  }): Promise<IoTSensor> {
    const response = await api.post('/iot-sensors', data);
    return response.data;
  },

  async updateSensor(id: string, data: Partial<IoTSensor>): Promise<IoTSensor> {
    const response = await api.put(`/iot-sensors/${id}`, data);
    return response.data;
  },

  async ingestTelemetry(data: {
    sensorId: string;
    value: number;
    unit: string;
    batteryLevel?: number;
  }): Promise<{ telemetry: SensorTelemetry; violationTriggered?: any }> {
    const response = await api.post('/iot-sensors/telemetry', data);
    return response.data;
  },

  async deleteSensor(id: string): Promise<{ success: boolean; id: string }> {
    const response = await api.delete(`/iot-sensors/${id}`);
    return response.data;
  },
};
