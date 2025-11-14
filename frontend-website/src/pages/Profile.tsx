import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Removed: notifications, dataSharing, anonymousAnalytics, marketingEmails, twoFactorAuth

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profile = await userService.getProfile();
        setProfileData({
          fullName: profile.fullName || profile.name || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || '',
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
        });
      } catch (error: any) {
        showToast(error.message || 'Failed to load profile', 'error');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileSave = async () => {
    try {
      const updatedProfile = await userService.updateProfile({
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber,
        dateOfBirth: profileData.dateOfBirth || null,
      });

      setProfileData({
        fullName: updatedProfile.fullName || updatedProfile.name || '',
        email: updatedProfile.email,
        phoneNumber: updatedProfile.phoneNumber || '',
        dateOfBirth: updatedProfile.dateOfBirth ? new Date(updatedProfile.dateOfBirth).toISOString().split('T')[0] : '',
      });

      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (!passwordData.currentPassword) {
      showToast('Current password is required', 'error');
      return;
    }

    try {
      await userService.updatePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      showToast('Password changed successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update password', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userService.deleteAccount();
      showToast('Account deleted successfully', 'success');
      logout();
      // Redirect to login page
      window.location.href = '/login';
    } catch (error: any) {
      showToast(error.message || 'Failed to delete account', 'error');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
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

      {isLoadingProfile ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A9FB5]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] disabled:opacity-60"
                placeholder="Enter your full name"
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
                disabled
                className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 opacity-60 cursor-not-allowed"
              />
            </div>
            <p className="text-gray-400 text-xs mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={profileData.phoneNumber}
                onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] disabled:opacity-60"
                placeholder="Enter your phone number"
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
        </div>
      )}

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
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Privacy & Security</h2>
      </div>

      {/* Password Change Section */}
      <div className="border-b border-white border-opacity-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Change Password</h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center space-x-2 bg-[#C5B4E3] hover:bg-[#B5A4D3] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <Lock className="h-4 w-4" />
            <span>{showPasswordForm ? 'Cancel' : 'Change Password'}</span>
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
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Section */}
      <div className="border-t border-white border-opacity-10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Management</h3>
        <div className="bg-red-500 bg-opacity-10 rounded-lg border border-red-500 border-opacity-20 p-6">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-red-300 font-semibold mb-2">Delete Account</h4>
              <p className="text-red-200 text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain. All your data will be permanently deleted.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A2E] border border-white border-opacity-20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <h3 className="text-xl font-bold text-white">Delete Account</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setIsDeleting(false);
                }}
                disabled={isDeleting}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
        {activeTab === 'privacy' && renderPrivacyTab()}
        {activeTab === 'support' && renderSupportTab()}
      </div>
    </div>
  );
};

export default Profile;