import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Chrome as Home,
  FileText,
  Brain,
  User,
  Stethoscope,
  Bell,
  TrendingUp,
  Lightbulb,
  Image as ImageIcon,
  Settings,
  LogOut,
  X,
  Heart,
} from 'lucide-react-native';
import { authService, User as UserType } from '@/services/authService';
import { useNotifications } from '@/context/NotificationContext';

interface DrawerContentProps {
  onClose: () => void;
}

interface NavItem {
  id: string;
  title: string;
  icon: any;
  route: string;
  color: string;
  badge?: number;
}

export default function DrawerContent({ onClose }: DrawerContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserType | null>(null);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const navItems: NavItem[] = [
    {
      id: 'home',
      title: 'Home',
      icon: Home,
      route: '/(tabs)',
      color: '#6A9FB5',
    },
    {
      id: 'ai',
      title: 'AI Skin Scan',
      icon: Brain,
      route: '/(tabs)/ai',
      color: '#6A9FB5',
    },
    {
      id: 'logs',
      title: 'Symptom Logs',
      icon: FileText,
      route: '/(tabs)/logs',
      color: '#C5B4E3',
    },
    {
      id: 'consult',
      title: 'Consult Doctor',
      icon: Stethoscope,
      route: '/consult',
      color: '#28A745',
    },
    {
      id: 'reminders',
      title: 'Reminders',
      icon: Bell,
      route: '/reminders',
      color: '#DC3545',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      route: '/notifications',
      color: '#FFA500',
      badge: unreadCount,
    },
    {
      id: 'progress',
      title: 'View Progress',
      icon: TrendingUp,
      route: '/progress',
      color: '#17A2B8',
    },
    {
      id: 'tips',
      title: 'Skincare Tips',
      icon: Lightbulb,
      route: '/tips',
      color: '#FFA500',
    },
    {
      id: 'images',
      title: 'My Images',
      icon: ImageIcon,
      route: '/images',
      color: '#6A9FB5',
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: User,
      route: '/(tabs)/profile',
      color: '#C5B4E3',
    },
  ];

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 100);
  };

  const handleLogout = async () => {
    onClose();
    try {
      await authService.logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (route: string) => {
    if (route === '/(tabs)' && pathname === '/(tabs)/index') return true;
    return pathname === route || pathname.startsWith(route);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Logo & User Info */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={['#6A9FB5', '#C5B4E3']}
            style={styles.logoBackground}
          >
            <Heart size={28} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.appName}>EczemaCare</Text>
          {user && (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          )}
        </View>

        {/* Navigation Items */}
        <ScrollView
          style={styles.navScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.navContent}
        >
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.route);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, active && styles.navItemActive]}
                onPress={() => handleNavigation(item.route)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.navIconContainer,
                    { backgroundColor: active ? item.color : 'transparent' },
                  ]}
                >
                  <IconComponent
                    size={20}
                    color={active ? '#FFFFFF' : item.color}
                  />
                </View>
                <Text
                  style={[
                    styles.navTitle,
                    active && styles.navTitleActive,
                  ]}
                >
                  {item.title}
                </Text>
                {item.badge !== undefined && item.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.badge > 9 ? '9+' : String(item.badge)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Logout Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#DC3545" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 48,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#6A9FB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  appName: {
    fontSize: 22,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  navScrollView: {
    flex: 1,
  },
  navContent: {
    padding: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: 'rgba(106, 159, 181, 0.15)',
  },
  navIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  navTitleActive: {
    color: '#FFFFFF',
    fontFamily: 'OpenSans-SemiBold',
  },
  badge: {
    backgroundColor: '#DC3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'OpenSans-Bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#DC3545',
    marginLeft: 8,
  },
});

