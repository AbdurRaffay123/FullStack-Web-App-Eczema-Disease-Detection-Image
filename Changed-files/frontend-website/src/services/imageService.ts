import { apiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

export interface ImageAnalysisResult {
  relevant: boolean;
  prediction?: 'Eczema' | 'Normal' | 'Uncertain'; // New three-state prediction
  eczema_detected: boolean; // Legacy field for backward compatibility
  confidence: number;
  severity?: string | null;
  explanation?: string;
  message?: string;
  reasoning?: string; // New field for detailed reasoning
  disclaimer: string;
}

export interface Image {
  _id: string;
  userId: string;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  analysisResult: ImageAnalysisResult | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadImageResponse {
  image: Image;
  analysis: ImageAnalysisResult;
}

class ImageService {
  /**
   * Upload and analyze an image
   */
  async uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    // Handle FormData with fetch directly (apiClient uses JSON.stringify which won't work for FormData)
    const token = localStorage.getItem('eczema_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api${API_ENDPOINTS.IMAGES.UPLOAD}`;

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type - browser will set it with boundary for FormData

    const fetchResponse = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (fetchResponse.status === 401) {
      // Token expired - handle logout
      localStorage.removeItem('eczema_token');
      window.location.href = '/login';
      throw new Error('Token expired. Please login again.');
    }

    if (!fetchResponse.ok) {
      const errorData = await fetchResponse.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to upload image');
    }

    const data = await fetchResponse.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to upload image');
    }
    return data.data;
  }

  /**
   * Get all user's images
   */
  async getUserImages(): Promise<Image[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: Image[];
      message: string;
    }>(API_ENDPOINTS.IMAGES.LIST);

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data?.data || [];
  }

  /**
   * Delete an image
   */
  async deleteImage(imageId: string): Promise<void> {
    const endpoint = API_ENDPOINTS.IMAGES.DELETE.replace(':id', imageId);
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(endpoint);

    if (response.error) {
      throw new Error(response.error);
    }
  }

  /**
   * Analyze an existing image
   */
  async analyzeImage(imageId: string): Promise<ImageAnalysisResult> {
    const endpoint = API_ENDPOINTS.IMAGES.ANALYZE.replace(':id', imageId);
    const response = await apiClient.post<{
      success: boolean;
      data: {
        image: Image;
        analysis: ImageAnalysisResult;
      };
      message: string;
    }>(endpoint);

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data?.data.analysis!;
  }

  /**
   * Get image URL for display
   */
  getImageUrl(path: string): string {
    // Extract filename from path
    const filename = path.split('/').pop() || path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${filename}`;
  }
}

export const imageService = new ImageService();

