import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import { authService } from './authService';

export interface SymptomLog {
  id: string;
  userId: string;
  itchinessLevel: number;
  affectedArea: string;
  possibleTriggers: string;
  additionalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogData {
  itchinessLevel: number;
  affectedArea: string;
  possibleTriggers?: string;
  additionalNotes?: string;
}

export interface UpdateLogData {
  itchinessLevel?: number;
  affectedArea?: string;
  possibleTriggers?: string;
  additionalNotes?: string;
}

/**
 * Symptom Service for Mobile App
 * Handles all symptom log-related API calls
 */
class SymptomService {
  private baseURL = API_CONFIG.BASE_URL;

  private async getAuthToken(): Promise<string | null> {
    return await authService.getToken();
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: any;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body } = options;
    const token = await this.getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Request failed');
    }

    if (!result.success) {
      throw new Error(result.message || 'Request failed');
    }

    return result.data;
  }

  /**
   * Create Symptom Log
   * POST /logs
   */
  async createLog(data: CreateLogData): Promise<{ log: SymptomLog }> {
    return this.request<{ log: SymptomLog }>(API_ENDPOINTS.SYMPTOMS.CREATE, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Get All Logs
   * GET /logs
   */
  async getLogs(): Promise<{ logs: SymptomLog[] }> {
    return this.request<{ logs: SymptomLog[] }>(API_ENDPOINTS.SYMPTOMS.LIST);
  }

  /**
   * Get Single Log by ID
   * GET /logs/:id
   */
  async getLogById(id: string): Promise<{ log: SymptomLog }> {
    const endpoint = API_ENDPOINTS.SYMPTOMS.GET.replace(':id', id);
    return this.request<{ log: SymptomLog }>(endpoint);
  }

  /**
   * Update Symptom Log
   * PUT /logs/:id
   */
  async updateLog(id: string, data: UpdateLogData): Promise<{ log: SymptomLog }> {
    const endpoint = API_ENDPOINTS.SYMPTOMS.UPDATE.replace(':id', id);
    return this.request<{ log: SymptomLog }>(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  /**
   * Delete Symptom Log
   * DELETE /logs/:id
   */
  async deleteLog(id: string): Promise<void> {
    const endpoint = API_ENDPOINTS.SYMPTOMS.DELETE.replace(':id', id);
    await this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const symptomService = new SymptomService();

