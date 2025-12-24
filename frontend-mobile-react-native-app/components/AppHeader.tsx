import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Menu, Bell, ArrowLeft } from 'lucide-react-native';
import { useNotifications } from '@/context/NotificationContext';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  showNotification?: boolean;
  onMenuPress?: () => void;
  onBackPress?: () => void;
}

export default function AppHeader({
  title,
  showBack = false,
  showMenu = true,
  showNotification = true,
  onMenuPress,
  onBackPress,
}: AppHeaderProps) {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  return (
    <View style={styles.header}>
      {/* Left Button */}
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : showMenu ? (
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Menu size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Right Button - Notification Bell */}
      <View style={styles.rightContainer}>
        {showNotification ? (
          <TouchableOpacity
            onPress={handleNotificationPress}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Bell size={24} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  leftContainer: {
    width: 48,
  },
  rightContainer: {
    width: 48,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#DC3545',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'OpenSans-Bold',
  },
});

