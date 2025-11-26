import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Bell, BarChart3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useMemo } from 'react';
import { symptomService, SymptomLog } from '@/services/symptomService';
import { reminderService, Reminder } from '@/services/reminderService';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReminders, setIsLoadingReminders] = useState(true);

  const periods = [
    { id: '7', name: '7 Days' },
    { id: '30', name: '30 Days' },
    { id: '90', name: '3 Months' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadLogs(), loadReminders()]);
  };

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const result = await symptomService.getLogs();
      setLogs(result.logs);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load symptom logs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      setIsLoadingReminders(true);
      const result = await reminderService.getReminders();
      setReminders(result.reminders);
    } catch (error: any) {
      console.error('Failed to load reminders:', error);
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
    if (filteredLogs.length === 0) return '0.0';
    const sum = filteredLogs.reduce((acc, log) => acc + log.itchinessLevel, 0);
    return (sum / filteredLogs.length).toFixed(1);
  }, [filteredLogs]);

  // Calculate itchiness change
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

  // Itchiness Level Trend Data
  const itchinessData = useMemo(() => {
    return filteredLogs.map(log => ({
      date: new Date(log.createdAt).toISOString().split('T')[0],
      level: log.itchinessLevel,
    }));
  }, [filteredLogs]);

  // Monthly Flare-ups Data (last 5 months)
  const flareUpData = useMemo(() => {
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 4);

    const recentLogs = logs.filter(log => {
      const logDate = new Date(log.createdAt);
      return logDate >= fiveMonthsAgo && log.itchinessLevel >= 7;
    });

    const monthlyCounts = new Map<string, number>();
    recentLogs.forEach(log => {
      const logDate = new Date(log.createdAt);
      const monthKey = logDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) || 0) + 1);
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastFiveMonths = [];
    
    for (let i = 0; i < 5; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentYear - (currentMonth < i ? 1 : 0);
      lastFiveMonths.unshift({
        month: `${monthNames[monthIndex]} ${year}`,
        shortMonth: monthNames[monthIndex],
        year: year,
        count: 0
      });
    }

    return lastFiveMonths.map(m => ({
      month: m.shortMonth,
      count: monthlyCounts.get(`${m.shortMonth} ${m.year}`) || 0
    }));
  }, [logs]);

  const currentMonthFlareUps = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return logs.filter(log => {
      const logDate = new Date(log.createdAt);
      return logDate.getMonth() === currentMonth && 
             logDate.getFullYear() === currentYear && 
             log.itchinessLevel >= 7;
    }).length;
  }, [logs]);

  // Trigger Analysis Data
  const triggerData = useMemo(() => {
    const triggerCounts: { [key: string]: number } = {};
    filteredLogs.forEach(log => {
      if (log.possibleTriggers) {
        const triggers = log.possibleTriggers.split(',').map(t => t.trim()).filter(t => t);
        triggers.forEach(trigger => {
          triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });
      }
    });

    const totalTriggers = Object.values(triggerCounts).reduce((sum, count) => sum + count, 0);
    if (totalTriggers === 0) return [];

    return Object.entries(triggerCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 6)
      .map(([name, count]) => ({
        name,
        count,
        percentage: parseFloat(((count / totalTriggers) * 100).toFixed(1)),
      }));
  }, [filteredLogs]);

  // Reminder Tracking Data
  const reminderChartData = useMemo(() => {
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

  const renderItchinessChart = () => {
    if (itchinessData.length === 0) return null;
    
    const maxLevel = Math.max(...itchinessData.map(d => d.level), 1);
    const chartHeight = 150;
    const barWidth = (width - 80) / Math.min(itchinessData.length, 7);
    const displayData = itchinessData.slice(-7); // Show last 7 data points

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Itchiness Level Trend</Text>
        <View style={[styles.chart, { height: chartHeight }]}>
          {displayData.map((data, index) => {
            const date = new Date(data.date);
            const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <View key={index} style={[styles.chartBarContainer, { width: barWidth }]}>
                <View style={styles.chartBars}>
                  <View 
                    style={[
                      styles.chartBar,
                      { 
                        height: (data.level / maxLevel) * chartHeight,
                        backgroundColor: data.level >= 7 ? '#DC3545' : data.level >= 4 ? '#FFA500' : '#28A745',
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.chartDayLabel}>{dayLabel}</Text>
                <Text style={styles.chartValueLabel}>{data.level}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderFlareUpChart = () => {
    if (flareUpData.length === 0) return null;
    
    const maxCount = Math.max(...flareUpData.map(d => d.count), 1);
    const chartHeight = 120;
    const barWidth = (width - 80) / flareUpData.length;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Flare-ups</Text>
        <View style={[styles.chart, { height: chartHeight }]}>
          {flareUpData.map((data, index) => (
            <View key={index} style={[styles.chartBarContainer, { width: barWidth }]}>
              <View style={styles.chartBars}>
                <View 
                  style={[
                    styles.chartBar,
                    { 
                      height: (data.count / maxCount) * chartHeight,
                      backgroundColor: '#C5B4E3',
                    }
                  ]} 
                />
              </View>
              <Text style={styles.chartDayLabel}>{data.month}</Text>
              <Text style={styles.chartValueLabel}>{data.count}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderReminderChart = () => {
    if (reminderChartData.length === 0) return null;
    
    const maxCount = Math.max(...reminderChartData.map(d => d.total), 1);
    const chartHeight = 120;
    const barWidth = (width - 80) / reminderChartData.length;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Reminder Tracking</Text>
        <View style={[styles.chart, { height: chartHeight }]}>
          {reminderChartData.map((data, index) => (
            <View key={index} style={[styles.chartBarContainer, { width: barWidth }]}>
              <View style={styles.chartBars}>
                <View 
                  style={[
                    styles.chartBar,
                    { 
                      height: (data.inactive / maxCount) * chartHeight,
                      backgroundColor: '#6B7280',
                      marginBottom: 2,
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.chartBar,
                    { 
                      height: (data.active / maxCount) * chartHeight,
                      backgroundColor: '#10B981',
                    }
                  ]} 
                />
              </View>
              <Text style={styles.chartDayLabel}>{data.month}</Text>
              <Text style={styles.chartValueLabel}>{data.total}</Text>
            </View>
          ))}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Active</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#6B7280' }]} />
            <Text style={styles.legendText}>Inactive</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.backgroundGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Progress Tracking</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.periodSelector}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.periodContent}
            >
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.id}
                  style={[
                    styles.periodChip,
                    selectedPeriod === period.id && styles.periodChipSelected
                  ]}
                  onPress={() => setSelectedPeriod(period.id)}
                >
                  <Text style={[
                    styles.periodText,
                    selectedPeriod === period.id && styles.periodTextSelected
                  ]}>
                    {period.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Key Metrics */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <TrendingUp size={20} color="#28A745" />
                <Text style={styles.statTitle}>Avg. Itchiness</Text>
              </View>
              <Text style={styles.statValue}>
                {isLoading ? '...' : averageItchiness}
              </Text>
              {itchinessChange !== null && (
                <Text style={[
                  styles.statChange,
                  parseFloat(itchinessChange) < 0 ? { color: '#28A745' } : { color: '#DC3545' }
                ]}>
                  {parseFloat(itchinessChange) < 0 ? '↓' : '↑'} {Math.abs(parseFloat(itchinessChange))}%
                </Text>
              )}
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Calendar size={20} color="#FFA500" />
                <Text style={styles.statTitle}>Flare-ups</Text>
              </View>
              <Text style={styles.statValue}>
                {isLoading ? '...' : currentMonthFlareUps}
              </Text>
              <Text style={styles.statSubtitle}>This Month</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Bell size={20} color="#6A9FB5" />
                <Text style={styles.statTitle}>Reminders</Text>
              </View>
              <Text style={styles.statValue}>
                {isLoadingReminders ? '...' : reminderStats.total}
              </Text>
              <Text style={styles.statSubtitle}>
                {reminderStats.active} active
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <BarChart3 size={20} color="#C5B4E3" />
                <Text style={styles.statTitle}>Logs</Text>
              </View>
              <Text style={styles.statValue}>
                {isLoading ? '...' : filteredLogs.length}
              </Text>
              <Text style={styles.statSubtitle}>In period</Text>
            </View>
          </View>

          {/* Itchiness Level Trend */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6A9FB5" />
              <Text style={styles.loadingText}>Loading data...</Text>
            </View>
          ) : (
            <>
              {renderItchinessChart()}

              {/* Monthly Flare-ups */}
              {renderFlareUpChart()}

              {/* Trigger Analysis */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Trigger Analysis</Text>
                {triggerData.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No trigger data available</Text>
                    <Text style={styles.emptySubtext}>Log symptoms with triggers to see analysis</Text>
                  </View>
                ) : (
                  <View style={styles.triggerList}>
                    {triggerData.map((trigger, index) => (
                      <View key={index} style={styles.triggerItem}>
                        <View style={styles.triggerLeft}>
                          <View style={[styles.triggerDot, { backgroundColor: `hsl(${index * 60}, 70%, 50%)` }]} />
                          <Text style={styles.triggerName}>{trigger.name}</Text>
                        </View>
                        <View style={styles.triggerRight}>
                          <Text style={styles.triggerCount}>{trigger.count}x</Text>
                          <Text style={styles.triggerPercentage}>{trigger.percentage}%</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Reminder Tracking */}
              {renderReminderChart()}
            </>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  periodSelector: {
    padding: 16,
  },
  periodContent: {
    gap: 12,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  periodChipSelected: {
    backgroundColor: '#6A9FB5',
    borderColor: '#6A9FB5',
  },
  periodText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  periodTextSelected: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#888888',
  },
  statChange: {
    fontSize: 12,
    fontFamily: 'OpenSans-SemiBold',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chartBarContainer: {
    alignItems: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    gap: 2,
  },
  chartBar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  chartDayLabel: {
    fontSize: 10,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginTop: 8,
  },
  chartValueLabel: {
    fontSize: 10,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  sectionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  triggerList: {
    gap: 12,
  },
  triggerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  triggerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  triggerName: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
  },
  triggerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerCount: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  triggerPercentage: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    color: '#6A9FB5',
    minWidth: 50,
    textAlign: 'right',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    color: '#B0B0B0',
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#888888',
  },
});

