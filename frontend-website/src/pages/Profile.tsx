import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Bell, 
  Shield, 
  HelpCircle, 
  Edit,
  Save,
  X,
  Settings,
  Lock,
  Eye,
  EyeOff,
  FileText,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    emergencyContact: '+1 (555) 987-6543'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailReminders: true,
    weeklyReports: false,
    appointmentReminders: true,
    medicationReminders: true
  });

  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    anonymousAnalytics: true,
    marketingEmails: false,
    twoFactorAuth: false
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  const handleProfileSave = () => {
    // Simulate API call
    setTimeout(() => {
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    }, 500);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      showToast('Password changed successfully!', 'success');
    }, 500);
  };

  const handleNotificationSave = () => {
    showToast('Notification preferences saved!', 'success');
  };

  const handlePrivacySave = () => {
    showToast('Privacy settings updated!', 'success');
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Profile Information</h2>
        <button
          onClick={() => isEditing ? handleProfileSave() : setIsEditing(true)}
          className="flex items-center space-x-2 bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              disabled={!isEditing}
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!isEditing}
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date of Birth
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={profileData.dateOfBirth}
              onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              disabled={!isEditing}
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] disabled:opacity-60"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Emergency Contact
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              value={profileData.emergencyContact}
              onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
              disabled={!isEditing}
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex space-x-4">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        </div>
      )}

      {/* Password Change Section */}
      <div className="border-t border-white border-opacity-10 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Password & Security</h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center space-x-2 bg-[#C5B4E3] hover:bg-[#B5A4D3] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <Lock className="h-4 w-4" />
            <span>Change Password</span>
          </button>
        </div>

        {showPasswordForm && (
          <div className="bg-white bg-opacity-5 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handlePasswordChange}
                className="bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
              >
                Update Password
              </button>
              <button
                onClick={() => setShowPasswordForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
        <button
          onClick={handleNotificationSave}
          className="flex items-center space-x-2 bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <Save className="h-4 w-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10">
            <div>
              <h3 className="text-white font-medium">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h3>
              <p className="text-gray-300 text-sm">
                {key === 'pushNotifications' && 'Receive push notifications on your device'}
                {key === 'emailReminders' && 'Get email reminders for your skincare routine'}
                {key === 'weeklyReports' && 'Receive weekly progress reports via email'}
                {key === 'appointmentReminders' && 'Get notified about upcoming appointments'}
                {key === 'medicationReminders' && 'Receive medication and treatment reminders'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6A9FB5] peer-focus:ring-opacity-25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6A9FB5]"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Privacy & Security</h2>
        <button
          onClick={handlePrivacySave}
          className="flex items-center space-x-2 bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(privacy).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10">
            <div>
              <h3 className="text-white font-medium">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h3>
              <p className="text-gray-300 text-sm">
                {key === 'dataSharing' && 'Allow sharing of anonymized data for research purposes'}
                {key === 'anonymousAnalytics' && 'Help improve the app with anonymous usage analytics'}
                {key === 'marketingEmails' && 'Receive promotional emails and product updates'}
                {key === 'twoFactorAuth' && 'Enable two-factor authentication for enhanced security'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setPrivacy(prev => ({ ...prev, [key]: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6A9FB5] peer-focus:ring-opacity-25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6A9FB5]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="border-t border-white border-opacity-10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 hover:bg-opacity-10 transition-all">
            <FileText className="h-5 w-5 text-[#6A9FB5]" />
            <div className="text-left">
              <h4 className="text-white font-medium">Export Data</h4>
              <p className="text-gray-300 text-sm">Download all your data</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-red-500 bg-opacity-10 rounded-lg border border-red-500 border-opacity-20 hover:bg-opacity-20 transition-all">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="text-left">
              <h4 className="text-red-300 font-medium">Delete Account</h4>
              <p className="text-red-200 text-sm">Permanently delete your account</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSupportTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Help & Support</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Get Help</h3>
          
          <button className="w-full flex items-center space-x-3 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 hover:bg-opacity-10 transition-all text-left">
            <HelpCircle className="h-5 w-5 text-[#6A9FB5]" />
            <div>
              <h4 className="text-white font-medium">FAQ</h4>
              <p className="text-gray-300 text-sm">Find answers to common questions</p>
            </div>
          </button>
          
          <button className="w-full flex items-center space-x-3 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 hover:bg-opacity-10 transition-all text-left">
            <MessageSquare className="h-5 w-5 text-[#6A9FB5]" />
            <div>
              <h4 className="text-white font-medium">Contact Support</h4>
              <p className="text-gray-300 text-sm">Get help from our support team</p>
            </div>
          </button>
          
          <button className="w-full flex items-center space-x-3 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 hover:bg-opacity-10 transition-all text-left">
            <AlertTriangle className="h-5 w-5 text-[#6A9FB5]" />
            <div>
              <h4 className="text-white font-medium">Report Issue</h4>
              <p className="text-gray-300 text-sm">Report a bug or technical problem</p>
            </div>
          </button>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Legal</h3>
          
          <button className="w-full flex items-center space-x-3 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 hover:bg-opacity-10 transition-all text-left">
            <FileText className="h-5 w-5 text-[#6A9FB5]" />
            <div>
              <h4 className="text-white font-medium">Terms of Service</h4>
              <p className="text-gray-300 text-sm">Read our terms and conditions</p>
            </div>
          </button>
          
          <button className="w-full flex items-center space-x-3 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 hover:bg-opacity-10 transition-all text-left">
            <Shield className="h-5 w-5 text-[#6A9FB5]" />
            <div>
              <h4 className="text-white font-medium">Privacy Policy</h4>
              <p className="text-gray-300 text-sm">Learn how we protect your data</p>
            </div>
          </button>
        </div>
      </div>
      
      <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
        <h3 className="text-lg font-semibold text-white mb-4">App Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-300">Version</p>
            <p className="text-white font-medium">1.0.0</p>
          </div>
          <div>
            <p className="text-gray-300">Last Updated</p>
            <p className="text-white font-medium">January 15, 2024</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-4">Profile Settings</h1>
          <p className="text-gray-300 text-lg">
            Manage your account and preferences
          </p>
        </div>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-2">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#6A9FB5] text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-8">
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'privacy' && renderPrivacyTab()}
        {activeTab === 'support' && renderSupportTab()}
      </div>
    </div>
  );
};

export default Profile;