import { apiClient } from '@/utils/apiClient';
import { API_ENDPOINTS, buildApiUrl, API_CONFIG } from '@/config/api';
import * as SecureStore from 'expo-secure-store';

export interface ImageAnalysisResult {
  relevant: boolean;
  prediction: 'Eczema' | 'Normal' | 'Uncertain'; // New three-state prediction
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
  async uploadImage(uri: string, type: string = 'image/jpeg'): Promise<UploadImageResponse> {
    try {
      // Get filename from URI
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : 'jpg';
      const name = filename.split('.')[0];

      // Create FormData for React Native
      const formData = new FormData();
      // React Native FormData format - ensure URI is properly formatted
      const imageUri = uri.startsWith('file://') || uri.startsWith('http') ? uri : `file://${uri}`;
      formData.append('image', {
        uri: imageUri,
        type: type || 'image/jpeg',
        name: `${name}.${ext}`,
      } as any);

      // Get token
      const token = await SecureStore.getItemAsync('eczema_token');
      // Use buildApiUrl to construct the correct URL with /api prefix
      const url = buildApiUrl(API_ENDPOINTS.IMAGES.UPLOAD);

      console.log('📤 Uploading image to:', url);
      console.log('📸 Image URI:', uri);

      // IMPORTANT: Do NOT set Content-Type header for FormData in React Native
      // React Native will automatically set it with the correct boundary
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

      console.log('📥 Response status:', response.status);

      if (response.status === 401) {
        // Token expired
        await SecureStore.deleteItemAsync('eczema_token');
        throw new Error('Token expired. Please login again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to upload image' };
        }
        throw new Error(errorData.message || errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to upload image');
      }
      return data.data;
    } catch (error: any) {
      console.error('❌ Image upload error:', error);
      // Provide more helpful error messages
      if (error.message === 'Network request failed') {
        throw new Error('Network error: Please check your internet connection and ensure the backend server is running.');
      }
      throw error;
    }
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
    // Use the base URL without /api for static file serving
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    return `${baseUrl}/uploads/${filename}`;
  }
}

export const imageService = new ImageService();

