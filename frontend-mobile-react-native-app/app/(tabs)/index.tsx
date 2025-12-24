import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, FileText, Lightbulb, Brain, Bell, TrendingUp, Stethoscope, CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, useCallback } from 'react';
import { authService, User } from '@/services/authService';
import { dashboardService, DashboardStats, RecentActivity } from '@/services/dashboardService';
import AppHeader from '@/components/AppHeader';
import { useDrawer } from '@/context/DrawerContext';

export default function HomeScreen() {
  const router = useRouter();
  const { openDrawer } = useDrawer();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [userData, dashboardStats, activities] = await Promise.all([
        authService.getUser(),
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(),
      ]);
      setUser(userData);
      setStats(dashboardStats);
      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const features = [
    {
      id: 'scan',
      title: 'AI Skin Scan',
      subtitle: 'Analyze your skin condition',
      icon: Brain,
      color: '#6A9FB5',
      onPress: () => router.push('/(tabs)/ai'),
    },
    {
      id: 'consult',
      title: 'CONSULT DOCTOR',
      subtitle: 'Connect with specialists',
      icon: Stethoscope,
      color: '#28A745',
      onPress: () => router.push('/consult'),
    },
    {
      id: 'logs',
      title: 'Symptom Logs',
      subtitle: 'Track your progress',
      icon: FileText,
      color: '#C5B4E3',
      onPress: () => router.push('/(tabs)/logs'),
    },
    {
      id: 'tips',
      title: 'Skincare Tips',
      subtitle: 'Expert recommendations',
      icon: Lightbulb,
      color: '#FFA500',
      onPress: () => router.push('/tips'),
    },
    {
      id: 'reminders',
      title: 'Set Reminders',
      subtitle: 'Never miss your routine',
      icon: Bell,
      color: '#DC3545',
      onPress: () => router.push('/reminders'),
    },
    {
      id: 'progress',
      title: 'View Progress',
      subtitle: 'See your improvements',
      icon: TrendingUp,
      color: '#17A2B8',
      onPress: () => router.push('/progress'),
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'scan': return Camera;
      case 'log': return FileText;
      case 'reminder': return Bell;
      case 'consultation': return Stethoscope;
      default: return CheckCircle;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return '#28A745';
      case 'warning': return '#FFA500';
      case 'info': return '#6A9FB5';
      default: return '#6A9FB5';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1A1A2E', '#16213E', '#0F3460']}
          style={styles.backgroundGradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6A9FB5" />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.backgroundGradient}
      >
        <AppHeader title="EczemaCare" onMenuPress={openDrawer} />
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6A9FB5"
              colors={['#6A9FB5']}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>{getGreeting()}!</Text>
            <Text style={styles.username}>{user?.name?.split(' ')[0] || 'User'}</Text>
            <Text style={styles.subtitle}>How is your skin feeling today?</Text>
          </View>

          {/* Stats Summary */}
          <View style={styles.statsSection}>
            <LinearGradient
              colors={['#6A9FB5', '#C5B4E3']}
              style={styles.statsCard}
            >
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats?.totalScans || 0}</Text>
                  <Text style={styles.statLabel}>Scans</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats?.totalLogs || 0}</Text>
                  <Text style={styles.statLabel}>Logs</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats?.dayStreak || 0}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats?.improvementPercent || 0}%</Text>
                  <Text style={styles.statLabel}>Better</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature) => (
                <TouchableOpacity
                  key={feature.id}
                  style={styles.featureCard}
                  onPress={feature.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                    <feature.icon size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.recentActivity}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              {recentActivity.length === 0 ? (
                <View style={styles.emptyActivity}>
                  <Clock size={32} color="#666666" />
                  <Text style={styles.emptyActivityText}>No recent activity</Text>
                  <Text style={styles.emptyActivitySubtext}>
                    Start by uploading a scan or logging symptoms
                  </Text>
                </View>
              ) : (
                recentActivity.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <View key={activity.id} style={styles.activityItem}>
                      <View style={[styles.activityDot, { backgroundColor: getActivityColor(activity.status) }]}>
                        <ActivityIcon size={12} color="#FFFFFF" />
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityTitle}>{activity.title}</Text>
                        <Text style={styles.activityDescription}>{activity.description}</Text>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* More Stats */}
          <View style={styles.moreStatsSection}>
            <Text style={styles.sectionTitle}>Your Summary</Text>
            <View style={styles.moreStatsGrid}>
              <View style={styles.moreStatCard}>
                <Camera size={24} color="#6A9FB5" />
                <Text style={styles.moreStatNumber}>{stats?.totalScans || 0}</Text>
                <Text style={styles.moreStatLabel}>Total Scans</Text>
              </View>
              <View style={styles.moreStatCard}>
                <Bell size={24} color="#DC3545" />
                <Text style={styles.moreStatNumber}>{stats?.totalReminders || 0}</Text>
                <Text style={styles.moreStatLabel}>Reminders</Text>
              </View>
              <View style={styles.moreStatCard}>
                <Stethoscope size={24} color="#28A745" />
                <Text style={styles.moreStatNumber}>{stats?.totalConsultations || 0}</Text>
                <Text style={styles.moreStatLabel}>Consultations</Text>
              </View>
              <View style={styles.moreStatCard}>
                <FileText size={24} color="#C5B4E3" />
                <Text style={styles.moreStatNumber}>{stats?.logsThisMonth || 0}</Text>
                <Text style={styles.moreStatLabel}>Logs This Month</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#B0B0B0',
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
  },
  greeting: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  username: {
    fontSize: 32,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  statsSection: {
    padding: 24,
    paddingTop: 0,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#6A9FB5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  featuresContainer: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
  },
  recentActivity: {
    padding: 24,
    paddingTop: 0,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyActivity: {
    alignItems: 'center',
    padding: 24,
  },
  emptyActivityText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#B0B0B0',
    marginTop: 12,
  },
  emptyActivitySubtext: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#666666',
  },
  moreStatsSection: {
    padding: 24,
    paddingTop: 0,
    paddingBottom: 40,
  },
  moreStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moreStatCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  moreStatNumber: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  moreStatLabel: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginTop: 4,
  },
});
