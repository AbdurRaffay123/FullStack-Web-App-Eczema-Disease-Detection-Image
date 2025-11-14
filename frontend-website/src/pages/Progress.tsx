import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Award, 
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
  Lightbulb
} from 'lucide-react';

const Progress: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  // Mock data for charts
  const itchinessData = [
    { date: '2024-01-01', level: 7 },
    { date: '2024-01-03', level: 6 },
    { date: '2024-01-05', level: 5 },
    { date: '2024-01-07', level: 4 },
    { date: '2024-01-09', level: 6 },
    { date: '2024-01-11', level: 3 },
    { date: '2024-01-13', level: 2 },
    { date: '2024-01-15', level: 4 },
  ];

  const flareUpData = [
    { month: 'Sep', count: 8 },
    { month: 'Oct', count: 6 },
    { month: 'Nov', count: 4 },
    { month: 'Dec', count: 3 },
    { month: 'Jan', count: 2 },
  ];

  const triggerData = [
    { name: 'Stress', value: 35, color: '#EF4444' },
    { name: 'Weather', value: 25, color: '#F59E0B' },
    { name: 'Diet', value: 20, color: '#10B981' },
    { name: 'Products', value: 15, color: '#6366F1' },
    { name: 'Other', value: 5, color: '#8B5CF6' },
  ];

  const achievements = [
    {
      id: '1',
      title: '7-Day Streak',
      description: 'Logged symptoms for 7 consecutive days',
      icon: Calendar,
      color: 'bg-green-500',
      earned: true,
      date: '2024-01-15'
    },
    {
      id: '2',
      title: 'Improvement Master',
      description: 'Reduced average itchiness by 50%',
      icon: TrendingUp,
      color: 'bg-blue-500',
      earned: true,
      date: '2024-01-10'
    },
    {
      id: '3',
      title: 'Consistency Champion',
      description: 'Used app for 30 consecutive days',
      icon: Target,
      color: 'bg-purple-500',
      earned: false,
      progress: 23
    },
    {
      id: '4',
      title: 'Trigger Detective',
      description: 'Identified 5 different triggers',
      icon: Lightbulb,
      color: 'bg-orange-500',
      earned: true,
      date: '2024-01-08'
    }
  ];

  const insights = [
    {
      type: 'positive',
      title: 'Great Progress!',
      description: 'Your average itchiness level has decreased by 23% this month.',
      icon: TrendingUp
    },
    {
      type: 'warning',
      title: 'Pattern Detected',
      description: 'Stress seems to be your main trigger. Consider stress management techniques.',
      icon: AlertCircle
    },
    {
      type: 'info',
      title: 'Routine Reminder',
      description: 'You\'ve missed logging symptoms for 2 days. Consistency helps track progress.',
      icon: Clock
    }
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-500 bg-opacity-10 border-green-500 border-opacity-20 text-green-300';
      case 'warning':
        return 'bg-yellow-500 bg-opacity-10 border-yellow-500 border-opacity-20 text-yellow-300';
      case 'info':
        return 'bg-blue-500 bg-opacity-10 border-blue-500 border-opacity-20 text-blue-300';
      default:
        return 'bg-gray-500 bg-opacity-10 border-gray-500 border-opacity-20 text-gray-300';
    }
  };

  const getInsightIconColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-4">Progress Tracking</h1>
          <p className="text-gray-300 text-lg">
            Monitor your eczema management journey
          </p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
        >
          <option value="7" className="bg-gray-800">Last 7 days</option>
          <option value="30" className="bg-gray-800">Last 30 days</option>
          <option value="90" className="bg-gray-800">Last 3 months</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 bg-opacity-20 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <span className="text-green-400 text-sm font-medium">↓ 23%</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">3.2</h3>
          <p className="text-gray-300 text-sm">Average Itchiness</p>
        </div>

        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 bg-opacity-20 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-blue-400 text-sm font-medium">7 days</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">23</h3>
          <p className="text-gray-300 text-sm">Current Streak</p>
        </div>

        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 bg-opacity-20 p-3 rounded-lg">
              <Target className="h-6 w-6 text-purple-400" />
            </div>
            <span className="text-red-400 text-sm font-medium">↑ 2</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">2</h3>
          <p className="text-gray-300 text-sm">Flare-ups This Month</p>
        </div>

        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 bg-opacity-20 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-orange-400" />
            </div>
            <span className="text-orange-400 text-sm font-medium">92%</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">28</h3>
          <p className="text-gray-300 text-sm">Days Logged</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Itchiness Trend */}
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Itchiness Level Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={itchinessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#D1D5DB', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fill: '#D1D5DB', fontSize: 12 }}
                  domain={[0, 10]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="level" 
                  stroke="#6A9FB5" 
                  strokeWidth={3}
                  dot={{ fill: '#6A9FB5', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flare-up Frequency */}
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Monthly Flare-ups</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flareUpData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#D1D5DB', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#D1D5DB', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#C5B4E3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trigger Analysis */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Trigger Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={triggerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {triggerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {triggerData.map((trigger, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: trigger.color }}
                  ></div>
                  <span className="text-white font-medium">{trigger.name}</span>
                </div>
                <span className="text-gray-300">{trigger.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-all ${
                achievement.earned 
                  ? 'bg-white bg-opacity-10 border-white border-opacity-20' 
                  : 'bg-white bg-opacity-5 border-white border-opacity-10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${achievement.color} bg-opacity-20 p-2 rounded-lg`}>
                  <achievement.icon className={`h-5 w-5 ${achievement.earned ? 'text-white' : 'text-gray-400'}`} />
                </div>
                {achievement.earned && (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                )}
              </div>
              <h3 className={`font-semibold mb-1 ${achievement.earned ? 'text-white' : 'text-gray-400'}`}>
                {achievement.title}
              </h3>
              <p className={`text-sm ${achievement.earned ? 'text-gray-300' : 'text-gray-500'}`}>
                {achievement.description}
              </p>
              {achievement.earned && achievement.date && (
                <p className="text-xs text-gray-400 mt-2">
                  Earned on {new Date(achievement.date).toLocaleDateString()}
                </p>
              )}
              {!achievement.earned && achievement.progress && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress}/30</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-[#6A9FB5] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(achievement.progress / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Personalized Insights</h2>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <insight.icon className={`h-5 w-5 mt-0.5 ${getInsightIconColor(insight.type)}`} />
                <div>
                  <h3 className="font-semibold mb-1">{insight.title}</h3>
                  <p className="text-sm opacity-90">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Progress;