import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, 
  FileText, 
  Lightbulb, 
  Bell, 
  Stethoscope, 
  TrendingUp,
  Clock,
  Heart,
  CheckCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

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

  const recentActivity = [
    {
      icon: Camera,
      title: 'Skin scan completed',
      description: 'Mild eczema detected on forearm',
      time: '2 hours ago',
      status: 'success'
    },
    {
      icon: FileText,
      title: 'Symptom logged',
      description: 'Itchiness level: 3/10',
      time: '1 day ago',
      status: 'info'
    },
    {
      icon: Heart,
      title: 'Streak milestone',
      description: '7 days of consistent logging',
      time: '2 days ago',
      status: 'success'
    }
  ];

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
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-5">
              <div className={`p-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-500 bg-opacity-20' : 'bg-[#6A9FB5] bg-opacity-20'
              }`}>
                <activity.icon className={`h-5 w-5 ${
                  activity.status === 'success' ? 'text-green-400' : 'text-[#6A9FB5]'
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
          ))}
        </div>
      </div>

      {/* Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6 text-center">
          <div className="bg-green-500 bg-opacity-20 rounded-full p-3 w-fit mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">7</h3>
          <p className="text-gray-300">Day Streak</p>
        </div>
        
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6 text-center">
          <div className="bg-[#6A9FB5] bg-opacity-20 rounded-full p-3 w-fit mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-[#6A9FB5]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">23%</h3>
          <p className="text-gray-300">Improvement</p>
        </div>
        
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6 text-center">
          <div className="bg-[#C5B4E3] bg-opacity-20 rounded-full p-3 w-fit mx-auto mb-4">
            <FileText className="h-8 w-8 text-[#C5B4E3]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">12</h3>
          <p className="text-gray-300">Logs This Month</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;