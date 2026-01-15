// Firebase database service functions
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  serverTimestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import {
  Profile,
  Case,
  CaseEvidence,
  CaseQuestion,
  UserCaseProgress,
  UserActivity,
  COLLECTIONS,
  BADGE_DEFINITIONS,
} from './types';

// Helper to convert Firestore timestamps
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Profile operations
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const q = query(
    collection(db, COLLECTIONS.PROFILES),
    where('user_id', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  
  // Ensure backward compatibility with profiles missing new fields
  const todayStr = new Date().toISOString().split('T')[0];
  const profile: Profile = {
    id: doc.id,
    user_id: data.user_id,
    display_name: data.display_name || null,
    username: data.username || null,
    role: data.role || 'cyber_learner',
    avatar_url: data.avatar_url || null,
    language_preference: data.language_preference || 'en',
    normicyte_score: data.normicyte_score || 0,
    cases_solved: data.cases_solved || 0,
    missions_completed: data.missions_completed || 0,
    accuracy_percentage: data.accuracy_percentage || 0,
    total_xp: data.total_xp || 0,
    profile_completed: data.profile_completed || false,
    badges: data.badges || [],
    streak: data.streak || {
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: todayStr,
    },
    weekly_progress: data.weekly_progress || [],
    created_at: convertTimestamp(data.created_at),
    updated_at: convertTimestamp(data.updated_at),
  };
  
  return profile;
};

export const createProfile = async (userId: string, data: Partial<Profile>): Promise<Profile> => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const profileData = {
    user_id: userId,
    display_name: data.display_name || null,
    username: data.username || null,
    role: data.role || 'cyber_learner',
    avatar_url: data.avatar_url || null,
    language_preference: data.language_preference || 'en',
    normicyte_score: 0,
    cases_solved: 0,
    missions_completed: 0,
    accuracy_percentage: 0,
    total_xp: 0,
    profile_completed: false,
    badges: [],
    streak: {
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: todayStr,
    },
    weekly_progress: [],
    created_at: now,
    updated_at: now,
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.PROFILES), {
    ...profileData,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return { id: docRef.id, ...profileData } as Profile;
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<void> => {
  const profile = await getProfile(userId);
  if (!profile) throw new Error('Profile not found');

  await updateDoc(doc(db, COLLECTIONS.PROFILES, profile.id), {
    ...updates,
    updated_at: serverTimestamp(),
  });
};

// Cases operations
export const getCases = async (): Promise<Case[]> => {
  const q = query(collection(db, COLLECTIONS.CASES), orderBy('case_number'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Case));
};

export const getCase = async (caseId: string): Promise<Case | null> => {
  const docRef = doc(db, COLLECTIONS.CASES, caseId);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Case;
};

// Case Evidence operations
export const getCaseEvidence = async (caseId: string): Promise<CaseEvidence[]> => {
  const q = query(
    collection(db, COLLECTIONS.CASE_EVIDENCE),
    where('case_id', '==', caseId),
    orderBy('display_order')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CaseEvidence));
};

// Case Questions operations
export const getCaseQuestions = async (caseId: string): Promise<CaseQuestion[]> => {
  const q = query(
    collection(db, COLLECTIONS.CASE_QUESTIONS),
    where('case_id', '==', caseId),
    orderBy('display_order')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CaseQuestion));
};

// User Case Progress operations
export const getUserCaseProgress = async (
  userId: string
): Promise<Record<string, UserCaseProgress>> => {
  const q = query(
    collection(db, COLLECTIONS.USER_CASE_PROGRESS),
    where('user_id', '==', userId)
  );
  const snapshot = await getDocs(q);
  
  const progressMap: Record<string, UserCaseProgress> = {};
  snapshot.docs.forEach((doc) => {
    const data = { id: doc.id, ...doc.data() } as UserCaseProgress;
    progressMap[data.case_id] = data;
  });
  return progressMap;
};

