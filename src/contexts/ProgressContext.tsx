import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserCaseProgress, 
  getUserActivities, 
  getWeeklyScoreChange 
} from '@/firebase/database';
import type { UserCaseProgress, UserActivity, Profile } from '@/firebase/types';

interface ProgressStats {
  totalCases: number;
  completedCases: number;
  inProgressCases: number;
  totalXP: number;
  weeklyXP: number;
  weeklyScoreChange: number;
  currentStreak: number;
  accuracy: number;
}

interface ProgressContextType {
  caseProgress: Record<string, UserCaseProgress>;
  recentActivities: UserActivity[];
  stats: ProgressStats;
  loading: boolean;
  refreshProgress: () => Promise<void>;
  refreshActivities: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const defaultStats: ProgressStats = {
  totalCases: 0,
  completedCases: 0,
  inProgressCases: 0,
  totalXP: 0,
  weeklyXP: 0,
  weeklyScoreChange: 0,
  currentStreak: 0,
  accuracy: 0,
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [caseProgress, setCaseProgress] = useState<Record<string, UserCaseProgress>>({});
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<ProgressStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  const calculateStats = useCallback((
    progress: Record<string, UserCaseProgress>,
    userProfile: Profile | null
  ): ProgressStats => {
    const progressArray = Object.values(progress);
    const completed = progressArray.filter(p => p.status === 'reviewed' || p.status === 'submitted');
    const inProgress = progressArray.filter(p => p.status === 'in_progress');
    
    const totalScore = completed.reduce((sum, p) => sum + (p.score || 0), 0);
    const avgAccuracy = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;
    
    const weeklyChange = userProfile ? getWeeklyScoreChange(userProfile) : 0;
    const currentWeek = userProfile?.weekly_progress?.find(w => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - dayOfWeek);
      return w.week_start === weekStart.toISOString().split('T')[0];
    });

    return {
      totalCases: progressArray.length,
      completedCases: completed.length,
      inProgressCases: inProgress.length,
      totalXP: userProfile?.total_xp || 0,
      weeklyXP: currentWeek?.xp_earned || 0,
      weeklyScoreChange: weeklyChange,
      currentStreak: userProfile?.streak?.current_streak || 0,
      accuracy: avgAccuracy,
    };
  }, []);

  const refreshProgress = useCallback(async () => {
    if (!user) return;
    
    try {
      const progress = await getUserCaseProgress(user.uid);
      setCaseProgress(progress);
      setStats(calculateStats(progress, profile));
    } catch (error) {
      console.error('Error refreshing progress:', error);
    }
  }, [user, profile, calculateStats]);

  const refreshActivities = useCallback(async () => {
    if (!user) return;
    
    try {
      const activities = await getUserActivities(user.uid, 10);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  }, [user]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([refreshProgress(), refreshActivities()]);
    setLoading(false);
  }, [refreshProgress, refreshActivities]);

  // Initial load when user logs in
  useEffect(() => {
    if (user && profile) {
      refreshAll();
    } else {
      setCaseProgress({});
      setRecentActivities([]);
      setStats(defaultStats);
      setLoading(false);
    }
  }, [user, profile]);

  // Update stats when profile changes (e.g., after completing a case)
  useEffect(() => {
    if (profile) {
      setStats(calculateStats(caseProgress, profile));
    }
  }, [profile, caseProgress, calculateStats]);

  return (
    <ProgressContext.Provider value={{
      caseProgress,
      recentActivities,
      stats,
      loading,
      refreshProgress,
      refreshActivities,
      refreshAll,
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export default ProgressContext;
