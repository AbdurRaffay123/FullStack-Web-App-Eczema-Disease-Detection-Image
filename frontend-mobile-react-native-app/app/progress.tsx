import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Target, Award, ChartBar as BarChart3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = [
    { id: 'week', name: '7 Days' },
    { id: 'month', name: '30 Days' },
    { id: '3months', name: '3 Months' },
    { id: 'year', name: '1 Year' },
  ];

  const progressData = {
    week: {
      symptomsImprovement: 15,
      averageItchiness: 2.3,
      flareUpDays: 2,
      medicationCompliance: 95,
      moisturizingStreak: 6,
    },
    month: {
      symptomsImprovement: 28,
      averageItchiness: 2.1,
      flareUpDays: 5,
      medicationCompliance: 92,
      moisturizingStreak: 23,
    },
    '3months': {
      symptomsImprovement: 45,
      averageItchiness: 1.8,
      flareUpDays: 12,
      medicationCompliance: 89,
      moisturizingStreak: 67,
    },
    year: {
      symptomsImprovement: 62,
      averageItchiness: 1.5,
      flareUpDays: 28,
      medicationCompliance: 87,
      moisturizingStreak: 245,
    },
  };

  const weeklyData = [
    { day: 'Mon', itchiness: 3, mood: 7, sleep: 8 },
    { day: 'Tue', itchiness: 2, mood: 8, sleep: 7 },
    { day: 'Wed', itchiness: 4, mood: 6, sleep: 6 },
    { day: 'Thu', itchiness: 2, mood: 8, sleep: 8 },
    { day: 'Fri', itchiness: 1, mood: 9, sleep: 9 },
    { day: 'Sat', itchiness: 2, mood: 8, sleep: 8 },
    { day: 'Sun', itchiness: 1, mood: 9, sleep: 9 },
  ];

  const achievements = [
    {
      id: 1,
      title: 'Consistency Champion',
      description: 'Logged symptoms for 7 days straight',
      icon: Target,
      color: '#28A745',
      earned: true,
      date: '2025-01-10',
    },
    {
      id: 2,
      title: 'Moisturizing Master',
      description: 'Applied moisturizer daily for 30 days',
      icon: Award,
      color: '#6A9FB5',
      earned: true,
      date: '2025-01-05',
    },
    {
      id: 3,
      title: 'Improvement Tracker',
      description: 'Reduced average itchiness by 50%',
      icon: TrendingUp,
      color: '#FFA500',
      earned: false,
      progress: 75,
    },
    {
      id: 4,
      title: 'Medication Adherence',
      description: 'Perfect medication compliance for 14 days',
      icon: Target,
      color: '#DC3545',
      earned: false,
      progress: 60,
    },
  ];

  const currentData = progressData[selectedPeriod as keyof typeof progressData];

  const getItchinessColor = (level: number) => {
    if (level <= 1) return '#28A745';
    if (level <= 2) return '#FFA500';
    if (level <= 3) return '#FF6B35';
    return '#DC3545';
  };

  const renderChart = () => {
    const maxValue = Math.max(...weeklyData.map(d => Math.max(d.itchiness, d.mood, d.sleep)));
    const chartHeight = 120;
    const barWidth = (width - 80) / weeklyData.length;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Overview</Text>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#DC3545' }]} />
            <Text style={styles.legendText}>Itchiness</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#6A9FB5' }]} />
            <Text style={styles.legendText}>Mood</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#28A745' }]} />
            <Text style={styles.legendText}>Sleep</Text>
          </View>
        </View>
        
        <View style={[styles.chart, { height: chartHeight }]}>
          {weeklyData.map((data, index) => (
            <View key={data.day} style={[styles.chartDay, { width: barWidth }]}>
              <View style={styles.chartBars}>
                <View 
                  style={[
                    styles.chartBar,
                    { 
                      height: (data.itchiness / maxValue) * chartHeight,
                      backgroundColor: '#DC3545',
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.chartBar,
                    { 
                      height: (data.mood / maxValue) * chartHeight,
                      backgroundColor: '#6A9FB5',
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.chartBar,
                    { 
                      height: (data.sleep / maxValue) * chartHeight,
                      backgroundColor: '#28A745',
                    }
                  ]} 
                />
              </View>
              <Text style={styles.chartDayLabel}>{data.day}</Text>
            </View>
          ))}
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

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <TrendingUp size={20} color="#28A745" />
                <Text style={styles.statTitle}>Improvement</Text>
              </View>
              <Text style={styles.statValue}>+{currentData.symptomsImprovement}%</Text>
              <Text style={styles.statSubtitle}>Symptoms reduced</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <BarChart3 size={20} color="#6A9FB5" />
                <Text style={styles.statTitle}>Avg. Itchiness</Text>
              </View>
              <Text style={[styles.statValue, { color: getItchinessColor(currentData.averageItchiness) }]}>
                {currentData.averageItchiness}/5
              </Text>
              <Text style={styles.statSubtitle}>Daily average</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Calendar size={20} color="#FFA500" />
                <Text style={styles.statTitle}>Flare-ups</Text>
              </View>
              <Text style={styles.statValue}>{currentData.flareUpDays}</Text>
              <Text style={styles.statSubtitle}>Days with flares</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Target size={20} color="#C5B4E3" />
                <Text style={styles.statTitle}>Compliance</Text>
              </View>
              <Text style={styles.statValue}>{currentData.medicationCompliance}%</Text>
              <Text style={styles.statSubtitle}>Medication taken</Text>
            </View>
          </View>

          {selectedPeriod === 'week' && renderChart()}

          <View style={styles.streakContainer}>
            <LinearGradient
              colors={['#6A9FB5', '#C5B4E3']}
              style={styles.streakCard}
            >
              <View style={styles.streakHeader}>
                <Award size={24} color="#FFFFFF" />
                <Text style={styles.streakTitle}>Current Streak</Text>
              </View>
              <Text style={styles.streakValue}>{currentData.moisturizingStreak}</Text>
              <Text style={styles.streakSubtitle}>Days of consistent moisturizing</Text>
            </LinearGradient>
          </View>

          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementLeft}>
                  <View style={[
                    styles.achievementIcon,
                    { 
                      backgroundColor: achievement.earned ? achievement.color : 'rgba(255, 255, 255, 0.1)',
                      opacity: achievement.earned ? 1 : 0.5,
                    }
                  ]}>
                    <achievement.icon 
                      size={20} 
                      color={achievement.earned ? '#FFFFFF' : '#B0B0B0'} 
                    />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={[
                      styles.achievementTitle,
                      { opacity: achievement.earned ? 1 : 0.7 }
                    ]}>
                      {achievement.title}
                    </Text>
                    <Text style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                    {achievement.earned && achievement.date && (
                      <Text style={styles.achievementDate}>
                        Earned on {achievement.date}
                      </Text>
                    )}
                    {!achievement.earned && achievement.progress && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill,
                              { 
                                width: `${achievement.progress}%`,
                                backgroundColor: achievement.color,
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressText}>{achievement.progress}%</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>🎯 Keep it up!</Text>
              <Text style={styles.insightText}>
                Your consistency with moisturizing is paying off. Your average itchiness has decreased by 23% this month.
              </Text>
            </View>
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>💡 Tip</Text>
              <Text style={styles.insightText}>
                You tend to have better days when you sleep 8+ hours. Consider maintaining a regular sleep schedule.
              </Text>
            </View>
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
    marginBottom: 12,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
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
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  chartDay: {
    alignItems: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    gap: 2,
  },
  chartBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  chartDayLabel: {
    fontSize: 10,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginTop: 8,
  },
  streakContainer: {
    padding: 16,
  },
  streakCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  streakValue: {
    fontSize: 36,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  achievementsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#28A745',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  insightsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  insightCard: {
    backgroundColor: 'rgba(106, 159, 181, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 159, 181, 0.2)',
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#6A9FB5',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    lineHeight: 20,
  },
});