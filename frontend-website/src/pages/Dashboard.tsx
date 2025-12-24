import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService, DashboardStats, RecentActivity } from '../services/dashboardService';
import { 
  Camera, 
  FileText, 
  Lightbulb, 
  Bell, 
  Stethoscope, 
  TrendingUp,
  Clock,
  Heart,
  CheckCircle,
  Loader,
  AlertCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardStats, activities] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(),
      ]);
      setStats(dashboardStats);
      setRecentActivity(activities);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'AI Skin Scan',
      description: 'Upload a photo for instant analysis',
      icon: Camera,
      link: '/upload',
      color: 'from-[#6A9FB5] to-[#5A8FA5]'
    },
    {
      title: 'Log Symptoms',
      description: 'Track your daily skin condition',
      icon: FileText,
      link: '/log',
      color: 'from-[#C5B4E3] to-[#B5A4D3]'
    },
    {
      title: 'Skincare Tips',
      description: 'Discover personalized advice',
      icon: Lightbulb,
      link: '/tips',
      color: 'from-[#F59E0B] to-[#D97706]'
    },
    {
      title: 'Set Reminders',
      description: 'Never miss your skincare routine',
      icon: Bell,
      link: '/reminders',
      color: 'from-[#10B981] to-[#059669]'
    },
    {
      title: 'Consult Doctor',
      description: 'Book a professional consultation',
      icon: Stethoscope,
      link: '/consult',
      color: 'from-[#EF4444] to-[#DC2626]'
    },
    {
      title: 'View Progress',
      description: 'Track your improvement journey',
      icon: TrendingUp,
      link: '/progress',
      color: 'from-[#8B5CF6] to-[#7C3AED]'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'scan': return Camera;
      case 'log': return FileText;
      case 'reminder': return Bell;
      case 'consultation': return Stethoscope;
      default: return Heart;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-[#6A9FB5] mx-auto mb-4" />
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-300 text-lg">
              Ready to take care of your skin today?
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-[#6A9FB5] bg-opacity-20 rounded-full p-4">
              <Heart className="h-12 w-12 text-[#6A9FB5]" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-300">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="ml-auto text-red-400 hover:text-red-300 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="group bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6 hover:bg-opacity-10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className={`bg-gradient-to-r ${action.color} rounded-full p-3 w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {action.title}
            </h3>
            <p className="text-gray-300">
              {action.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No recent activity yet</p>
              <p className="text-gray-500 text-sm mt-2">Start by uploading a skin scan or logging your symptoms</p>
            </div>
          ) : (
            recentActivity.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-5">
                  <div className={`p-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500 bg-opacity-20' : 
                    activity.status === 'warning' ? 'bg-yellow-500 bg-opacity-20' :
                    'bg-[#6A9FB5] bg-opacity-20'
                  }`}>
                    <ActivityIcon className={`h-5 w-5 ${
                      activity.status === 'success' ? 'text-green-400' : 
                      activity.status === 'warning' ? 'text-yellow-400' :
                      'text-[#6A9FB5]'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{activity.title}</h3>
                    <p className="text-gray-300 text-sm">{activity.description}</p>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {activity.time}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6 text-center">
          <div className="bg-green-500 bg-opacity-20 rounded-full p-3 w-fit mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.dayStreak || 0}</h3>
          <p className="text-gray-300">Day Streak</p>
        </div>
        
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6 text-center">
          <div className="bg-[#6A9FB5] bg-opacity-20 rounded-full p-3 w-fit mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-[#6A9FB5]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.improvementPercent || 0}%</h3>
          <p className="text-gray-300">Improvement</p>
        </div>
        
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6 text-center">
          <div className="bg-[#C5B4E3] bg-opacity-20 rounded-full p-3 w-fit mx-auto mb-4">
            <FileText className="h-8 w-8 text-[#C5B4E3]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.logsThisMonth || 0}</h3>
          <p className="text-gray-300">Logs This Month</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Your Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white bg-opacity-5 rounded-lg">
            <Camera className="h-8 w-8 text-[#6A9FB5] mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.totalScans || 0}</p>
            <p className="text-gray-400 text-sm">Total Scans</p>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-5 rounded-lg">
            <FileText className="h-8 w-8 text-[#C5B4E3] mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.totalLogs || 0}</p>
            <p className="text-gray-400 text-sm">Symptom Logs</p>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-5 rounded-lg">
            <Bell className="h-8 w-8 text-[#10B981] mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.totalReminders || 0}</p>
            <p className="text-gray-400 text-sm">Reminders</p>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-5 rounded-lg">
            <Stethoscope className="h-8 w-8 text-[#EF4444] mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.totalConsultations || 0}</p>
            <p className="text-gray-400 text-sm">Consultations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
