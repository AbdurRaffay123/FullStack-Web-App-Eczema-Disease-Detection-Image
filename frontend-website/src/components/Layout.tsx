import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationsPanel from './NotificationsPanel';
import { 
  Home, 
  Camera, 
  FileText, 
  Lightbulb, 
  Bell, 
  Stethoscope, 
  TrendingUp, 
  User,
  LogOut,
  Heart
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Get notifications and unread count from global context
  const { unreadCount } = useNotifications();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/upload', icon: Camera, label: 'AI Scan' },
    { path: '/log', icon: FileText, label: 'Logs' },
    { path: '/tips', icon: Lightbulb, label: 'Tips' },
    { path: '/reminders', icon: Bell, label: 'Reminders' },
    { path: '/consult', icon: Stethoscope, label: 'Consult' },
    { path: '/progress', icon: TrendingUp, label: 'Progress' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-black bg-opacity-20 backdrop-blur-lg border-r border-white border-opacity-10">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <Heart className="h-8 w-8 text-[#6A9FB5]" />
            <h1 className="text-xl font-bold text-white">EczemaCare</h1>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white hover:bg-opacity-10 ${
                    isActive ? 'bg-[#6A9FB5] bg-opacity-20 text-[#6A9FB5]' : 'text-gray-300'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-64 p-6 border-t border-white border-opacity-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <LogOut className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 relative">
          {/* Notifications Bell */}
          {user && (
            <div className="fixed top-4 right-4 z-40">
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-3 bg-[#6A9FB5] hover:bg-[#5A8FA5] rounded-full transition-all shadow-lg"
              >
                <Bell className="h-6 w-6 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          )}
          
          {children}
        </div>
      </div>

      {/* Notifications Panel */}
      {user && (
        <NotificationsPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default Layout;