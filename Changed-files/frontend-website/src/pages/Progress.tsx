import React, { useState, useEffect, useMemo } from 'react';
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
  Lightbulb,
  Bell
} from 'lucide-react';
import { symptomService, SymptomLog } from '../services/symptomService';
import { reminderService, Reminder } from '../services/reminderService';
import { useToast } from '../context/ToastContext';

const Progress: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReminders, setIsLoadingReminders] = useState(true);
  const { showToast } = useToast();

  // Load logs and reminders on mount
  useEffect(() => {
    loadLogs();
    loadReminders();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const fetchedLogs = await symptomService.getLogs();
      setLogs(fetchedLogs);
    } catch (error: any) {
      showToast(error.message || 'Failed to load logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      setIsLoadingReminders(true);
      const fetchedReminders = await reminderService.getReminders();
      setReminders(fetchedReminders);
    } catch (error: any) {
      console.error('Failed to load reminders:', error);
      // Don't show toast for reminders as it's not critical
    } finally {
      setIsLoadingReminders(false);
    }
  };

  // Filter logs based on selected period
  const filteredLogs = useMemo(() => {
    const days = parseInt(selectedPeriod, 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return logs.filter(log => {
      const logDate = new Date(log.createdAt);
      return logDate >= cutoffDate;
    }).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [logs, selectedPeriod]);

  // Calculate average itchiness
  const averageItchiness = useMemo(() => {
    if (filteredLogs.length === 0) return 0;
    const sum = filteredLogs.reduce((acc, log) => acc + log.itchinessLevel, 0);
    return (sum / filteredLogs.length).toFixed(1);
  }, [filteredLogs]);

  // Format data for itchiness trend chart
  const itchinessData = useMemo(() => {
    return filteredLogs.map(log => ({
      date: new Date(log.createdAt).toISOString().split('T')[0],
      level: log.itchinessLevel,
    }));
  }, [filteredLogs]);

  // Calculate percentage change (comparing first half vs second half of period)
  const itchinessChange = useMemo(() => {
    if (filteredLogs.length < 2) return null;
    
    const midPoint = Math.floor(filteredLogs.length / 2);
    const firstHalf = filteredLogs.slice(0, midPoint);
    const secondHalf = filteredLogs.slice(midPoint);
    
    const firstAvg = firstHalf.reduce((acc, log) => acc + log.itchinessLevel, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, log) => acc + log.itchinessLevel, 0) / secondHalf.length;
    
    if (firstAvg === 0) return null;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    return change.toFixed(0);
  }, [filteredLogs]);

  // Calculate monthly flare-ups from logs
  // A flare-up is defined as a day with itchiness level >= 7 (severe)
  const flareUpData = useMemo(() => {
    // Get logs from last 5 months
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    
    const recentLogs = logs.filter(log => {
      const logDate = new Date(log.createdAt);
      return logDate >= fiveMonthsAgo && log.itchinessLevel >= 7; // Flare-up threshold
    });

    // Group by month
    const monthlyCounts = new Map<string, number>();
    
    recentLogs.forEach(log => {
      const logDate = new Date(log.createdAt);
      const monthKey = logDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) || 0) + 1);
    });

    // Convert to array format and sort by date
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = Array.from(monthlyCounts.entries())
      .map(([monthYear, count]) => {
        const [month, year] = monthYear.split(' ');
        return {
          month,
          monthYear,
          count,
          sortKey: parseInt(year) * 12 + monthNames.indexOf(month)
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(-5) // Last 5 months
      .map(({ month, count }) => ({ month, count }));

    return result.length > 0 ? result : [
      { month: new Date().toLocaleDateString('en-US', { month: 'short' }), count: 0 }
    ];
  }, [logs]);

  // Calculate flare-ups this month
  const flareUpsThisMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return logs.filter(log => {
      const logDate = new Date(log.createdAt);
      return logDate >= startOfMonth && log.itchinessLevel >= 7;
    }).length;
  }, [logs]);

  // Calculate current streak (consecutive days with logs)
  const currentStreak = useMemo(() => {
    if (logs.length === 0) return 0;

    // Sort logs by date (most recent first)
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const log of sortedLogs) {
      const logDate = new Date(log.createdAt);
      logDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === streak) {
        streak++;
        currentDate = new Date(logDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays > streak + 1) {
        break;
      }
    }

    return streak;
  }, [logs]);

  // Calculate total days logged
  const daysLogged = useMemo(() => {
    if (logs.length === 0) return 0;
    
    // Get unique dates
    const uniqueDates = new Set<string>();
    logs.forEach(log => {
      const logDate = new Date(log.createdAt);
      const dateKey = logDate.toISOString().split('T')[0]; // YYYY-MM-DD
      uniqueDates.add(dateKey);
    });
    
    return uniqueDates.size;
  }, [logs]);

  // Calculate days logged percentage (based on selected period)
  const daysLoggedPercentage = useMemo(() => {
    const periodDays = parseInt(selectedPeriod, 10);
    if (periodDays === 0) return 0;
    return Math.round((daysLogged / periodDays) * 100);
  }, [daysLogged, selectedPeriod]);

  // Analyze triggers from logs
  // Parse possibleTriggers field from logs and count occurrences
  const triggerData = useMemo(() => {
    // Common trigger keywords to categorize
    const triggerCategories: { [key: string]: { keywords: string[]; color: string } } = {
      'Stress': { keywords: ['stress', 'anxiety', 'worried', 'tension'], color: '#EF4444' },
      'Weather': { keywords: ['weather', 'dry', 'humid', 'cold', 'hot', 'temperature', 'climate'], color: '#F59E0B' },
      'Diet': { keywords: ['food', 'diet', 'eating', 'meal', 'dairy', 'gluten', 'nuts', 'spicy'], color: '#10B981' },
      'Products': { keywords: ['soap', 'detergent', 'shampoo', 'lotion', 'cream', 'fabric', 'softener', 'product'], color: '#6366F1' },
      'Allergens': { keywords: ['pollen', 'dust', 'dander', 'pet', 'allergen', 'mold'], color: '#8B5CF6' },
      'Other': { keywords: [], color: '#94A3B8' },
    };

    // Count trigger occurrences
    const triggerCounts = new Map<string, number>();
    let totalTriggers = 0;

    filteredLogs.forEach(log => {
      if (log.possibleTriggers && log.possibleTriggers.trim()) {
        // Split by comma, semicolon, or newline
        const triggers = log.possibleTriggers
          .split(/[,;\n]/)
          .map(t => t.trim().toLowerCase())
          .filter(t => t.length > 0);

        triggers.forEach(trigger => {
          // Try to match with categories
          let categorized = false;
          for (const [category, { keywords }] of Object.entries(triggerCategories)) {
            if (category === 'Other') continue;
            
            if (keywords.some(keyword => trigger.includes(keyword) || keyword.includes(trigger))) {
              triggerCounts.set(category, (triggerCounts.get(category) || 0) + 1);
              totalTriggers++;
              categorized = true;
              break;
            }
          }

          // If not categorized, add to "Other"
          if (!categorized) {
            triggerCounts.set('Other', (triggerCounts.get('Other') || 0) + 1);
            totalTriggers++;
          }
        });
      }
    });

    // Convert to array with percentages
    if (totalTriggers === 0) {
      return [];
    }

    const result = Array.from(triggerCounts.entries())
      .map(([name, count]) => ({
        name,
        value: Math.round((count / totalTriggers) * 100),
        count,
        color: triggerCategories[name]?.color || triggerCategories['Other'].color,
      }))
      .sort((a, b) => b.value - a.value) // Sort by percentage descending
      .slice(0, 6); // Top 6 triggers

    return result;
  }, [filteredLogs]);

  // Calculate improvement percentage for achievements
  const improvementPercent = useMemo(() => {
    if (logs.length < 2) return 0;
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const halfIndex = Math.floor(sortedLogs.length / 2);
    const firstHalf = sortedLogs.slice(0, halfIndex);
    const secondHalf = sortedLogs.slice(halfIndex);
    const firstAvg = firstHalf.reduce((sum, log) => sum + log.itchinessLevel, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, log) => sum + log.itchinessLevel, 0) / secondHalf.length;
    if (firstAvg === 0) return 0;
    return Math.round(((firstAvg - secondAvg) / firstAvg) * 100);
  }, [logs]);

  // Calculate unique triggers for achievements
  const uniqueTriggers = useMemo(() => {
    const triggerSet = new Set<string>();
    logs.forEach(log => {
      if (log.possibleTriggers) {
        const triggers = log.possibleTriggers
          .split(/[,;\n]/)
          .map(t => t.trim().toLowerCase())
          .filter(t => t.length > 0);
        triggers.forEach(t => triggerSet.add(t));
      }
    });
    return triggerSet;
  }, [logs]);

  // Calculate achievements dynamically
  const achievements = useMemo(() => {
    // Find date when achievement was earned (most recent log if earned)
    const getEarnedDate = (earned: boolean) => {
      if (!earned || logs.length === 0) return undefined;
      return logs.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]?.createdAt;
    };

    return [
    {
      id: '1',
      title: '7-Day Streak',
      description: 'Logged symptoms for 7 consecutive days',
      icon: Calendar,
      color: 'bg-green-500',
        earned: currentStreak >= 7,
        date: getEarnedDate(currentStreak >= 7),
        progress: currentStreak >= 7 ? 7 : currentStreak
    },
    {
      id: '2',
      title: 'Improvement Master',
      description: 'Reduced average itchiness by 50%',
      icon: TrendingUp,
      color: 'bg-blue-500',
        earned: improvementPercent >= 50,
        date: getEarnedDate(improvementPercent >= 50),
        progress: improvementPercent >= 50 ? 50 : improvementPercent
    },
    {
      id: '3',
      title: 'Consistency Champion',
      description: 'Used app for 30 consecutive days',
      icon: Target,
      color: 'bg-purple-500',
        earned: currentStreak >= 30,
        date: getEarnedDate(currentStreak >= 30),
        progress: currentStreak >= 30 ? 30 : currentStreak
    },
    {
      id: '4',
      title: 'Trigger Detective',
      description: 'Identified 5 different triggers',
      icon: Lightbulb,
      color: 'bg-orange-500',
        earned: uniqueTriggers.size >= 5,
        date: logs.find(log => log.possibleTriggers && uniqueTriggers.size >= 5)?.createdAt,
        progress: uniqueTriggers.size >= 5 ? 5 : uniqueTriggers.size
    }
  ];
  }, [logs, currentStreak, improvementPercent, uniqueTriggers]);

  // Reminder tracking data
  const reminderChartData = useMemo(() => {
    // Group reminders by creation month
    const monthlyCounts = new Map<string, number>();
    const monthlyActive = new Map<string, number>();
    
    reminders.forEach(reminder => {
      if (reminder.createdAt) {
        const date = new Date(reminder.createdAt);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) || 0) + 1);
        if (reminder.isActive) {
          monthlyActive.set(monthKey, (monthlyActive.get(monthKey) || 0) + 1);
        }
      }
    });

    // Get last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthName = monthNames[date.getMonth()];
      
      result.push({
        month: monthName,
        monthKey,
        total: monthlyCounts.get(monthKey) || 0,
        active: monthlyActive.get(monthKey) || 0,
        inactive: (monthlyCounts.get(monthKey) || 0) - (monthlyActive.get(monthKey) || 0)
      });
    }
    
    return result;
  }, [reminders]);

  // Reminder statistics
  const reminderStats = useMemo(() => {
    const total = reminders.length;
    const active = reminders.filter(r => r.isActive).length;
    const byType = {
      medication: reminders.filter(r => r.type === 'medication').length,
      appointment: reminders.filter(r => r.type === 'appointment').length,
      custom: reminders.filter(r => r.type === 'custom').length,
    };
    
    return { total, active, inactive: total - active, byType };
  }, [reminders]);

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
            {itchinessChange !== null && (
              <span className={`text-sm font-medium ${
                parseFloat(itchinessChange) < 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {parseFloat(itchinessChange) < 0 ? '↓' : '↑'} {Math.abs(parseFloat(itchinessChange))}%
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {isLoading ? '...' : averageItchiness || '0.0'}
          </h3>
          <p className="text-gray-300 text-sm">Average Itchiness</p>
          {filteredLogs.length === 0 && !isLoading && (
            <p className="text-xs text-gray-400 mt-1">No data for selected period</p>
          )}
        </div>

        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 bg-opacity-20 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-blue-400 text-sm font-medium">
              {currentStreak > 0 ? `${currentStreak} day${currentStreak !== 1 ? 's' : ''}` : 'No streak'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {isLoading ? '...' : currentStreak}
          </h3>
          <p className="text-gray-300 text-sm">Current Streak</p>
          {currentStreak === 0 && !isLoading && (
            <p className="text-xs text-gray-400 mt-1">Start logging to build your streak!</p>
          )}
        </div>

        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 bg-opacity-20 p-3 rounded-lg">
              <Target className="h-6 w-6 text-purple-400" />
            </div>
            {flareUpsThisMonth > 0 && (
              <span className="text-red-400 text-sm font-medium">↑ {flareUpsThisMonth}</span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {isLoading ? '...' : flareUpsThisMonth}
          </h3>
          <p className="text-gray-300 text-sm">Flare-ups This Month</p>
          <p className="text-xs text-gray-400 mt-1">(Itchiness ≥ 7)</p>
        </div>

        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 bg-opacity-20 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-orange-400" />
            </div>
            <span className="text-orange-400 text-sm font-medium">
              {daysLoggedPercentage}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {isLoading ? '...' : daysLogged}
          </h3>
          <p className="text-gray-300 text-sm">Days Logged</p>
          {filteredLogs.length === 0 && !isLoading && (
            <p className="text-xs text-gray-400 mt-1">No logs for selected period</p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Itchiness Trend */}
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Itchiness Level Trend</h2>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A9FB5]"></div>
            </div>
          ) : itchinessData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 mb-2">No data available</p>
                <p className="text-gray-500 text-sm">Start logging your symptoms to see trends</p>
              </div>
            </div>
          ) : (
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
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                />
                <Line 
                  type="monotone" 
                  dataKey="level" 
                  stroke="#6A9FB5" 
                  strokeWidth={3}
                  dot={{ fill: '#6A9FB5', strokeWidth: 2, r: 4 }}
                    name="Itchiness Level"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>

        {/* Flare-up Frequency */}
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Monthly Flare-ups</h2>
          <p className="text-gray-400 text-sm mb-4">Days with itchiness level ≥ 7 (severe symptoms)</p>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A9FB5]"></div>
            </div>
          ) : flareUpData.length === 0 || flareUpData.every(d => d.count === 0) ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 mb-2">No flare-ups recorded</p>
                <p className="text-gray-500 text-sm">Great job managing your symptoms!</p>
              </div>
            </div>
          ) : (
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
                    allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                    formatter={(value: number) => [`${value} day${value !== 1 ? 's' : ''}`, 'Flare-ups']}
                />
                  <Bar dataKey="count" fill="#C5B4E3" radius={[4, 4, 0, 0]} name="Flare-ups" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>
      </div>

      {/* Trigger Analysis */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Trigger Analysis</h2>
        <p className="text-gray-400 text-sm mb-6">Based on triggers logged in your symptom entries</p>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A9FB5]"></div>
          </div>
        ) : triggerData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 mb-2">No trigger data available</p>
              <p className="text-gray-500 text-sm">Start logging triggers in your symptom entries to see analysis</p>
            </div>
          </div>
        ) : (
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
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
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
                    formatter={(value: number, name: string, props: any) => [
                      `${value}% (${props.payload.count} occurrence${props.payload.count !== 1 ? 's' : ''})`,
                      props.payload.name
                    ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Top Triggers</h3>
            {triggerData.map((trigger, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: trigger.color }}
                  ></div>
                  <span className="text-white font-medium">{trigger.name}</span>
                </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm">({trigger.count}x)</span>
                    <span className="text-gray-300 font-semibold">{trigger.value}%</span>
                  </div>
              </div>
            ))}
              {filteredLogs.length > 0 && triggerData.length === 0 && (
                <p className="text-gray-400 text-sm italic">
                  No triggers logged yet. Add triggers when logging symptoms to see analysis.
                </p>
              )}
            </div>
          </div>
        )}
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
              {!achievement.earned && achievement.progress !== undefined && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>
                      {achievement.id === '1' && `${achievement.progress}/7`}
                      {achievement.id === '2' && `${achievement.progress}%`}
                      {achievement.id === '3' && `${achievement.progress}/30`}
                      {achievement.id === '4' && `${achievement.progress}/5`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-[#6A9FB5] h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(() => {
                          if (achievement.id === '1') return (achievement.progress / 7) * 100;
                          if (achievement.id === '2') return Math.min((achievement.progress / 50) * 100, 100);
                          if (achievement.id === '3') return (achievement.progress / 30) * 100;
                          if (achievement.id === '4') return (achievement.progress / 5) * 100;
                          return 0;
                        })()}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reminder Tracking */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
                <div>
            <h2 className="text-xl font-bold text-white mb-2">Reminder Tracking</h2>
            <p className="text-gray-400 text-sm">Track your reminders over time</p>
          </div>
          <div className="bg-[#6A9FB5] bg-opacity-20 p-3 rounded-lg">
            <Bell className="h-6 w-6 text-[#6A9FB5]" />
          </div>
        </div>

        {/* Reminder Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
            <p className="text-gray-400 text-sm mb-1">Total Reminders</p>
            <p className="text-2xl font-bold text-white">{isLoadingReminders ? '...' : reminderStats.total}</p>
          </div>
          <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
            <p className="text-gray-400 text-sm mb-1">Active</p>
            <p className="text-2xl font-bold text-green-400">{isLoadingReminders ? '...' : reminderStats.active}</p>
          </div>
          <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
            <p className="text-gray-400 text-sm mb-1">Inactive</p>
            <p className="text-2xl font-bold text-gray-400">{isLoadingReminders ? '...' : reminderStats.inactive}</p>
          </div>
          <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
            <p className="text-gray-400 text-sm mb-1">By Type</p>
            <p className="text-sm text-white">
              Med: {reminderStats.byType.medication} | Appt: {reminderStats.byType.appointment} | Custom: {reminderStats.byType.custom}
            </p>
          </div>
        </div>

        {/* Reminder Chart */}
        {isLoadingReminders ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A9FB5]"></div>
          </div>
        ) : reminderChartData.length === 0 || reminderChartData.every(d => d.total === 0) ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No reminders created yet</p>
              <p className="text-gray-500 text-sm">Create reminders to track them here</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reminderChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#D1D5DB', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#D1D5DB', fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} reminder${value !== 1 ? 's' : ''}`,
                    name === 'active' ? 'Active' : name === 'inactive' ? 'Inactive' : 'Total'
                  ]}
                />
                <Bar dataKey="active" stackId="a" fill="#10B981" name="active" radius={[0, 0, 0, 0]} />
                <Bar dataKey="inactive" stackId="a" fill="#6B7280" name="inactive" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-sm text-gray-300">Active</span>
                </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-500"></div>
                <span className="text-sm text-gray-300">Inactive</span>
              </div>
            </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Progress;