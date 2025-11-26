import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import { authService } from './authService';

export interface Consultation {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  consultationType: 'video' | 'phone' | 'chat';
  preferredDate: string;
  preferredTime: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateConsultationData {
  consultationType: 'video' | 'phone' | 'chat';
  preferredDate: string; // YYYY-MM-DD format
  preferredTime: string; // HH:MM format
  reason: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone?: string;
}

/**
 * Consultation Service for Mobile App
 * Handles all consultation booking-related API calls
 */
class ConsultationService {
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
   * Create Consultation Booking
   * POST /api/consultations
   */
  async createConsultation(data: CreateConsultationData): Promise<{ consultation: Consultation }> {
    try {
      return await this.request<{ consultation: Consultation }>(
        API_ENDPOINTS.CONSULTATIONS.CREATE,
        {
          method: 'POST',
          body: data,
        }
      );
    } catch (error: any) {
      // Handle profile incomplete error
      if (error.message?.includes('Profile incomplete')) {
        throw new Error('PROFILE_INCOMPLETE: ' + error.message);
      }
      throw error;
    }
  }

  /**
   * Get All Consultations for User
   * GET /api/consultations
   */
  async getConsultations(): Promise<{ consultations: Consultation[] }> {
    return await this.request<{ consultations: Consultation[] }>(
      API_ENDPOINTS.CONSULTATIONS.LIST
    );
  }

  /**
   * Get Single Consultation by ID
   * GET /api/consultations/:id
   */
  async getConsultationById(id: string): Promise<{ consultation: Consultation }> {
    return await this.request<{ consultation: Consultation }>(
      API_ENDPOINTS.CONSULTATIONS.GET.replace(':id', id)
    );
  }

  /**
   * Delete Consultation
   * DELETE /api/consultations/:id
   */
  async deleteConsultation(id: string): Promise<void> {
    await this.request(
      API_ENDPOINTS.CONSULTATIONS.DELETE.replace(':id', id),
      { method: 'DELETE' }
    );
  }
}

export const consultationService = new ConsultationService();

