import { apiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';
import { imageService, Image } from './imageService';
import { symptomService, SymptomLog } from './symptomService';
import { reminderService, Reminder } from './reminderService';
import { consultationService } from './consultationService';

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
  timestamp: number; // Unix timestamp for sorting
}

// SymptomLog interface is imported from symptomService

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
      const [images, logs, reminders, consultations] = await Promise.all([
        this.fetchImages(),
        this.fetchLogs(),
        this.fetchReminders(),
        this.fetchConsultations(),
      ]);

      const activities: RecentActivity[] = [];

      // Add image scan activities (most recent first)
      images
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .forEach(image => {
          if (!image || !image._id) return;
          
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
          timestamp: new Date(image.createdAt).getTime(),
        });
      });

      // Add symptom log activities (most recent first)
      logs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .forEach(log => {
          if (!log || !log.id) return;
        activities.push({
          id: `log-${log.id}`,
          type: 'log',
          title: 'Symptom logged',
            description: `Itchiness level: ${log.itchinessLevel}/10 - ${log.affectedArea || 'Unknown area'}`,
          time: this.formatTimeAgo(log.createdAt),
          status: 'info',
          timestamp: new Date(log.createdAt).getTime(),
        });
      });

      // Add reminder activities (most recent first)
      reminders
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 2)
        .forEach(reminder => {
          if (!reminder || !reminder.id) return;
          activities.push({
            id: `reminder-${reminder.id}`,
            type: 'reminder',
            title: 'Reminder created',
            description: `${reminder.title} - ${reminder.type}`,
            time: reminder.createdAt ? this.formatTimeAgo(reminder.createdAt) : 'Recently',
            status: reminder.isActive ? 'success' : 'info',
            timestamp: reminder.createdAt ? new Date(reminder.createdAt).getTime() : Date.now(),
          });
        });

      // Add consultation activities (most recent first)
      consultations
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2)
        .forEach(consultation => {
          if (!consultation || !consultation.id) return;
          activities.push({
            id: `consultation-${consultation.id}`,
            type: 'consultation',
            title: 'Consultation booked',
            description: `With ${consultation.doctorName} - ${consultation.status}`,
            time: this.formatTimeAgo(consultation.createdAt),
            status: consultation.status === 'confirmed' ? 'success' : consultation.status === 'completed' ? 'success' : 'info',
            timestamp: new Date(consultation.createdAt).getTime(),
          });
        });

      // Sort all activities by timestamp (most recent first - newest to oldest)
      activities.sort((a, b) => b.timestamp - a.timestamp);

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
      // Use symptomService which handles the response structure correctly
      return await symptomService.getLogs() || [];
    } catch (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
  }

  private async fetchReminders(): Promise<Reminder[]> {
    try {
      // Use reminderService which handles the response structure correctly
      return await reminderService.getReminders() || [];
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return [];
    }
  }

  private async fetchConsultations(): Promise<any[]> {
    try {
      // Use consultationService which handles the response structure correctly
      const result = await consultationService.getConsultations();
      return result.consultations || [];
    } catch (error) {
      console.error('Error fetching consultations:', error);
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




