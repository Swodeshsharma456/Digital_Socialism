import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { useDetoxStore } from '../store/detoxStore';
import { format } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const [activeTab, setActiveTab] = useState<'screen' | 'focus'>('screen');

  const {
    getWeeklyScreenTime,
    getWeeklyFocusTime,
    getCategoryBreakdown,
    getTodayScreenTime,
    getTodayFocusTime,
    focusSessions,
    screenTimeEntries,
    dailyGoal,
  } = useDetoxStore();

  const weeklyScreenTime = getWeeklyScreenTime();
  const weeklyFocusTime = getWeeklyFocusTime();
  const categoryBreakdown = getCategoryBreakdown();
  const todayScreenTime = getTodayScreenTime();
  const todayFocusTime = getTodayFocusTime();

  const totalWeeklyScreen = weeklyScreenTime.reduce((acc, d) => acc + d.time, 0);
  const totalWeeklyFocus = weeklyFocusTime.reduce((acc, d) => acc + d.time, 0);
  const avgDailyScreen = Math.round(totalWeeklyScreen / 7);
  const avgDailyFocus = Math.round(totalWeeklyFocus / 7);

  const completedSessions = focusSessions.filter((s) => s.completed).length;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const screenTimeBarData = weeklyScreenTime.map((d) => ({
    value: d.time,
    label: d.day,
    frontColor: d.time > dailyGoal.maxScreenTime ? '#EF4444' : '#6366F1',
  }));

  const focusTimeBarData = weeklyFocusTime.map((d) => ({
    value: d.time,
    label: d.day,
    frontColor: d.time >= dailyGoal.minFocusTime ? '#10B981' : '#6366F1',
  }));

  const pieData = categoryBreakdown.length > 0
    ? categoryBreakdown.map((c) => ({
        value: c.time,
        color: c.color,
        text: c.category,
      }))
    : [{ value: 1, color: '#374151', text: 'No data' }];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Statistics</Text>
          <Text style={styles.subtitle}>
            Week of {format(new Date(), 'MMM d, yyyy')}
          </Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'screen' && styles.tabActive]}
            onPress={() => setActiveTab('screen')}
          >
            <Ionicons
              name="phone-portrait"
              size={18}
              color={activeTab === 'screen' ? '#FFFFFF' : '#9CA3AF'}
            />
            <Text
              style={[styles.tabText, activeTab === 'screen' && styles.tabTextActive]}
            >
              Screen Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'focus' && styles.tabActive]}
            onPress={() => setActiveTab('focus')}
          >
            <Ionicons
              name="timer"
              size={18}
              color={activeTab === 'focus' ? '#FFFFFF' : '#9CA3AF'}
            />
            <Text
              style={[styles.tabText, activeTab === 'focus' && styles.tabTextActive]}
            >
              Focus Time
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Today</Text>
            <Text style={styles.summaryValue}>
              {formatTime(activeTab === 'screen' ? todayScreenTime : todayFocusTime)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Weekly Avg</Text>
            <Text style={styles.summaryValue}>
              {formatTime(activeTab === 'screen' ? avgDailyScreen : avgDailyFocus)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Goal</Text>
            <Text style={styles.summaryValue}>
              {formatTime(
                activeTab === 'screen'
                  ? dailyGoal.maxScreenTime
                  : dailyGoal.minFocusTime
              )}
            </Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Weekly Overview</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={activeTab === 'screen' ? screenTimeBarData : focusTimeBarData}
              width={screenWidth - 80}
              height={180}
              barWidth={28}
              spacing={20}
              roundedTop
              roundedBottom
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: '#6B7280', fontSize: 10 }}
              xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 11 }}
              noOfSections={4}
              maxValue={
                Math.max(
                  ...(activeTab === 'screen' ? screenTimeBarData : focusTimeBarData).map(
                    (d) => d.value
                  ),
                  activeTab === 'screen' ? dailyGoal.maxScreenTime : dailyGoal.minFocusTime
                ) * 1.2
              }
              isAnimated
              backgroundColor="#1F2937"
              rulesColor="#374151"
            />
          </View>
        </View>

        {/* Screen Time Category Breakdown */}
        {activeTab === 'screen' && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Today's Breakdown</Text>
            {categoryBreakdown.length > 0 ? (
              <View style={styles.pieContainer}>
                <PieChart
                  data={pieData}
                  donut
                  radius={80}
                  innerRadius={50}
                  centerLabelComponent={() => (
                    <View style={styles.pieCenter}>
                      <Text style={styles.pieCenterValue}>
                        {formatTime(todayScreenTime)}
                      </Text>
                      <Text style={styles.pieCenterLabel}>Total</Text>
                    </View>
                  )}
                />
                <View style={styles.legendContainer}>
                  {categoryBreakdown.map((c) => (
                    <View key={c.category} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                      <Text style={styles.legendText}>{c.category}</Text>
                      <Text style={styles.legendValue}>{formatTime(c.time)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.emptyChart}>
                <Ionicons name="pie-chart-outline" size={48} color="#374151" />
                <Text style={styles.emptyText}>No screen time logged today</Text>
              </View>
            )}
          </View>
        )}

        {/* Focus Sessions Stats */}
        {activeTab === 'focus' && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Focus Sessions</Text>
            <View style={styles.focusStats}>
              <View style={styles.focusStatCard}>
                <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                <Text style={styles.focusStatValue}>{completedSessions}</Text>
                <Text style={styles.focusStatLabel}>Total Completed</Text>
              </View>
              <View style={styles.focusStatCard}>
                <Ionicons name="time" size={32} color="#6366F1" />
                <Text style={styles.focusStatValue}>{formatTime(totalWeeklyFocus)}</Text>
                <Text style={styles.focusStatLabel}>This Week</Text>
              </View>
            </View>
          </View>
        )}

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {activeTab === 'screen' ? (
            <View style={styles.insightCard}>
              <Ionicons
                name={todayScreenTime <= dailyGoal.maxScreenTime ? 'trending-down' : 'trending-up'}
                size={24}
                color={todayScreenTime <= dailyGoal.maxScreenTime ? '#10B981' : '#EF4444'}
              />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>
                  {todayScreenTime <= dailyGoal.maxScreenTime
                    ? 'Great Progress!'
                    : 'Room for Improvement'}
                </Text>
                <Text style={styles.insightText}>
                  {todayScreenTime <= dailyGoal.maxScreenTime
                    ? `You're ${formatTime(dailyGoal.maxScreenTime - todayScreenTime)} under your daily limit!`
                    : `You're ${formatTime(todayScreenTime - dailyGoal.maxScreenTime)} over your daily limit.`}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.insightCard}>
              <Ionicons
                name={todayFocusTime >= dailyGoal.minFocusTime ? 'star' : 'time'}
                size={24}
                color={todayFocusTime >= dailyGoal.minFocusTime ? '#F59E0B' : '#6366F1'}
              />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>
                  {todayFocusTime >= dailyGoal.minFocusTime
                    ? 'Goal Achieved!'
                    : 'Keep Going!'}
                </Text>
                <Text style={styles.insightText}>
                  {todayFocusTime >= dailyGoal.minFocusTime
                    ? `Amazing! You've met your focus goal for today.`
                    : `${formatTime(dailyGoal.minFocusTime - todayFocusTime)} more to reach your daily focus goal.`}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  pieContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  pieCenter: {
    alignItems: 'center',
  },
  pieCenterValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pieCenterLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  legendContainer: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#9CA3AF',
    fontSize: 14,
    flex: 1,
  },
  legendValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyChart: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 12,
  },
  focusStats: {
    flexDirection: 'row',
    gap: 12,
  },
  focusStatCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  focusStatValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  focusStatLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  insightsSection: {
    paddingHorizontal: 20,
  },
  insightCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
});
