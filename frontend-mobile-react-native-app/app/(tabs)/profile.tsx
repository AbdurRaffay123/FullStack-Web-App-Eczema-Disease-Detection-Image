import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, CircleHelp as HelpCircle, LogOut, CreditCard as Edit, Shield, ChevronRight, Save, Mail, Phone, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

export default function ProfileScreen() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    name: 'Junaid Sidhu',
    email: 'junaidsidhu135@gmail.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-01-15',
  });
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: false,
    reminderNotifications: true,
    weeklyReports: true,
  });
  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    analytics: true,
    locationTracking: false,
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => router.replace('/auth')
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
            router.replace('/auth');
          }
        }
      ]
    );
  };

  const saveProfile = () => {
    Alert.alert('Success', 'Profile updated successfully!');
    setActiveSection(null);
  };

  const renderEditProfile = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Edit Profile</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.name}
          onChangeText={(text) => setProfileData({...profileData, name: text})}
          placeholderTextColor="#666666"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={profileData.email}
          onChangeText={(text) => setProfileData({...profileData, email: text})}
          keyboardType="email-address"
          placeholderTextColor="#666666"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone</Text>
        <TextInput
          style={styles.input}
          value={profileData.phone}
          onChangeText={(text) => setProfileData({...profileData, phone: text})}
          keyboardType="phone-pad"
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

      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Save size={20} color="#FFFFFF" />
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotifications = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Notification Settings</Text>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Push Notifications</Text>
        <Switch
          value={notifications.pushNotifications}
          onValueChange={(value) => setNotifications({...notifications, pushNotifications: value})}
          trackColor={{ false: '#444444', true: '#6A9FB5' }}
          thumbColor={notifications.pushNotifications ? '#FFFFFF' : '#CCCCCC'}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Email Notifications</Text>
        <Switch
          value={notifications.emailNotifications}
          onValueChange={(value) => setNotifications({...notifications, emailNotifications: value})}
          trackColor={{ false: '#444444', true: '#6A9FB5' }}
          thumbColor={notifications.emailNotifications ? '#FFFFFF' : '#CCCCCC'}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Reminder Notifications</Text>
        <Switch
          value={notifications.reminderNotifications}
          onValueChange={(value) => setNotifications({...notifications, reminderNotifications: value})}
          trackColor={{ false: '#444444', true: '#6A9FB5' }}
          thumbColor={notifications.reminderNotifications ? '#FFFFFF' : '#CCCCCC'}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Weekly Reports</Text>
        <Switch
          value={notifications.weeklyReports}
          onValueChange={(value) => setNotifications({...notifications, weeklyReports: value})}
          trackColor={{ false: '#444444', true: '#6A9FB5' }}
          thumbColor={notifications.weeklyReports ? '#FFFFFF' : '#CCCCCC'}
        />
      </View>
    </View>
  );

  const renderPrivacySecurity = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Privacy & Security</Text>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Data Sharing</Text>
        <Switch
          value={privacy.dataSharing}
          onValueChange={(value) => setPrivacy({...privacy, dataSharing: value})}
          trackColor={{ false: '#444444', true: '#6A9FB5' }}
          thumbColor={privacy.dataSharing ? '#FFFFFF' : '#CCCCCC'}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Analytics</Text>
        <Switch
          value={privacy.analytics}
          onValueChange={(value) => setPrivacy({...privacy, analytics: value})}
          trackColor={{ false: '#444444', true: '#6A9FB5' }}
          thumbColor={privacy.analytics ? '#FFFFFF' : '#CCCCCC'}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Location Tracking</Text>
        <Switch
          value={privacy.locationTracking}
          onValueChange={(value) => setPrivacy({...privacy, locationTracking: value})}
          trackColor={{ false: '#444444', true: '#6A9FB5' }}
          thumbColor={privacy.locationTracking ? '#FFFFFF' : '#CCCCCC'}
        />
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Two-Factor Authentication</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHelpSupport = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Help & Support</Text>
      
      <TouchableOpacity style={styles.helpItem}>
        <Text style={styles.helpItemTitle}>Frequently Asked Questions</Text>
        <Text style={styles.helpItemSubtitle}>Find answers to common questions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpItem}>
        <Text style={styles.helpItemTitle}>Contact Support</Text>
        <Text style={styles.helpItemSubtitle}>Get help from our support team</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpItem}>
        <Text style={styles.helpItemTitle}>Report a Bug</Text>
        <Text style={styles.helpItemSubtitle}>Help us improve the app</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpItem}>
        <Text style={styles.helpItemTitle}>Privacy Policy</Text>
        <Text style={styles.helpItemSubtitle}>Read our privacy policy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpItem}>
        <Text style={styles.helpItemTitle}>Terms of Service</Text>
        <Text style={styles.helpItemSubtitle}>View terms and conditions</Text>
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
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      icon: Bell,
      onPress: () => setActiveSection(activeSection === 'notifications' ? null : 'notifications'),
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </View>

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
              <Text style={styles.profileName}>Junaid Sidhu</Text>
              <Text style={styles.profileEmail}>junaidsidhu135@gmail.com</Text>
              <Text style={styles.memberSince}>Member since January 2025</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Symptom Logs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>AI Scans</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Tips Read</Text>
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
                    {item.id === 'notifications' && renderNotifications()}
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
});