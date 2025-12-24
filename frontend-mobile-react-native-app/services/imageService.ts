import { apiClient } from '@/utils/apiClient';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';
import * as SecureStore from 'expo-secure-store';

export interface ImageAnalysisResult {
  relevant: boolean;
  eczema_detected: boolean;
  confidence: number;
  severity?: string | null;
  explanation?: string;
  message?: string;
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
  async uploadImage(uri: string, type: string = 'image/jpeg'): Promise<UploadImageResponse> {
    // Get filename from URI
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1] : 'jpg';
    const name = filename.split('.')[0];

    // Create FormData
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: type || 'image/jpeg',
      name: `${name}.${ext}`,
    } as any);

    // Get token
    const token = await SecureStore.getItemAsync('eczema_token');
    // Use the same base URL as API_CONFIG (without /api suffix)
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.18.224:3000';
    const url = `${baseUrl}/api${API_ENDPOINTS.IMAGES.UPLOAD}`;

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.status === 401) {
      // Token expired
      await SecureStore.deleteItemAsync('eczema_token');
      throw new Error('Token expired. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to upload image');
    }

    const data = await response.json();
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
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.18.224:3000';
    return `${baseUrl}/uploads/${filename}`;
  }
}

export const imageService = new ImageService();

