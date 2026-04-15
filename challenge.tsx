import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDetoxStore, Challenge } from '../store/detoxStore';

const CATEGORY_COLORS: Record<string, string> = {
  mindfulness: '#10B981',
  social: '#EC4899',
  sleep: '#8B5CF6',
  wellness: '#06B6D4',
  focus: '#F59E0B',
  productivity: '#6366F1',
};

export default function ChallengesScreen() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');

  const { challenges, startChallenge, updateChallengeProgress } = useDetoxStore();

  const availableChallenges = challenges.filter((c) => !c.isActive && !c.isCompleted);
  const activeChallenges = challenges.filter((c) => c.isActive && !c.isCompleted);
  const completedChallenges = challenges.filter((c) => c.isCompleted);

  const handleStartChallenge = (challengeId: string) => {
    startChallenge(challengeId);
    setSelectedChallenge(null);
  };

  const handleLogProgress = (challengeId: string) => {
    updateChallengeProgress(challengeId);
  };

  const renderChallengeCard = (challenge: Challenge, showProgress = false) => {
    const categoryColor = CATEGORY_COLORS[challenge.category] || '#6366F1';

    return (
      <TouchableOpacity
        key={challenge.id}
        style={styles.challengeCard}
        onPress={() => setSelectedChallenge(challenge)}
      >
        <View style={[styles.challengeIconBg, { backgroundColor: categoryColor + '20' }]}>
          <Ionicons name={challenge.icon as any} size={28} color={categoryColor} />
        </View>
        <View style={styles.challengeContent}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription} numberOfLines={2}>
            {challenge.description}
          </Text>
          {showProgress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${(challenge.currentDays / challenge.targetDays) * 100}%`,
                      backgroundColor: categoryColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {challenge.currentDays} / {challenge.targetDays} days
              </Text>
            </View>
          )}
          {!showProgress && (
            <View style={styles.durationBadge}>
              <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
              <Text style={styles.durationText}>{challenge.targetDays} days</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenges</Text>
        <Text style={styles.subtitle}>
          {completedChallenges.length} completed • {activeChallenges.length} active
        </Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
            Available
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active ({activeChallenges.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Done ({completedChallenges.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'available' && (
          <View style={styles.section}>
            {availableChallenges.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                <Text style={styles.emptyTitle}>All Caught Up!</Text>
                <Text style={styles.emptyText}>
                  You've started all available challenges. Complete them to unlock more!
                </Text>
              </View>
            ) : (
              availableChallenges.map((c) => renderChallengeCard(c))
            )}
          </View>
        )}

        {activeTab === 'active' && (
          <View style={styles.section}>
            {activeChallenges.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="flag" size={48} color="#6366F1" />
                <Text style={styles.emptyTitle}>No Active Challenges</Text>
                <Text style={styles.emptyText}>
                  Start a challenge from the Available tab to begin your detox journey!
                </Text>
              </View>
            ) : (
              activeChallenges.map((c) => renderChallengeCard(c, true))
            )}
          </View>
        )}

        {activeTab === 'completed' && (
          <View style={styles.section}>
            {completedChallenges.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="trophy" size={48} color="#F59E0B" />
                <Text style={styles.emptyTitle}>No Completed Challenges</Text>
                <Text style={styles.emptyText}>
                  Complete challenges to see them here and earn badges!
                </Text>
              </View>
            ) : (
              completedChallenges.map((c) => (
                <View key={c.id} style={styles.completedCard}>
                  <View style={styles.completedIcon}>
                    <Ionicons name={c.icon as any} size={24} color="#10B981" />
                  </View>
                  <View style={styles.completedContent}>
                    <Text style={styles.completedTitle}>{c.title}</Text>
                    <Text style={styles.completedSubtitle}>
                      Completed • {c.targetDays} days
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
              ))
            )}
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Challenge Detail Modal */}
      <Modal visible={!!selectedChallenge} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedChallenge && (
              <>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalIconBg,
                      {
                        backgroundColor:
                          (CATEGORY_COLORS[selectedChallenge.category] || '#6366F1') + '20',
                      },
                    ]}
                  >
                    <Ionicons
                      name={selectedChallenge.icon as any}
                      size={40}
                      color={CATEGORY_COLORS[selectedChallenge.category] || '#6366F1'}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setSelectedChallenge(null)}
                  >
                    <Ionicons name="close" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedChallenge.title}</Text>
                <Text style={styles.modalDescription}>
                  {selectedChallenge.description}
                </Text>

                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Ionicons name="calendar" size={20} color="#6366F1" />
                    <Text style={styles.modalStatValue}>
                      {selectedChallenge.targetDays} days
                    </Text>
                    <Text style={styles.modalStatLabel}>Duration</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Ionicons name="trophy" size={20} color="#F59E0B" />
                    <Text style={styles.modalStatValue}>Badge</Text>
                    <Text style={styles.modalStatLabel}>Reward</Text>
                  </View>
                </View>

                {selectedChallenge.isActive && !selectedChallenge.isCompleted && (
                  <View style={styles.activeProgress}>
                    <Text style={styles.activeProgressTitle}>Your Progress</Text>
                    <View style={styles.activeProgressBar}>
                      <View
                        style={[
                          styles.activeProgressFill,
                          {
                            width: `${(selectedChallenge.currentDays / selectedChallenge.targetDays) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.activeProgressText}>
                      Day {selectedChallenge.currentDays} of {selectedChallenge.targetDays}
                    </Text>
                    <TouchableOpacity
                      style={styles.logProgressButton}
                      onPress={() => handleLogProgress(selectedChallenge.id)}
                    >
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      <Text style={styles.logProgressText}>Log Today's Progress</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!selectedChallenge.isActive && !selectedChallenge.isCompleted && (
                  <TouchableOpacity
                    style={styles.startChallengeButton}
                    onPress={() => handleStartChallenge(selectedChallenge.id)}
                  >
                    <Ionicons name="flag" size={20} color="#FFFFFF" />
                    <Text style={styles.startChallengeText}>Start Challenge</Text>
                  </TouchableOpacity>
                )}

                {selectedChallenge.isCompleted && (
                  <View style={styles.completedBanner}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    <Text style={styles.completedBannerText}>Challenge Completed!</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
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
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#1F2937',
  },
  tabActive: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
  },
  challengeCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeIconBg: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeContent: {
    flex: 1,
    marginLeft: 12,
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  challengeDescription: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 4,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  durationText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  completedCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedContent: {
    flex: 1,
    marginLeft: 12,
  },
  completedTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
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
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconBg: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    marginTop: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#374151',
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  modalStatLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  activeProgress: {
    marginTop: 24,
  },
  activeProgressTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  activeProgressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  activeProgressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  activeProgressText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  logProgressButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  logProgressText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  startChallengeButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  startChallengeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedBanner: {
    backgroundColor: '#10B98120',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  completedBannerText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
});
