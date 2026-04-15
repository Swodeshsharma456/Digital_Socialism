import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, startOfDay, startOfWeek, isToday, differenceInDays } from 'date-fns';

export interface ScreenTimeEntry {
  id: string;
  category: string;
  duration: number; // in minutes
  date: string; // ISO date string
  isManual: boolean;
  description?: string;
}

export interface FocusSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  completed: boolean;
  date: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetDays: number;
  currentDays: number;
  startDate: string;
  isActive: boolean;
  isCompleted: boolean;
  icon: string;
  category: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate?: string;
  isEarned: boolean;
  requirement: string;
}

export interface DailyGoal {
  maxScreenTime: number; // in minutes
  minFocusTime: number; // in minutes
}

interface DetoxState {
  // Screen Time
  screenTimeEntries: ScreenTimeEntry[];
  addScreenTimeEntry: (entry: Omit<ScreenTimeEntry, 'id'>) => void;
  deleteScreenTimeEntry: (id: string) => void;
  
  // Focus Sessions
  focusSessions: FocusSession[];
  currentSession: FocusSession | null;
  startFocusSession: () => void;
  endFocusSession: (completed: boolean) => void;
  
  // Challenges
  challenges: Challenge[];
  activeChallenges: Challenge[];
  startChallenge: (challengeId: string) => void;
  updateChallengeProgress: (challengeId: string) => void;
  completeChallenge: (challengeId: string) => void;
  
  // Badges
  badges: Badge[];
  checkAndAwardBadges: () => void;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  updateStreak: () => void;
  
  // Daily Goals
  dailyGoal: DailyGoal;
  setDailyGoal: (goal: DailyGoal) => void;
  
  // Statistics
  getTodayScreenTime: () => number;
  getTodayFocusTime: () => number;
  getWeeklyScreenTime: () => { day: string; time: number }[];
  getWeeklyFocusTime: () => { day: string; time: number }[];
  getCategoryBreakdown: () => { category: string; time: number; color: string }[];
  
  // Initialize default challenges and badges
  initializeDefaults: () => void;
}

const DEFAULT_CHALLENGES: Omit<Challenge, 'currentDays' | 'startDate' | 'isActive' | 'isCompleted'>[] = [
  {
    id: 'phone-free-morning',
    title: 'Phone-Free Morning',
    description: 'Start your day without checking your phone for the first hour',
    targetDays: 7,
    icon: 'sunny',
    category: 'mindfulness',
  },
  {
    id: 'social-media-detox',
    title: 'Social Media Detox',
    description: 'Limit social media to 30 minutes per day',
    targetDays: 14,
    icon: 'people',
    category: 'social',
  },
  {
    id: 'digital-sunset',
    title: 'Digital Sunset',
    description: 'No screens 1 hour before bedtime',
    targetDays: 7,
    icon: 'moon',
    category: 'sleep',
  },
  {
    id: 'mindful-breaks',
    title: 'Mindful Breaks',
    description: 'Take a 5-minute phone-free break every 2 hours',
    targetDays: 5,
    icon: 'leaf',
    category: 'wellness',
  },
  {
    id: 'notification-free',
    title: 'Notification Freedom',
    description: 'Turn off non-essential notifications for the day',
    targetDays: 3,
    icon: 'notifications-off',
    category: 'focus',
  },
  {
    id: 'focus-master',
    title: 'Focus Master',
    description: 'Complete 2 hours of focus time daily',
    targetDays: 10,
    icon: 'timer',
    category: 'productivity',
  },
];

