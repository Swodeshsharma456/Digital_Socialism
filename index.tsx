import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDetoxStore } from '../store/detoxStore';
import { format } from 'date-fns';

const CATEGORIES = [
  'Social Media',
  'Entertainment',
  'Productivity',
  'Gaming',
  'Communication',
  'Other',
];

const QUOTES = [
  "Your phone can wait. Your life can't.",
  "Disconnect to reconnect with yourself.",
  "Less screen, more dream.",
  "Be present. Be mindful. Be free.",
  "Digital detox: the ultimate self-care.",
  "Life happens outside the screen.",
];

export default function HomeScreen() {
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  const {
    getTodayScreenTime,
    getTodayFocusTime,
    dailyGoal,
    currentStreak,
    addScreenTimeEntry,
    challenges,
    badges,
  } = useDetoxStore();

  const todayScreenTime = getTodayScreenTime();
  const todayFocusTime = getTodayFocusTime();
  const activeChallenges = challenges.filter((c) => c.isActive);
  const earnedBadges = badges.filter((b) => b.isEarned);

  const screenTimeProgress = Math.min((todayScreenTime / dailyGoal.maxScreenTime) * 100, 100);
  const focusTimeProgress = Math.min((todayFocusTime / dailyGoal.minFocusTime) * 100, 100);

  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleAddEntry = () => {
    if (!duration || isNaN(parseInt(duration))) return;

    addScreenTimeEntry({
      category,
      duration: parseInt(duration),
      date: format(new Date(), 'yyyy-MM-dd'),
      isManual: true,
      description,
    });

    setShowModal(false);
    setDuration('');
    setDescription('');
    setCategory(CATEGORIES[0]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello there!</Text>
            <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color="#F97316" />
            <Text style={styles.streakText}>{currentStreak}</Text>
          </View>
        </View>

        {/* Quote Card */}
        <View style={styles.quoteCard}>
          <Ionicons name="leaf" size={24} color="#10B981" />
          <Text style={styles.quoteText}>{randomQuote}</Text>
        </View>

        {/* Progress Cards */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <Ionicons name="phone-portrait-outline" size={24} color="#EF4444" />
                <Text style={styles.progressLabel}>Screen Time</Text>
              </View>
              <Text style={styles.progressValue}>
                {formatTime(todayScreenTime)} / {formatTime(dailyGoal.maxScreenTime)}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${screenTimeProgress}%`,
                    backgroundColor: screenTimeProgress > 100 ? '#EF4444' : '#6366F1',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressHint}>
              {screenTimeProgress >= 100
                ? 'Goal exceeded! Try to reduce tomorrow.'
                : `${formatTime(dailyGoal.maxScreenTime - todayScreenTime)} remaining`}
            </Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <Ionicons name="timer-outline" size={24} color="#10B981" />
                <Text style={styles.progressLabel}>Focus Time</Text>
              </View>
              <Text style={styles.progressValue}>
                {formatTime(todayFocusTime)} / {formatTime(dailyGoal.minFocusTime)}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${focusTimeProgress}%`, backgroundColor: '#10B981' },
                ]}
              />
            </View>
            <Text style={styles.progressHint}>
              {focusTimeProgress >= 100
                ? 'Goal achieved! Great job!'
                : `${formatTime(dailyGoal.minFocusTime - todayFocusTime)} to go`}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add-circle" size={28} color="#6366F1" />
            <Text style={styles.actionText}>Log Screen Time</Text>
          </TouchableOpacity>
        </View>

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Challenges</Text>
            {activeChallenges.slice(0, 2).map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <Ionicons name={challenge.icon as any} size={24} color="#6366F1" />
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeProgress}>
                    Day {challenge.currentDays} of {challenge.targetDays}
                  </Text>
                </View>
                <View style={styles.challengeProgressCircle}>
                  <Text style={styles.challengePercent}>
                    {Math.round((challenge.currentDays / challenge.targetDays) * 100)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Badges */}
        {earnedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <View style={styles.badgesRow}>
              {earnedBadges.slice(0, 4).map((badge) => (
                <View key={badge.id} style={styles.badgeItem}>
                  <View style={styles.badgeIcon}>
                    <Ionicons name={badge.icon as any} size={24} color="#F59E0B" />
                  </View>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add Screen Time Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Screen Time</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="e.g., 30"
              placeholderTextColor="#6B7280"
            />

            <Text style={styles.inputLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="What were you doing?"
              placeholderTextColor="#6B7280"
              multiline
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleAddEntry}>
              <Text style={styles.submitButtonText}>Add Entry</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  date: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    color: '#F97316',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 16,
  },
  quoteCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 12,
    flex: 1,
  },
  progressSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  progressValue: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressHint: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  challengeCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  challengeProgress: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  challengeProgressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengePercent: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeItem: {
    alignItems: 'center',
    width: '25%',
    marginBottom: 12,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeTitle: {
    color: '#9CA3AF',
    fontSize: 10,
    textAlign: 'center',
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
  },
  categoryChipActive: {
    backgroundColor: '#6366F1',
  },
  categoryChipText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
