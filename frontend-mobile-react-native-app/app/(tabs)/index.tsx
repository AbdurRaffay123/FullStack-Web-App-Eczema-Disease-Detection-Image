import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, FileText, Lightbulb, Brain, Bell, TrendingUp, Stethoscope } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { authService } from '@/services/authService';

export default function HomeScreen() {
  const router = useRouter();

  // Notification polling is handled by NotificationContext

  const features = [
    {
      id: 'scan',
      title: 'AI Skin Scan',
      subtitle: 'Analyze your skin condition',
      icon: Brain,
      color: '#6A9FB5',
      onPress: () => router.push('/ai'),
    },
    {
      id: 'consult',
      title: 'CONSULT HEALTHCARE',
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
      onPress: () => router.push('/logs'),
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.backgroundGradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.username}>Junaid</Text>
            <Text style={styles.subtitle}>How is your skin feeling today?</Text>
          </View>

          <View style={styles.quickStats}>
            <LinearGradient
              colors={['#6A9FB5', '#C5B4E3']}
              style={styles.statsCard}
            >
              <Text style={styles.statsTitle}>Today's Check-in</Text>
              <Text style={styles.statsSubtitle}>Tap to log your symptoms</Text>
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
              <View style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Skin scan completed</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Moisturizer reminder</Text>
                  <Text style={styles.activityTime}>4 hours ago</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Symptom log added</Text>
                  <Text style={styles.activityTime}>Yesterday</Text>
                </View>
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
  quickStats: {
    padding: 24,
    paddingTop: 0,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#6A9FB5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
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
    fontSize: 16,
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6A9FB5',
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
  activityTime: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
});