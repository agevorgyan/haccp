import { api } from './api';

export interface ChatResponse {
  answer: string;
  timestamp: string;
  contextSummary: {
    complianceScore: number;
    openViolationsCount: number;
    activeCapasCount: number;
  };
}

export const aiApi = {
  async chat(prompt: string): Promise<ChatResponse> {
    const response = await api.post('/ai/chat', { prompt });
    return response.data;
  },
};
