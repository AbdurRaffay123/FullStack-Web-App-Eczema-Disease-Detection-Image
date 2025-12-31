import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, CircleHelp as HelpCircle, LogOut, CreditCard as Edit, Shield, ChevronRight, Save, Mail, Phone, Calendar, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { dashboardService } from '../../services/dashboardService';
import AppHeader from '@/components/AppHeader';
import { useDrawer } from '@/context/DrawerContext';
import { useModalHelpers } from '@/context/ModalContext';
import { Linking } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { openDrawer } = useDrawer();
  const { showSuccess, showError, showConfirm } = useModalHelpers();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [userStats, setUserStats] = useState({
    totalLogs: 0,
    totalScans: 0,
    totalReminders: 0,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const userData = await authService.getUser();
        if (userData) {
          setUser(userData);
        }

        // Load full profile from backend
        const profile = await userService.getProfile();
        setProfileData({
          fullName: profile.fullName || profile.name || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || '',
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
        });

        // Load user statistics
        const stats = await dashboardService.getDashboardStats();
        setUserStats({
          totalLogs: stats.totalLogs || 0,
          totalScans: stats.totalScans || 0,
          totalReminders: stats.totalReminders || 0,
        });
      } catch (error: any) {
        showError(error.message || 'Failed to load profile');
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);
  // Removed: notifications, dataSharing, analytics, locationTracking, twoFactorAuth

  const handleLogout = async () => {
    showConfirm(
      'Are you sure you want to logout?',
      'Logout',
      async () => {
            await authService.logout();
            router.replace('/auth');
          }
    );
  };

  const saveProfile = async () => {
    try {
      const result = await userService.updateProfile({
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber,
        dateOfBirth: profileData.dateOfBirth || null,
      });

      setProfileData({
        fullName: result.user.fullName || result.user.name || '',
        email: result.user.email,
        phoneNumber: result.user.phoneNumber || '',
        dateOfBirth: result.user.dateOfBirth ? new Date(result.user.dateOfBirth).toISOString().split('T')[0] : '',
      });

      showSuccess('Profile updated successfully!');
      setActiveSection(null);
    } catch (error: any) {
      showError(error.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    if (!passwordData.currentPassword) {
      showError('Current password is required');
      return;
    }

    try {
      await userService.updatePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      showSuccess('Password changed successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to update password');
    }
  };

  const renderEditProfile = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Edit Profile</Text>
      
      {isLoadingProfile ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={profileData.fullName}
              onChangeText={(text) => setProfileData({...profileData, fullName: text})}
              placeholder="Enter your full name"
              placeholderTextColor="#666666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, { opacity: 0.6 }]}
              value={profileData.email}
              editable={false}
              keyboardType="email-address"
              placeholderTextColor="#666666"
            />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={profileData.phoneNumber}
              onChangeText={(text) => setProfileData({...profileData, phoneNumber: text})}
              keyboardType="phone-pad"
              placeholder="Enter your phone number"
              placeholderTextColor="#666666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={profileData.dateOfBirth}
              onChangeText={(text) => setProfileData({...profileData, dateOfBirth: text})}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#666666"
            />
          </View>
        </>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Save size={20} color="#FFFFFF" />
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userService.deleteAccount();
      await authService.logout();
      router.replace('/auth');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete account');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderPrivacySecurity = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Privacy & Security</Text>
      
      {/* Password Change Section */}
      <View style={styles.passwordSection}>
        <View style={styles.passwordHeader}>
          <Text style={styles.passwordTitle}>Change Password</Text>
          <TouchableOpacity 
            style={styles.passwordToggleButton}
            onPress={() => setShowPasswordForm(!showPasswordForm)}
          >
            <Lock size={20} color="#6A9FB5" />
            <Text style={styles.passwordToggleText}>
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </Text>
          </TouchableOpacity>
        </View>

        {showPasswordForm && (
          <View style={styles.passwordForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData({...passwordData, currentPassword: text})}
                  secureTextEntry={!showCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#666666"
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeButton}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} color="#6A9FB5" />
                  ) : (
                    <Eye size={20} color="#6A9FB5" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData({...passwordData, newPassword: text})}
                  secureTextEntry={!showNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#666666"
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  {showNewPassword ? (
                    <EyeOff size={20} color="#6A9FB5" />
                  ) : (
                    <Eye size={20} color="#6A9FB5" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData({...passwordData, confirmPassword: text})}
                secureTextEntry
                placeholder="Confirm new password"
                placeholderTextColor="#666666"
              />
            </View>

            <View style={styles.passwordButtonContainer}>
              <TouchableOpacity
                style={styles.passwordSaveButton}
                onPress={handlePasswordChange}
              >
                <Text style={styles.passwordSaveButtonText}>Update Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.passwordCancelButton}
                onPress={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                <Text style={styles.passwordCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Delete Account Section */}
      <View style={styles.deleteAccountSection}>
        <Text style={styles.sectionTitle}>Account Management</Text>
        <View style={styles.deleteAccountCard}>
          <AlertTriangle size={24} color="#DC3545" />
          <View style={styles.deleteAccountContent}>
            <Text style={styles.deleteAccountTitle}>Delete Account</Text>
            <Text style={styles.deleteAccountDescription}>
              Once you delete your account, there is no going back. Please be certain. All your data will be permanently deleted.
            </Text>
            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Text style={styles.deleteAccountButtonText}>Delete My Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AlertTriangle size={24} color="#DC3545" />
              <Text style={styles.modalTitle}>Delete Account</Text>
            </View>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setIsDeleting(false);
                }}
                disabled={isDeleting}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDeleteButton, isDeleting && styles.modalDeleteButtonDisabled]}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.modalDeleteButtonText}>Deleting...</Text>
                  </View>
                ) : (
                  <Text style={styles.modalDeleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderHelpSupport = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Help & Support</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>About Eczema Care</Text>
        <Text style={styles.infoBoxText}>
          Eczema Care is an AI-assisted eczema detection and tracking application designed to help you monitor your skin condition, track symptoms, and manage your eczema journey. Our AI-powered skin analysis provides preliminary assessments, but it is not a substitute for professional medical diagnosis.
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>Medical Disclaimer</Text>
        <Text style={styles.infoBoxText}>
          This application provides AI-based assessments and is not a medical diagnosis tool. Always consult with a qualified healthcare professional, especially a dermatologist, for proper medical advice, diagnosis, and treatment. Do not use this app as a replacement for professional medical care.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.helpItem}
        onPress={() => Linking.openURL('tel:1122')}
      >
        <Text style={styles.helpItemTitle}>Emergency Services</Text>
        <Text style={styles.helpItemSubtitle}>Call 1122 for medical emergencies</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpItem}>
        <Text style={styles.helpItemTitle}>Frequently Asked Questions</Text>
        <Text style={styles.helpItemSubtitle}>Find answers to common questions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpItem}>
        <Text style={styles.helpItemTitle}>Contact Support</Text>
        <Text style={styles.helpItemSubtitle}>Get help from our support team</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpItem}>
        <Text style={styles.helpItemTitle}>Privacy Policy</Text>
        <Text style={styles.helpItemSubtitle}>Read our privacy policy</Text>
      </TouchableOpacity>
    </View>
  );

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: Edit,
      onPress: () => setActiveSection(activeSection === 'edit-profile' ? null : 'edit-profile'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      icon: Shield,
      onPress: () => setActiveSection(activeSection === 'privacy' ? null : 'privacy'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: HelpCircle,
      onPress: () => setActiveSection(activeSection === 'help' ? null : 'help'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.backgroundGradient}
      >
        <AppHeader title="Profile" onMenuPress={openDrawer} />
        <ScrollView showsVerticalScrollIndicator={false}>

          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#6A9FB5', '#C5B4E3']}
                style={styles.avatar}
              >
                <User size={40} color="#FFFFFF" />
              </LinearGradient>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Edit size={16} color="#6A9FB5" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileData.fullName || 'User'}</Text>
              <Text style={styles.profileEmail}>{profileData.email || ''}</Text>
              <Text style={styles.memberSince}>Member since January 2025</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{isLoadingProfile ? '...' : userStats.totalLogs}</Text>
              <Text style={styles.statLabel}>Symptom Logs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{isLoadingProfile ? '...' : userStats.totalScans}</Text>
              <Text style={styles.statLabel}>AI Scans</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{isLoadingProfile ? '...' : userStats.totalReminders}</Text>
              <Text style={styles.statLabel}>Reminders</Text>
            </View>
          </View>

          <View style={styles.menuSection}>
            {menuItems.map((item) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIcon}>
                      <item.icon size={20} color="#6A9FB5" />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <ChevronRight 
                    size={20} 
                    color="#B0B0B0" 
                    style={{
                      transform: [{ rotate: activeSection === item.id ? '90deg' : '0deg' }]
                    }}
                  />
                </TouchableOpacity>
                
                {activeSection === item.id && (
                  <>
                    {item.id === 'edit-profile' && renderEditProfile()}
                    {item.id === 'privacy' && renderPrivacySecurity()}
                    {item.id === 'help' && renderHelpSupport()}
                  </>
                )}
              </View>
            ))}
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#DC3545" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Eczema Care v1.0.0</Text>
            <Text style={styles.footerText}>© 2025 Eczema Care. All rights reserved.</Text>
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
  header: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
  },
  profileSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
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
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#888888',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
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
  statNumber: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: '#6A9FB5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(106, 159, 181, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  sectionContent: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A9FB5',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#6A9FB5',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  helpItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  helpItemTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  helpItemSubtitle: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  infoBox: {
    backgroundColor: 'rgba(106, 159, 181, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 159, 181, 0.3)',
  },
  infoBoxTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    lineHeight: 20,
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DC3545',
    gap: 8,
    shadowColor: '#DC3545',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#DC3545',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#888888',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#888888',
    marginBottom: 4,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#888888',
    marginTop: 4,
  },
  passwordForm: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: 12,
  },
  passwordButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  passwordSaveButton: {
    flex: 1,
    backgroundColor: '#6A9FB5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  passwordSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  passwordCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  passwordCancelButtonText: {
    color: '#B0B0B0',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  passwordSection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
  },
  passwordToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(106, 159, 181, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  passwordToggleText: {
    color: '#6A9FB5',
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
  },
  deleteAccountSection: {
    marginTop: 24,
  },
  deleteAccountCard: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.2)',
    flexDirection: 'row',
    gap: 12,
  },
  deleteAccountContent: {
    flex: 1,
  },
  deleteAccountTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#DC3545',
    marginBottom: 8,
  },
  deleteAccountDescription: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFB3B3',
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteAccountButton: {
    backgroundColor: '#DC3545',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  deleteAccountButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalCancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: '#DC3545',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalDeleteButtonDisabled: {
    opacity: 0.6,
  },
  modalDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
});