const DEFAULT_BADGES: Omit<Badge, 'earnedDate' | 'isEarned'>[] = [
  {
    id: 'first-focus',
    title: 'First Focus',
    description: 'Complete your first focus session',
    icon: 'star',
    requirement: 'Complete 1 focus session',
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'flame',
    requirement: '7-day streak',
  },
  {
    id: 'challenge-champion',
    title: 'Challenge Champion',
    description: 'Complete your first challenge',
    icon: 'trophy',
    requirement: 'Complete 1 challenge',
  },
  {
    id: 'focus-ninja',
    title: 'Focus Ninja',
    description: 'Complete 10 focus sessions',
    icon: 'flash',
    requirement: '10 focus sessions',
  },
  {
    id: 'detox-master',
    title: 'Detox Master',
    description: 'Complete 5 challenges',
    icon: 'ribbon',
    requirement: '5 challenges completed',
  },
  {
    id: 'month-champion',
    title: 'Month Champion',
    description: 'Maintain a 30-day streak',
    icon: 'medal',
    requirement: '30-day streak',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Social Media': '#FF6B6B',
  'Entertainment': '#4ECDC4',
  'Productivity': '#45B7D1',
  'Gaming': '#96CEB4',
  'Communication': '#FFEAA7',
  'Other': '#DDA0DD',
};

export const useDetoxStore = create<DetoxState>()(
  persist(
    (set, get) => ({
      screenTimeEntries: [],
      focusSessions: [],
      currentSession: null,
      challenges: [],
      activeChallenges: [],
      badges: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      dailyGoal: {
        maxScreenTime: 180, // 3 hours
        minFocusTime: 60, // 1 hour
      },

      addScreenTimeEntry: (entry) => {
        const id = Date.now().toString();
        set((state) => ({
          screenTimeEntries: [...state.screenTimeEntries, { ...entry, id }],
        }));
        get().updateStreak();
        get().checkAndAwardBadges();
      },

      deleteScreenTimeEntry: (id) => {
        set((state) => ({
          screenTimeEntries: state.screenTimeEntries.filter((e) => e.id !== id),
        }));
      },

      startFocusSession: () => {
        const now = new Date();
        const session: FocusSession = {
          id: Date.now().toString(),
          startTime: now.toISOString(),
          duration: 0,
          completed: false,
          date: format(now, 'yyyy-MM-dd'),
        };
        set({ currentSession: session });
      },

      endFocusSession: (completed) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const endTime = new Date();
        const startTime = new Date(currentSession.startTime);
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

        const completedSession: FocusSession = {
          ...currentSession,
          endTime: endTime.toISOString(),
          duration,
          completed,
        };

        set((state) => ({
          focusSessions: [...state.focusSessions, completedSession],
          currentSession: null,
        }));

        get().updateStreak();
        get().checkAndAwardBadges();
      },

      startChallenge: (challengeId) => {
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === challengeId
              ? { ...c, isActive: true, startDate: new Date().toISOString(), currentDays: 0 }
              : c
          ),
        }));
      },

      updateChallengeProgress: (challengeId) => {
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === challengeId ? { ...c, currentDays: c.currentDays + 1 } : c
          ),
        }));

        const challenge = get().challenges.find((c) => c.id === challengeId);
        if (challenge && challenge.currentDays >= challenge.targetDays) {
          get().completeChallenge(challengeId);
        }
      },

      completeChallenge: (challengeId) => {
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === challengeId ? { ...c, isCompleted: true, isActive: false } : c
          ),
        }));
        get().checkAndAwardBadges();
      },

      updateStreak: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const { lastActiveDate, currentStreak, longestStreak } = get();

        if (lastActiveDate === today) return;

        let newStreak = currentStreak;
        if (lastActiveDate) {
          const daysDiff = differenceInDays(new Date(today), new Date(lastActiveDate));
          if (daysDiff === 1) {
            newStreak = currentStreak + 1;
          } else if (daysDiff > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          lastActiveDate: today,
        });
      },

      checkAndAwardBadges: () => {
        const { focusSessions, challenges, currentStreak, badges } = get();

        const completedSessions = focusSessions.filter((s) => s.completed).length;
        const completedChallenges = challenges.filter((c) => c.isCompleted).length;

        const updatedBadges = badges.map((badge) => {
          if (badge.isEarned) return badge;

          let shouldEarn = false;
          switch (badge.id) {
            case 'first-focus':
              shouldEarn = completedSessions >= 1;
              break;
            case 'week-warrior':
              shouldEarn = currentStreak >= 7;
              break;
            case 'challenge-champion':
              shouldEarn = completedChallenges >= 1;
              break;
            case 'focus-ninja':
              shouldEarn = completedSessions >= 10;
              break;
            case 'detox-master':
              shouldEarn = completedChallenges >= 5;
              break;
            case 'month-champion':
              shouldEarn = currentStreak >= 30;
              break;
          }

          if (shouldEarn) {
            return {
              ...badge,
              isEarned: true,
              earnedDate: new Date().toISOString(),
            };
          }
          return badge;
        });

        set({ badges: updatedBadges });
      },

      setDailyGoal: (goal) => {
        set({ dailyGoal: goal });
      },

      getTodayScreenTime: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return get()
          .screenTimeEntries.filter((e) => e.date === today)
          .reduce((acc, e) => acc + e.duration, 0);
      },

      getTodayFocusTime: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return get()
          .focusSessions.filter((s) => s.date === today && s.completed)
          .reduce((acc, s) => acc + s.duration, 0);
      },

      getWeeklyScreenTime: () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const weekStart = startOfWeek(today);
        const entries = get().screenTimeEntries;

        return days.map((day, index) => {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + index);
          const dateStr = format(date, 'yyyy-MM-dd');
          const time = entries
            .filter((e) => e.date === dateStr)
            .reduce((acc, e) => acc + e.duration, 0);
          return { day, time };
        });
      },

      getWeeklyFocusTime: () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const weekStart = startOfWeek(today);
        const sessions = get().focusSessions;

        return days.map((day, index) => {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + index);
          const dateStr = format(date, 'yyyy-MM-dd');
          const time = sessions
            .filter((s) => s.date === dateStr && s.completed)
            .reduce((acc, s) => acc + s.duration, 0);
          return { day, time };
        });
      },

      getCategoryBreakdown: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const entries = get().screenTimeEntries.filter((e) => e.date === today);
        const categoryMap = new Map<string, number>();

        entries.forEach((e) => {
          const current = categoryMap.get(e.category) || 0;
          categoryMap.set(e.category, current + e.duration);
        });

        return Array.from(categoryMap.entries()).map(([category, time]) => ({
          category,
          time,
          color: CATEGORY_COLORS[category] || '#888888',
        }));
      },

      initializeDefaults: () => {
        const { challenges, badges } = get();
        
        if (challenges.length === 0) {
          const initialChallenges: Challenge[] = DEFAULT_CHALLENGES.map((c) => ({
            ...c,
            currentDays: 0,
            startDate: '',
            isActive: false,
            isCompleted: false,
          }));
          set({ challenges: initialChallenges });
        }

        if (badges.length === 0) {
          const initialBadges: Badge[] = DEFAULT_BADGES.map((b) => ({
            ...b,
            isEarned: false,
          }));
          set({ badges: initialBadges });
        }
      },
    }),
    {
      name: 'digital-detox-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