export const getCaseProgress = async (
  userId: string,
  caseId: string
): Promise<UserCaseProgress | null> => {
  const q = query(
    collection(db, COLLECTIONS.USER_CASE_PROGRESS),
    where('user_id', '==', userId),
    where('case_id', '==', caseId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as UserCaseProgress;
};

export const createOrUpdateCaseProgress = async (
  userId: string,
  caseId: string,
  data: Partial<UserCaseProgress>
): Promise<void> => {
  const existing = await getCaseProgress(userId, caseId);
  
  if (existing) {
    await updateDoc(doc(db, COLLECTIONS.USER_CASE_PROGRESS, existing.id), {
      ...data,
      updated_at: serverTimestamp(),
    });
  } else {
    await addDoc(collection(db, COLLECTIONS.USER_CASE_PROGRESS), {
      user_id: userId,
      case_id: caseId,
      status: 'in_progress',
      current_question_index: 0,
      responses: [],
      score: null,
      verdict: null,
      feedback: [],
      started_at: serverTimestamp(),
      submitted_at: null,
      updated_at: serverTimestamp(),
      ...data,
    });
  }
};

export const updateCaseProgress = async (
  userId: string,
  caseId: string,
  updates: Partial<UserCaseProgress>
): Promise<void> => {
  const progress = await getCaseProgress(userId, caseId);
  if (!progress) throw new Error('Progress not found');

  await updateDoc(doc(db, COLLECTIONS.USER_CASE_PROGRESS, progress.id), {
    ...updates,
    updated_at: serverTimestamp(),
  });
};

// User Activity operations
export const getUserActivities = async (
  userId: string,
  limitCount: number = 10
): Promise<UserActivity[]> => {
  const q = query(
    collection(db, COLLECTIONS.USER_ACTIVITY),
    where('user_id', '==', userId),
    orderBy('created_at', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserActivity));
};

export const addUserActivity = async (
  userId: string,
  activity: Omit<UserActivity, 'id' | 'user_id' | 'created_at'>
): Promise<void> => {
  await addDoc(collection(db, COLLECTIONS.USER_ACTIVITY), {
    user_id: userId,
    ...activity,
    created_at: serverTimestamp(),
  });
};

// Progress tracking helpers
export const updateUserStreak = async (userId: string): Promise<void> => {
  const profile = await getProfile(userId);
  if (!profile) return;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const streak = profile.streak || { current_streak: 0, longest_streak: 0, last_activity_date: '' };
  
  let newStreak = streak.current_streak;
  
  if (streak.last_activity_date === today) {
    // Already logged today
    return;
  } else if (streak.last_activity_date === yesterday) {
    // Continue streak
    newStreak = streak.current_streak + 1;
  } else {
    // Streak broken, start new
    newStreak = 1;
  }
  
  const newLongest = Math.max(newStreak, streak.longest_streak);
  
  await updateProfile(userId, {
    streak: {
      current_streak: newStreak,
      longest_streak: newLongest,
      last_activity_date: today,
    },
  });
};

// Calculate and update profile stats after case completion
export const updateProfileStatsOnCaseComplete = async (
  userId: string,
  caseXpReward: number,
  caseScore: number
): Promise<void> => {
  const profile = await getProfile(userId);
  if (!profile) return;

  // Get all completed cases for accurate stats
  const progressData = await getUserCaseProgress(userId);
  const completedCases = Object.values(progressData).filter(
    (p) => p.status === 'reviewed' || p.status === 'submitted'
  );
  
  const totalCases = completedCases.length;
  const totalScore = completedCases.reduce((sum, p) => sum + (p.score || 0), 0);
  const avgAccuracy = totalCases > 0 ? Math.round(totalScore / totalCases) : 0;
  
  // Calculate new NormiCyte score (weighted formula)
  const baseScore = totalCases * 50; // 50 points per case
  const accuracyBonus = Math.round(avgAccuracy * 2); // Up to 200 bonus for 100% accuracy
  const newNormiCyteScore = baseScore + accuracyBonus;
  
  const newTotalXp = (profile.total_xp || 0) + caseXpReward;

  await updateProfile(userId, {
    cases_solved: totalCases,
    accuracy_percentage: avgAccuracy,
    normicyte_score: newNormiCyteScore,
    total_xp: newTotalXp,
  });

  // Update streak
  await updateUserStreak(userId);
  
  // Check and award badges
  await checkAndAwardBadges(userId);
};

// Badge system
export const checkAndAwardBadges = async (userId: string): Promise<string[]> => {
  const profile = await getProfile(userId);
  if (!profile) return [];

  const currentBadgeIds = (profile.badges || []).map((b) => b.badge_id);
  const newBadges: string[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    const badgeId = badge.name_en.toLowerCase().replace(/\s+/g, '_');
    if (currentBadgeIds.includes(badgeId)) continue;

    let earned = false;
    switch (badge.requirement_type) {
      case 'cases_solved':
        earned = profile.cases_solved >= badge.requirement_value;
        break;
      case 'accuracy':
        earned = profile.accuracy_percentage >= badge.requirement_value;
        break;
      case 'streak_days':
        earned = (profile.streak?.current_streak || 0) >= badge.requirement_value;
        break;
      case 'score_reached':
        earned = profile.normicyte_score >= badge.requirement_value;
        break;
    }

    if (earned) {
      newBadges.push(badgeId);
    }
  }

  if (newBadges.length > 0) {
    const updatedBadges = [
      ...(profile.badges || []),
      ...newBadges.map((id) => ({
        badge_id: id,
        earned_at: new Date(),
      })),
    ];
    await updateProfile(userId, { badges: updatedBadges });
  }

  return newBadges;
};

// Weekly progress tracking
export const updateWeeklyProgress = async (
  userId: string,
  scoreChange: number,
  casesCompleted: number,
  xpEarned: number
): Promise<void> => {
  const profile = await getProfile(userId);
  if (!profile) return;

  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const weeklyProgress = profile.weekly_progress || [];
  const currentWeekIndex = weeklyProgress.findIndex(
    (w) => w.week_start === weekStartStr
  );

  if (currentWeekIndex >= 0) {
    weeklyProgress[currentWeekIndex] = {
      ...weeklyProgress[currentWeekIndex],
      score_change: weeklyProgress[currentWeekIndex].score_change + scoreChange,
      cases_completed: weeklyProgress[currentWeekIndex].cases_completed + casesCompleted,
      xp_earned: weeklyProgress[currentWeekIndex].xp_earned + xpEarned,
    };
  } else {
    weeklyProgress.push({
      week_start: weekStartStr,
      score_change: scoreChange,
      cases_completed: casesCompleted,
      missions_completed: 0,
      xp_earned: xpEarned,
    });
  }

  // Keep only last 12 weeks
  const trimmedProgress = weeklyProgress.slice(-12);
  await updateProfile(userId, { weekly_progress: trimmedProgress });
};

// Get current week's score change
export const getWeeklyScoreChange = (profile: Profile): number => {
  if (!profile.weekly_progress || profile.weekly_progress.length === 0) return 0;
  
  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  
  const currentWeek = profile.weekly_progress.find(w => w.week_start === weekStartStr);
  return currentWeek?.score_change || 0;
};

// ==========================================
// MISSIONS OPERATIONS
// ==========================================

import type {
  Mission,
  UserMissionProgress,
  Campaign,
  UserCampaignProgress,
  UserPhishingProgress,
  PhishingStats,
  SecurityTip,
} from './types';

export const getMissions = async (): Promise<Mission[]> => {
  const q = query(
    collection(db, COLLECTIONS.MISSIONS),
    where('is_active', '==', true),
    orderBy('display_order')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Mission));
};

export const getMission = async (missionId: string): Promise<Mission | null> => {
  const docRef = doc(db, COLLECTIONS.MISSIONS, missionId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Mission;
};

export const getUserMissionProgress = async (
  userId: string
): Promise<Record<string, UserMissionProgress>> => {
  const q = query(
    collection(db, COLLECTIONS.USER_MISSIONS),
    where('user_id', '==', userId)
  );
  const snapshot = await getDocs(q);
  
  const progressMap: Record<string, UserMissionProgress> = {};
  snapshot.docs.forEach((doc) => {
    const data = { id: doc.id, ...doc.data() } as UserMissionProgress;
    progressMap[data.mission_id] = data;
  });
  return progressMap;
};

export const getMissionProgress = async (
  userId: string,
  missionId: string
): Promise<UserMissionProgress | null> => {
  const q = query(
    collection(db, COLLECTIONS.USER_MISSIONS),
    where('user_id', '==', userId),
    where('mission_id', '==', missionId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as UserMissionProgress;
};

export const startMission = async (
  userId: string,
  missionId: string
): Promise<void> => {
  const existing = await getMissionProgress(userId, missionId);
  
  if (existing) {
    await updateDoc(doc(db, COLLECTIONS.USER_MISSIONS, existing.id), {
      status: 'in_progress',
      started_at: existing.started_at || serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  } else {
    await addDoc(collection(db, COLLECTIONS.USER_MISSIONS), {
      user_id: userId,
      mission_id: missionId,
      status: 'in_progress',
      progress_percentage: 0,
      current_section_index: 0,
      quiz_score: null,
      quiz_responses: [],
      xp_earned: 0,
      started_at: serverTimestamp(),
      completed_at: null,
      updated_at: serverTimestamp(),
    });
  }
};

export const updateMissionProgress = async (
  userId: string,
  missionId: string,
  updates: Partial<UserMissionProgress>
): Promise<void> => {
  const progress = await getMissionProgress(userId, missionId);
  if (!progress) throw new Error('Mission progress not found');

  await updateDoc(doc(db, COLLECTIONS.USER_MISSIONS, progress.id), {
    ...updates,
    updated_at: serverTimestamp(),
  });
};

export const completeMission = async (
  userId: string,
  missionId: string,
  quizScore: number,
  xpEarned: number
): Promise<void> => {
  const progress = await getMissionProgress(userId, missionId);
  if (!progress) throw new Error('Mission progress not found');

  await updateDoc(doc(db, COLLECTIONS.USER_MISSIONS, progress.id), {
    status: 'completed',
    progress_percentage: 100,
    quiz_score: quizScore,
    xp_earned: xpEarned,
    completed_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  // Update profile stats
  const profile = await getProfile(userId);
  if (profile) {
    await updateProfile(userId, {
      missions_completed: (profile.missions_completed || 0) + 1,
      total_xp: (profile.total_xp || 0) + xpEarned,
    });
  }

  // Add activity
  const mission = await getMission(missionId);
  if (mission) {
    await addUserActivity(userId, {
      activity_type: 'mission_completed',
      title_en: `Completed mission: ${mission.title_en}`,
      title_hi: `मिशन पूरा: ${mission.title_hi}`,
      xp_earned: xpEarned,
    });
  }

  await updateUserStreak(userId);
  await checkAndAwardBadges(userId);
};

// ==========================================
// CAMPAIGNS OPERATIONS
// ==========================================

export const getCampaigns = async (): Promise<Campaign[]> => {
  const q = query(
    collection(db, COLLECTIONS.CAMPAIGNS),
    orderBy('start_date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      start_date: convertTimestamp(data.start_date),
      end_date: convertTimestamp(data.end_date),
      created_at: convertTimestamp(data.created_at),
    } as Campaign;
  });
};

export const getCampaign = async (campaignId: string): Promise<Campaign | null> => {
  const docRef = doc(db, COLLECTIONS.CAMPAIGNS, campaignId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    start_date: convertTimestamp(data.start_date),
    end_date: convertTimestamp(data.end_date),
    created_at: convertTimestamp(data.created_at),
  } as Campaign;
};

export const getUserCampaignProgress = async (
  userId: string
): Promise<Record<string, UserCampaignProgress>> => {
  const q = query(
    collection(db, COLLECTIONS.USER_CAMPAIGNS),
    where('user_id', '==', userId)
  );
  const snapshot = await getDocs(q);
  
  const progressMap: Record<string, UserCampaignProgress> = {};
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    progressMap[data.campaign_id] = {
      id: doc.id,
      ...data,
      joined_at: convertTimestamp(data.joined_at),
      completed_at: data.completed_at ? convertTimestamp(data.completed_at) : null,
      updated_at: convertTimestamp(data.updated_at),
    } as UserCampaignProgress;
  });
  return progressMap;
};

export const joinCampaign = async (
  userId: string,
  campaignId: string
): Promise<void> => {
  const existingProgress = await getUserCampaignProgress(userId);
  
  if (existingProgress[campaignId]) {
    // Rejoin if previously left
    await updateDoc(doc(db, COLLECTIONS.USER_CAMPAIGNS, existingProgress[campaignId].id), {
      status: 'joined',
      updated_at: serverTimestamp(),
    });
  } else {
    await addDoc(collection(db, COLLECTIONS.USER_CAMPAIGNS), {
      user_id: userId,
      campaign_id: campaignId,
      joined_at: serverTimestamp(),
      status: 'joined',
      missions_completed: 0,
      total_xp_earned: 0,
      notify_on_start: false,
      completed_at: null,
      updated_at: serverTimestamp(),
    });
  }

  // Add activity
  const campaign = await getCampaign(campaignId);
  if (campaign) {
    await addUserActivity(userId, {
      activity_type: 'campaign_joined',
      title_en: `Joined campaign: ${campaign.title_en}`,
      title_hi: `अभियान में शामिल: ${campaign.title_hi}`,
      xp_earned: 0,
    });
  }
};

export const leaveCampaign = async (
  userId: string,
  campaignId: string
): Promise<void> => {
  const progress = await getUserCampaignProgress(userId);
  if (!progress[campaignId]) return;

  await updateDoc(doc(db, COLLECTIONS.USER_CAMPAIGNS, progress[campaignId].id), {
    status: 'left',
    updated_at: serverTimestamp(),
  });
};

export const setNotifyOnCampaignStart = async (
  userId: string,
  campaignId: string,
  notify: boolean
): Promise<void> => {
  const progress = await getUserCampaignProgress(userId);
  
  if (progress[campaignId]) {
    await updateDoc(doc(db, COLLECTIONS.USER_CAMPAIGNS, progress[campaignId].id), {
      notify_on_start: notify,
      updated_at: serverTimestamp(),
    });
  } else {
    await addDoc(collection(db, COLLECTIONS.USER_CAMPAIGNS), {
      user_id: userId,
      campaign_id: campaignId,
      joined_at: serverTimestamp(),
      status: 'joined',
      missions_completed: 0,
      total_xp_earned: 0,
      notify_on_start: notify,
      completed_at: null,
      updated_at: serverTimestamp(),
    });
  }
};

export const getCampaignParticipantCount = async (campaignId: string): Promise<number> => {
  const q = query(
    collection(db, COLLECTIONS.USER_CAMPAIGNS),
    where('campaign_id', '==', campaignId),
    where('status', 'in', ['joined', 'in_progress', 'completed'])
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};

// ==========================================
// PHISHING SIMULATOR OPERATIONS
// ==========================================

export const savePhishingAttempt = async (
  userId: string,
  scenarioId: string,
  scenarioType: 'email' | 'chat' | 'website' | 'upi',
  isCorrect: boolean,
  actionTaken: 'report' | 'ignore' | 'click'
): Promise<number> => {
  const xpEarned = isCorrect ? 10 : 0;
  
  await addDoc(collection(db, COLLECTIONS.USER_PHISHING_PROGRESS), {
    user_id: userId,
    scenario_id: scenarioId,
    scenario_type: scenarioType,
    is_correct: isCorrect,
    action_taken: actionTaken,
    xp_earned: xpEarned,
    completed_at: serverTimestamp(),
  });

  // Update profile XP if correct
  if (isCorrect) {
    const profile = await getProfile(userId);
    if (profile) {
      await updateProfile(userId, {
        total_xp: (profile.total_xp || 0) + xpEarned,
      });
    }
  }

  await updateUserStreak(userId);
  return xpEarned;
};

export const getPhishingStats = async (userId: string): Promise<PhishingStats> => {
  const q = query(
    collection(db, COLLECTIONS.USER_PHISHING_PROGRESS),
    where('user_id', '==', userId)
  );
  const snapshot = await getDocs(q);
  
  const stats: PhishingStats = {
    total_scenarios: 0,
    correct_identifications: 0,
    accuracy_percentage: 0,
    total_xp_earned: 0,
    scenarios_by_type: {
      email: 0,
      chat: 0,
      website: 0,
      upi: 0,
    },
  };

  snapshot.docs.forEach((doc) => {
    const data = doc.data() as UserPhishingProgress;
    stats.total_scenarios++;
    if (data.is_correct) stats.correct_identifications++;
    stats.total_xp_earned += data.xp_earned || 0;
    if (data.scenario_type in stats.scenarios_by_type) {
      stats.scenarios_by_type[data.scenario_type]++;
    }
  });

  stats.accuracy_percentage = stats.total_scenarios > 0
    ? Math.round((stats.correct_identifications / stats.total_scenarios) * 100)
    : 0;

  return stats;
};

export const getCompletedPhishingScenarios = async (userId: string): Promise<string[]> => {
  const q = query(
    collection(db, COLLECTIONS.USER_PHISHING_PROGRESS),
    where('user_id', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data().scenario_id);
};

// ==========================================
// SECURITY TIPS OPERATIONS
// ==========================================

export const getSecurityTips = async (limitCount: number = 5): Promise<SecurityTip[]> => {
  const q = query(
    collection(db, COLLECTIONS.SECURITY_TIPS),
    where('is_active', '==', true),
    orderBy('display_order'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    created_at: convertTimestamp(doc.data().created_at),
  } as SecurityTip));
};

// Default security tips (fallback when no tips in Firebase)
export const DEFAULT_SECURITY_TIPS: Omit<SecurityTip, 'id' | 'created_at'>[] = [
  {
    title_en: 'Never Share OTP',
    title_hi: 'OTP कभी साझा न करें',
    content_en: 'Banks and legitimate services never ask for your OTP over phone or message.',
    content_hi: 'बैंक और वैध सेवाएं कभी भी फोन या संदेश पर आपका OTP नहीं मांगती।',
    category: 'upi',
    severity: 'high',
    icon: 'shield',
    is_active: true,
    display_order: 1,
  },
  {
    title_en: 'Check URL Before Login',
    title_hi: 'लॉगिन से पहले URL जांचें',
    content_en: 'Always verify the website URL before entering login credentials.',
    content_hi: 'लॉगिन क्रेडेंशियल डालने से पहले हमेशा वेबसाइट URL सत्यापित करें।',
    category: 'phishing',
    severity: 'high',
    icon: 'globe',
    is_active: true,
    display_order: 2,
  },
  {
    title_en: 'Use Strong Passwords',
    title_hi: 'मजबूत पासवर्ड का उपयोग करें',
    content_en: 'Create unique passwords with mix of letters, numbers, and symbols.',
    content_hi: 'अक्षरों, संख्याओं और प्रतीकों के मिश्रण से अद्वितीय पासवर्ड बनाएं।',
    category: 'password',
    severity: 'medium',
    icon: 'lock',
    is_active: true,
    display_order: 3,
  },
  {
    title_en: 'Beware of Urgent Messages',
    title_hi: 'जल्दबाजी वाले संदेशों से सावधान रहें',
    content_en: 'Scammers create urgency to make you act without thinking.',
    content_hi: 'धोखेबाज आपको बिना सोचे-समझे कार्य करने के लिए जल्दबाजी पैदा करते हैं।',
    category: 'general',
    severity: 'medium',
    icon: 'alert',
    is_active: true,
    display_order: 4,
  },
  {
    title_en: 'Verify Caller Identity',
    title_hi: 'कॉलर की पहचान सत्यापित करें',
    content_en: 'Never share personal info with unknown callers claiming to be from banks.',
    content_hi: 'बैंक से होने का दावा करने वाले अज्ञात कॉलर्स के साथ व्यक्तिगत जानकारी साझा न करें।',
    category: 'phishing',
    severity: 'high',
    icon: 'phone',
    is_active: true,
    display_order: 5,
  },
];

// Default missions (fallback when no missions in Firebase)
export const DEFAULT_MISSIONS: Omit<Mission, 'id' | 'created_at'>[] = [
  {
    title_en: 'Spot the Phish',
    title_hi: 'फिशिंग पहचानें',
    description_en: 'Learn to identify phishing emails, messages, and websites',
    description_hi: 'फिशिंग ईमेल, संदेश और वेबसाइटों की पहचान करना सीखें',
    icon: 'zap',
    xp_reward: 100,
    duration_minutes: 10,
    difficulty: 'easy',
    category: 'phishing',
    content_type: 'quiz',
    is_active: true,
    display_order: 1,
    content: {
      introduction_en: 'Phishing is one of the most common cyber attacks. Learn to identify fake emails and messages.',
      introduction_hi: 'फिशिंग सबसे आम साइबर हमलों में से एक है। नकली ईमेल और संदेशों की पहचान करना सीखें।',
      sections: [
        {
          title_en: 'What is Phishing?',
          title_hi: 'फिशिंग क्या है?',
          content_en: 'Phishing is a type of social engineering attack where attackers impersonate legitimate organizations to steal sensitive information like passwords, credit card numbers, or personal data.',
          content_hi: 'फिशिंग एक प्रकार का सोशल इंजीनियरिंग हमला है जहां हमलावर पासवर्ड, क्रेडिट कार्ड नंबर, या व्यक्तिगत डेटा जैसी संवेदनशील जानकारी चुराने के लिए वैध संगठनों का रूप धारण करते हैं।',
        },
        {
          title_en: 'Red Flags to Watch For',
          title_hi: 'सावधान रहने के संकेत',
          content_en: 'Look for: Misspelled domains, urgent language, generic greetings, suspicious links, and requests for sensitive information.',
          content_hi: 'देखें: गलत वर्तनी वाले डोमेन, जल्दबाजी वाली भाषा, सामान्य अभिवादन, संदिग्ध लिंक, और संवेदनशील जानकारी के अनुरोध।',
        },
      ],
      quiz: [
        {
          question_en: 'An email from "support@amaz0n.com" asks you to verify your account. What should you do?',
          question_hi: '"support@amaz0n.com" से एक ईमेल आपके खाते को सत्यापित करने के लिए कहता है। आपको क्या करना चाहिए?',
          options: ['Click the link and verify', 'Report as phishing', 'Reply with your details', 'Forward to friends'],
          correct_index: 1,
          explanation_en: 'The domain uses "0" instead of "o" - a common phishing trick!',
          explanation_hi: 'डोमेन "o" के बजाय "0" का उपयोग करता है - एक आम फिशिंग चाल!',
        },
      ],
    },
  },
  {
    title_en: 'Secure Passwords',
    title_hi: 'सुरक्षित पासवर्ड',
    description_en: 'Create and manage strong, unbreakable passwords',
    description_hi: 'मजबूत, अटूट पासवर्ड बनाएं और प्रबंधित करें',
    icon: 'lock',
    xp_reward: 150,
    duration_minutes: 15,
    difficulty: 'easy',
    category: 'passwords',
    content_type: 'quiz',
    is_active: true,
    display_order: 2,
    content: {
      introduction_en: 'Strong passwords are your first line of defense against hackers.',
      introduction_hi: 'मजबूत पासवर्ड हैकर्स के खिलाफ आपकी रक्षा की पहली पंक्ति है।',
      sections: [
        {
          title_en: 'Creating Strong Passwords',
          title_hi: 'मजबूत पासवर्ड बनाना',
          content_en: 'Use at least 12 characters, mix uppercase and lowercase letters, numbers, and special characters.',
          content_hi: 'कम से कम 12 अक्षरों का उपयोग करें, बड़े और छोटे अक्षरों, संख्याओं और विशेष वर्णों का मिश्रण करें।',
        },
      ],
      quiz: [
        {
          question_en: 'Which password is the strongest?',
          question_hi: 'कौन सा पासवर्ड सबसे मजबूत है?',
          options: ['password123', 'MyName@2024', 'X#9kL$mN!2qR', '12345678'],
          correct_index: 2,
          explanation_en: 'Random combinations of characters are much harder to crack.',
          explanation_hi: 'वर्णों के यादृच्छिक संयोजन को तोड़ना बहुत कठिन है।',
        },
      ],
    },
  },
  {
    title_en: 'UPI Safety',
    title_hi: 'UPI सुरक्षा',
    description_en: 'Protect your UPI transactions from fraudsters',
    description_hi: 'अपने UPI लेनदेन को धोखेबाजों से बचाएं',
    icon: 'smartphone',
    xp_reward: 120,
    duration_minutes: 12,
    difficulty: 'medium',
    category: 'payments',
    content_type: 'quiz',
    is_active: true,
    display_order: 3,
    content: {
      introduction_en: 'UPI fraud is on the rise. Learn how to protect yourself.',
      introduction_hi: 'UPI धोखाधड़ी बढ़ रही है। अपनी सुरक्षा करना सीखें।',
      sections: [
        {
          title_en: 'Common UPI Scams',
          title_hi: 'आम UPI घोटाले',
          content_en: 'Fraudsters use collect requests, fake refunds, and QR code scams to steal money.',
          content_hi: 'धोखेबाज पैसे चुराने के लिए कलेक्ट रिक्वेस्ट, नकली रिफंड और QR कोड घोटालों का उपयोग करते हैं।',
        },
      ],
      quiz: [
        {
          question_en: 'Someone says they will send you money but asks you to "approve a collect request". What should you do?',
          question_hi: 'कोई कहता है कि वे आपको पैसे भेजेंगे लेकिन "कलेक्ट रिक्वेस्ट स्वीकृत" करने के लिए कहता है। आपको क्या करना चाहिए?',
          options: ['Approve it', 'Decline it', 'Ask for more money', 'Share your PIN'],
          correct_index: 1,
          explanation_en: 'To receive money, you never need to approve anything. This is a scam!',
          explanation_hi: 'पैसे प्राप्त करने के लिए, आपको कभी भी कुछ भी स्वीकृत करने की आवश्यकता नहीं है। यह एक घोटाला है!',
        },
      ],
    },
  },
  {
    title_en: 'Social Media Privacy',
    title_hi: 'सोशल मीडिया प्राइवेसी',
    description_en: 'Audit and secure your social media accounts',
    description_hi: 'अपने सोशल मीडिया खातों का ऑडिट और सुरक्षित करें',
    icon: 'eye',
    xp_reward: 200,
    duration_minutes: 20,
    difficulty: 'medium',
    category: 'privacy',
    content_type: 'quiz',
    is_active: true,
    display_order: 4,
    content: {
      introduction_en: 'Your social media profiles can reveal a lot about you. Learn to protect your privacy.',
      introduction_hi: 'आपकी सोशल मीडिया प्रोफाइल आपके बारे में बहुत कुछ बता सकती है। अपनी प्राइवेसी की रक्षा करना सीखें।',
      sections: [],
      quiz: [],
    },
  },
  {
    title_en: 'Fake Website Detection',
    title_hi: 'नकली वेबसाइट पहचान',
    description_en: 'Spot fake websites and avoid credential theft',
    description_hi: 'नकली वेबसाइटों को पहचानें और क्रेडेंशियल चोरी से बचें',
    icon: 'globe',
    xp_reward: 180,
    duration_minutes: 15,
    difficulty: 'hard',
    category: 'websites',
    content_type: 'quiz',
    is_active: true,
    display_order: 5,
    content: {
      introduction_en: 'Fake websites look identical to real ones. Learn to spot the differences.',
      introduction_hi: 'नकली वेबसाइटें असली वेबसाइटों जैसी दिखती हैं। अंतर पहचानना सीखें।',
      sections: [],
      quiz: [],
    },
  },
  {
    title_en: 'OTP Protection',
    title_hi: 'OTP सुरक्षा',
    description_en: 'Understand OTP security and prevent OTP fraud',
    description_hi: 'OTP सुरक्षा को समझें और OTP धोखाधड़ी को रोकें',
    icon: 'key',
    xp_reward: 100,
    duration_minutes: 8,
    difficulty: 'easy',
    category: 'security',
    content_type: 'quiz',
    is_active: true,
    display_order: 6,
    content: {
      introduction_en: 'OTP is your second line of defense. Never share it with anyone.',
      introduction_hi: 'OTP आपकी रक्षा की दूसरी पंक्ति है। इसे कभी किसी के साथ साझा न करें।',
      sections: [],
      quiz: [],
    },
  },
];

// Default campaigns (fallback when no campaigns in Firebase)
export const DEFAULT_CAMPAIGNS: Omit<Campaign, 'id' | 'created_at'>[] = [
  {
    title_en: 'UPI Safety Week',
    title_hi: 'UPI सुरक्षा सप्ताह',
    description_en: 'A week-long campaign to educate users about UPI payment safety and fraud prevention.',
    description_hi: 'UPI भुगतान सुरक्षा और धोखाधड़ी रोकथाम के बारे में उपयोगकर्ताओं को शिक्षित करने के लिए एक सप्ताह का अभियान।',
    icon: '💳',
    gradient: 'from-neon-cyan/20 via-neon-blue/10 to-transparent',
    start_date: new Date('2026-01-06'),
    end_date: new Date('2026-01-20'),
    mission_ids: [],
    total_xp: 500,
    status: 'active',
    is_featured: true,
  },
  {
    title_en: 'Phishing Awareness Month',
    title_hi: 'फिशिंग जागरूकता माह',
    description_en: 'Learn to identify and report phishing attempts across email, SMS, and social media.',
    description_hi: 'ईमेल, SMS और सोशल मीडिया पर फिशिंग प्रयासों की पहचान और रिपोर्ट करना सीखें।',
    icon: '🎣',
    gradient: 'from-neon-violet/20 via-neon-blue/10 to-transparent',
    start_date: new Date('2026-02-01'),
    end_date: new Date('2026-02-28'),
    mission_ids: [],
    total_xp: 800,
    status: 'upcoming',
    is_featured: false,
  },
  {
    title_en: 'Social Media Privacy',
    title_hi: 'सोशल मीडिया प्राइवेसी',
    description_en: 'Audit and improve your social media privacy settings to protect personal information.',
    description_hi: 'व्यक्तिगत जानकारी की सुरक्षा के लिए अपनी सोशल मीडिया प्राइवेसी सेटिंग्स का ऑडिट और सुधार करें।',
    icon: '🔒',
    gradient: 'from-neon-blue/20 via-neon-cyan/10 to-transparent',
    start_date: new Date('2026-03-01'),
    end_date: new Date('2026-03-31'),
    mission_ids: [],
    total_xp: 1000,
    status: 'upcoming',
    is_featured: false,
  },
];
