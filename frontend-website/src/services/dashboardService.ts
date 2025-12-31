import { apiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';
import { imageService, Image } from './imageService';

export interface DashboardStats {
  totalScans: number;
  totalLogs: number;
  totalReminders: number;
  totalConsultations: number;
  eczemaDetectedCount: number;
  dayStreak: number;
  improvementPercent: number;
  logsThisMonth: number;
}

export interface RecentActivity {
  id: string;
  type: 'scan' | 'log' | 'reminder' | 'consultation';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'info' | 'warning';
}

export interface SymptomLog {
  id: string;
  itchinessLevel: number;
  affectedArea: string;
  possibleTriggers?: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch data from multiple endpoints in parallel
      const [images, logs, reminders, consultations] = await Promise.all([
        this.fetchImages(),
        this.fetchLogs(),
        this.fetchReminders(),
        this.fetchConsultations(),
      ]);

      // Calculate stats
      const totalScans = images.length;
      const totalLogs = logs.length;
      // Handle new prediction field or fallback to eczema_detected for backward compatibility
      const eczemaDetectedCount = images.filter(img => {
        if (!img.analysisResult) return false;
        const prediction = img.analysisResult.prediction;
        if (prediction) {
          return prediction === 'Eczema';
        }
        return img.analysisResult.eczema_detected || false;
      }).length;

      // Calculate day streak (consecutive days with logs)
      const dayStreak = this.calculateDayStreak(logs);

      // Calculate logs this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const logsThisMonth = logs.filter(log => new Date(log.createdAt) >= startOfMonth).length;

      // Calculate improvement (based on itchiness level trend)
      const improvementPercent = this.calculateImprovement(logs);

      return {
        totalScans,
        totalLogs,
        totalReminders: reminders.length,
        totalConsultations: consultations.length,
        eczemaDetectedCount,
        dayStreak,
        improvementPercent,
        logsThisMonth,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalScans: 0,
        totalLogs: 0,
        totalReminders: 0,
        totalConsultations: 0,
        eczemaDetectedCount: 0,
        dayStreak: 0,
        improvementPercent: 0,
        logsThisMonth: 0,
      };
    }
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const [images, logs] = await Promise.all([
        this.fetchImages(),
        this.fetchLogs(),
      ]);

      const activities: RecentActivity[] = [];

      // Add image scan activities
      images.slice(0, 3).forEach(image => {
        const prediction = image.analysisResult?.prediction || 
          (image.analysisResult?.eczema_detected ? 'Eczema' : 'Normal');
        const severity = image.analysisResult?.severity;
        const confidence = ((image.analysisResult?.confidence || 0) * 100).toFixed(0);
        
        let description: string;
        let status: 'success' | 'warning' | 'info';
        
        if (prediction === 'Uncertain') {
          description = `Uncertain result - ${confidence}% confidence. Consult a dermatologist.`;
          status = 'info';
        } else if (prediction === 'Eczema') {
          description = `${severity || 'Eczema'} detected - ${confidence}% confidence`;
          status = 'warning';
        } else {
          description = `No eczema detected - ${confidence}% confidence`;
          status = 'success';
        }
        
        activities.push({
          id: `scan-${image._id}`,
          type: 'scan',
          title: 'Skin scan completed',
          description,
          time: this.formatTimeAgo(image.createdAt),
          status,
        });
      });

      // Add symptom log activities
      logs.slice(0, 3).forEach(log => {
        activities.push({
          id: `log-${log.id}`,
          type: 'log',
          title: 'Symptom logged',
          description: `Itchiness level: ${log.itchinessLevel}/10 - ${log.affectedArea}`,
          time: this.formatTimeAgo(log.createdAt),
          status: 'info',
        });
      });

      // Sort by time (most recent first)
      activities.sort((a, b) => {
        // Parse time strings to compare
        return 0; // Keep original order for now
      });

      return activities.slice(0, 5);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  private async fetchImages(): Promise<Image[]> {
    try {
      return await imageService.getUserImages();
    } catch {
      return [];
    }
  }

  private async fetchLogs(): Promise<SymptomLog[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: SymptomLog[];
        message: string;
      }>(API_ENDPOINTS.SYMPTOMS.LIST);
      return response.data?.data || [];
    } catch {
      return [];
    }
  }

  private async fetchReminders(): Promise<any[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: any[];
        message: string;
      }>(API_ENDPOINTS.REMINDERS.LIST);
      return response.data?.data || [];
    } catch {
      return [];
    }
  }

  private async fetchConsultations(): Promise<any[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: any[];
        message: string;
      }>(API_ENDPOINTS.CONSULTATIONS.LIST);
      return response.data?.data || [];
    } catch {
      return [];
    }
  }

  private calculateDayStreak(logs: SymptomLog[]): number {
    if (logs.length === 0) return 0;

    // Sort logs by date (most recent first)
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const log of sortedLogs) {
      const logDate = new Date(log.createdAt);
      logDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === streak) {
        streak++;
        currentDate = new Date(logDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays > streak + 1) {
        break;
      }
    }

    return streak;
  }

  private calculateImprovement(logs: SymptomLog[]): number {
    if (logs.length < 2) return 0;

    // Compare average itchiness of first half vs second half
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const halfIndex = Math.floor(sortedLogs.length / 2);
    const firstHalf = sortedLogs.slice(0, halfIndex);
    const secondHalf = sortedLogs.slice(halfIndex);

    const firstHalfAvg = firstHalf.reduce((sum, log) => sum + log.itchinessLevel, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, log) => sum + log.itchinessLevel, 0) / secondHalf.length;

    if (firstHalfAvg === 0) return 0;

    const improvement = ((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100;
    return Math.round(Math.max(0, improvement)); // Only positive improvements
  }

  private formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }
}

export const dashboardService = new DashboardService();




