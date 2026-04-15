import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDetoxStore } from '../store/detoxStore';
import { format } from 'date-fns';

export default function ProfileScreen() {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [maxScreenTime, setMaxScreenTime] = useState('');
  const [minFocusTime, setMinFocusTime] = useState('');

  const {
    currentStreak,
    longestStreak,
    badges,
    challenges,
    focusSessions,
    dailyGoal,
    setDailyGoal,
  } = useDetoxStore();

  const earnedBadges = badges.filter((b) => b.isEarned);
  const completedChallenges = challenges.filter((c) => c.isCompleted);
  const totalFocusTime = focusSessions
    .filter((s) => s.completed)
    .reduce((acc, s) => acc + s.duration, 0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleSaveGoals = () => {
    const newMaxScreen = parseInt(maxScreenTime) || dailyGoal.maxScreenTime;
    const newMinFocus = parseInt(minFocusTime) || dailyGoal.minFocusTime;
    setDailyGoal({
      maxScreenTime: newMaxScreen,
      minFocusTime: newMinFocus,
    });
    setShowGoalModal(false);
    setMaxScreenTime('');
    setMinFocusTime('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="leaf" size={48} color="#10B981" />
          </View>
          <Text style={styles.title}>Digital Detox</Text>
          <Text style={styles.subtitle}>Your wellness journey</Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={28} color="#F97316" />
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={28} color="#F59E0B" />
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="ribbon" size={28} color="#8B5CF6" />
            <Text style={styles.statValue}>{earnedBadges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flag" size={28} color="#10B981" />
            <Text style={styles.statValue}>{completedChallenges.length}</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
        </View>

        {/* Daily Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Goals</Text>
            <TouchableOpacity onPress={() => setShowGoalModal(true)}>
              <Ionicons name="settings-outline" size={22} color="#6366F1" />
            </TouchableOpacity>
          </View>
          <View style={styles.goalCard}>
            <View style={styles.goalItem}>
              <View style={styles.goalIcon}>
                <Ionicons name="phone-portrait-outline" size={20} color="#EF4444" />
              </View>
              <View style={styles.goalContent}>
                <Text style={styles.goalLabel}>Max Screen Time</Text>
                <Text style={styles.goalValue}>
                  {formatTime(dailyGoal.maxScreenTime)}
                </Text>
              </View>
            </View>
            <View style={styles.goalDivider} />
            <View style={styles.goalItem}>
              <View style={styles.goalIcon}>
                <Ionicons name="timer-outline" size={20} color="#10B981" />
              </View>
              <View style={styles.goalContent}>
                <Text style={styles.goalLabel}>Min Focus Time</Text>
                <Text style={styles.goalValue}>
                  {formatTime(dailyGoal.minFocusTime)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgesContainer}>
            {badges.map((badge) => (
              <View
                key={badge.id}
                style={[
                  styles.badgeCard,
                  !badge.isEarned && styles.badgeCardLocked,
                ]}
              >
                <View
                  style={[
                    styles.badgeIconBg,
                    badge.isEarned && styles.badgeIconBgEarned,
                  ]}
                >
                  <Ionicons
                    name={badge.icon as any}
                    size={28}
                    color={badge.isEarned ? '#F59E0B' : '#4B5563'}
                  />
                </View>
                <Text
                  style={[
                    styles.badgeTitle,
                    !badge.isEarned && styles.badgeTitleLocked,
                  ]}
                >
                  {badge.title}
                </Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
                {badge.isEarned && badge.earnedDate && (
                  <Text style={styles.badgeDate}>
                    Earned {format(new Date(badge.earnedDate), 'MMM d')}
                  </Text>
                )}
                {!badge.isEarned && (
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={12} color="#6B7280" />
                    <Text style={styles.lockedText}>Locked</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Focus Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total Focus Time</Text>
          <View style={styles.focusSummaryCard}>
            <Ionicons name="timer" size={40} color="#6366F1" />
            <View style={styles.focusSummaryContent}>
              <Text style={styles.focusSummaryValue}>{formatTime(totalFocusTime)}</Text>
              <Text style={styles.focusSummaryLabel}>of focused work completed</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <View style={styles.aboutItem}>
              <Ionicons name="information-circle" size={20} color="#6B7280" />
              <Text style={styles.aboutText}>Digital Detox v1.0</Text>
            </View>
            <View style={styles.aboutItem}>
              <Ionicons name="shield-checkmark" size={20} color="#6B7280" />
              <Text style={styles.aboutText}>All data stored locally</Text>
            </View>
            <View style={styles.aboutItem}>
              <Ionicons name="heart" size={20} color="#6B7280" />
              <Text style={styles.aboutText}>Made for your wellbeing</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Goals Modal */}
      <Modal visible={showGoalModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Daily Goals</Text>
              <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Max Screen Time (minutes)</Text>
            <TextInput
              style={styles.input}
              value={maxScreenTime}
              onChangeText={setMaxScreenTime}
              keyboardType="numeric"
              placeholder={`Current: ${dailyGoal.maxScreenTime} min`}
              placeholderTextColor="#6B7280"
            />

            <Text style={styles.inputLabel}>Min Focus Time (minutes)</Text>
            <TextInput
              style={styles.input}
              value={minFocusTime}
              onChangeText={setMinFocusTime}
              keyboardType="numeric"
              placeholder={`Current: ${dailyGoal.minFocusTime} min`}
              placeholderTextColor="#6B7280"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveGoals}>
              <Text style={styles.saveButtonText}>Save Goals</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  goalCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalContent: {
    marginLeft: 12,
  },
  goalLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  goalValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  goalDivider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIconBgEarned: {
    backgroundColor: '#F59E0B20',
  },
  badgeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  badgeTitleLocked: {
    color: '#6B7280',
  },
  badgeDescription: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  badgeDate: {
    color: '#F59E0B',
    fontSize: 10,
    marginTop: 8,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  lockedText: {
    color: '#6B7280',
    fontSize: 10,
  },
  focusSummaryCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusSummaryContent: {
    marginLeft: 16,
  },
  focusSummaryValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  focusSummaryLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 2,
  },
  aboutCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  aboutText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inputLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
