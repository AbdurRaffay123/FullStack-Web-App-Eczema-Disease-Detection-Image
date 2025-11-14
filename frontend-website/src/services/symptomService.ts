import { apiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

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
 * Symptom Service
 * Handles all symptom log-related API calls
 */
class SymptomService {
  /**
   * Create Symptom Log
   * POST /logs
   */
  async createLog(data: CreateLogData): Promise<SymptomLog> {
    const response = await apiClient.post<{ success: boolean; data: { log: SymptomLog } }>(
      API_ENDPOINTS.SYMPTOMS.CREATE,
      data
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.message || 'Failed to create log');
    }

    return response.data.data.log;
  }

  /**
   * Get All Logs
   * GET /logs
   */
  async getLogs(): Promise<SymptomLog[]> {
    const response = await apiClient.get<{ success: boolean; data: { logs: SymptomLog[] } }>(
      API_ENDPOINTS.SYMPTOMS.LIST
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.message || 'Failed to fetch logs');
    }

    return response.data.data.logs;
  }

  /**
   * Get Single Log by ID
   * GET /logs/:id
   */
  async getLogById(id: string): Promise<SymptomLog> {
    const response = await apiClient.get<{ success: boolean; data: { log: SymptomLog } }>(
      API_ENDPOINTS.SYMPTOMS.GET,
      { params: { id } }
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.message || 'Failed to fetch log');
    }

    return response.data.data.log;
  }

  /**
   * Update Symptom Log
   * PUT /logs/:id
   */
  async updateLog(id: string, data: UpdateLogData): Promise<SymptomLog> {
    const response = await apiClient.put<{ success: boolean; data: { log: SymptomLog } }>(
      API_ENDPOINTS.SYMPTOMS.UPDATE,
      data,
      { params: { id } }
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.message || 'Failed to update log');
    }

    return response.data.data.log;
  }

  /**
   * Delete Symptom Log
   * DELETE /logs/:id
   */
  async deleteLog(id: string): Promise<void> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.SYMPTOMS.DELETE,
      { params: { id } }
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.message || 'Failed to delete log');
    }
  }
}

export const symptomService = new SymptomService();

