import { apiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

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
  doctorName: string;
  doctorSpecialty: string;
  doctorEmail: string;
  doctorPhone?: string;
  price: number;
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
  doctorSpecialty: string;
  doctorEmail: string;
  doctorPhone?: string;
  price: number;
}

/**
 * Consultation Service
 * Handles all consultation booking-related API calls
 */
class ConsultationService {
  /**
   * Create Consultation Booking
   * POST /api/consultations
   */
  async createConsultation(data: CreateConsultationData): Promise<{ consultation: Consultation }> {
    const response = await apiClient.post<{ success: boolean; data: { consultation: Consultation }; message: string }>(
      API_ENDPOINTS.CONSULTATIONS.CREATE,
      data
    );

    if (response.status === 400 && response.data?.message?.includes('Profile incomplete')) {
      throw new Error('PROFILE_INCOMPLETE: ' + response.data.message);
    }

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to create consultation booking');
    }

    return response.data.data;
  }

  /**
   * Get All Consultations for User
   * GET /api/consultations
   */
  async getConsultations(): Promise<{ consultations: Consultation[] }> {
    const response = await apiClient.get<{ success: boolean; data: { consultations: Consultation[] } }>(
      API_ENDPOINTS.CONSULTATIONS.LIST
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to fetch consultations');
    }

    return response.data.data;
  }

  /**
   * Get Single Consultation by ID
   * GET /api/consultations/:id
   */
  async getConsultationById(id: string): Promise<{ consultation: Consultation }> {
    const response = await apiClient.get<{ success: boolean; data: { consultation: Consultation } }>(
      API_ENDPOINTS.CONSULTATIONS.GET.replace(':id', id)
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to fetch consultation');
    }

    return response.data.data;
  }

  /**
   * Delete Consultation
   * DELETE /api/consultations/:id
   */
  async deleteConsultation(id: string): Promise<void> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.CONSULTATIONS.DELETE.replace(':id', id)
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to delete consultation');
    }
  }
}

export const consultationService = new ConsultationService();

