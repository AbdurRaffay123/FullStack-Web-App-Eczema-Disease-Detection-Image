import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Clock, Check, CheckCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();

  // Refresh notifications when screen is focused
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      // Error already handled in context
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      // Error already handled in context
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.backgroundGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <CheckCheck size={20} color="#6A9FB5" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6A9FB5" />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={64} color="#6A9FB5" />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyText}>You're all caught up!</Text>
            </View>
          ) : (
            <View style={styles.notificationsContainer}>
              {notifications.map((notification) => (
                <View
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    !notification.isRead && styles.notificationCardUnread,
                  ]}
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <View style={styles.notificationTitleContainer}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        {!notification.isRead && (
                          <View style={styles.unreadDot} />
                        )}
                      </View>
                      {!notification.isRead && (
                        <TouchableOpacity
                          style={styles.markReadButton}
                          onPress={() => handleMarkAsRead(notification.id)}
                        >
                          <Check size={16} color="#6A9FB5" />
                        </TouchableOpacity>
                      )}
                    </View>
                    {notification.message && (
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                    )}
                    <View style={styles.notificationFooter}>
                      <Clock size={12} color="#888888" />
                      <Text style={styles.notificationTime}>
                        {new Date(notification.triggeredAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: '#DC3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'OpenSans-Bold',
  },
  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(106, 159, 181, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    color: '#B0B0B0',
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
  },
  notificationsContainer: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationCardUnread: {
    backgroundColor: 'rgba(106, 159, 181, 0.15)',
    borderColor: 'rgba(106, 159, 181, 0.3)',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC3545',
    marginLeft: 8,
  },
  markReadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(106, 159, 181, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#888888',
    marginLeft: 4,
  },
});

