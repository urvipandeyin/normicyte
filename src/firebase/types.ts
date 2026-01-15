// TypeScript types for Firebase collections

export interface Badge {
  id: string;
  name_en: string;
  name_hi: string;
  description_en: string;
  description_hi: string;
  icon: string;
  category: 'achievement' | 'streak' | 'skill' | 'milestone';
  requirement_type: 'cases_solved' | 'score_reached' | 'streak_days' | 'accuracy' | 'special';
  requirement_value: number;
}

export interface UserBadge {
  badge_id: string;
  earned_at: Date;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string; // YYYY-MM-DD format
}

export interface WeeklyProgress {
  week_start: string; // YYYY-MM-DD format
  score_change: number;
  cases_completed: number;
  missions_completed: number;
  xp_earned: number;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  role: string | null;
  avatar_url: string | null;
  language_preference: string;
  normicyte_score: number;
  cases_solved: number;
  missions_completed: number;
  accuracy_percentage: number;
  total_xp: number;
  profile_completed: boolean;
  badges: UserBadge[];
  streak: StreakData;
  weekly_progress: WeeklyProgress[];
  created_at: Date;
  updated_at: Date;
}

export interface Case {
  id: string;
  case_number: string;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  brief_en: string;
  brief_hi: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  threat_type: string;
  xp_reward: number;
  created_at: Date;
}

export interface CaseEvidence {
  id: string;
  case_id: string;
  evidence_type: 'email' | 'chat' | 'url' | 'transaction' | 'document';
  content_en: string;
  content_hi: string;
  display_order: number;
}

export interface CaseQuestion {
  id: string;
  case_id: string;
  question_en: string;
  question_hi: string;
  question_type: 'multiple_choice' | 'multi_select' | 'yes_no_reasoning' | 'short_answer';
  options: string[] | null;
  correct_answer: {
    answer?: string;
    answers?: string[];
    keywords?: string[];
  };
  explanation_en: string;
  explanation_hi: string;
  display_order: number;
}

export interface UserCaseProgress {
  id: string;
  user_id: string;
  case_id: string;
  status: 'in_progress' | 'submitted' | 'reviewed';
  current_question_index: number;
  responses: any[];
  score: number | null;
  verdict: 'solved' | 'partially_solved' | 'needs_improvement' | null;
  feedback: any[];
  started_at: Date;
  submitted_at: Date | null;
  updated_at: Date;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  title_en: string;
  title_hi: string;
  xp_earned: number;
  created_at: Date;
}

// Mission types
export interface Mission {
  id: string;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  icon: string;
  xp_reward: number;
  duration_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  content_type: 'quiz' | 'interactive' | 'reading' | 'simulation';
  content: MissionContent;
  is_active: boolean;
  display_order: number;
  created_at: Date;
}

export interface MissionContent {
  introduction_en: string;
  introduction_hi: string;
  sections: MissionSection[];
  quiz?: MissionQuiz[];
}

export interface MissionSection {
  title_en: string;
  title_hi: string;
  content_en: string;
  content_hi: string;
  image_url?: string;
}

export interface MissionQuiz {
  question_en: string;
  question_hi: string;
  options: string[];
  correct_index: number;
  explanation_en: string;
  explanation_hi: string;
}

export interface UserMissionProgress {
  id: string;
  user_id: string;
  mission_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  current_section_index: number;
  quiz_score: number | null;
  quiz_responses: number[];
  xp_earned: number;
  started_at: Date | null;
  completed_at: Date | null;
  updated_at: Date;
}

// Campaign types
export interface Campaign {
  id: string;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  icon: string;
  gradient: string;
  start_date: Date;
  end_date: Date;
  mission_ids: string[];
  total_xp: number;
  status: 'draft' | 'active' | 'upcoming' | 'completed';
  is_featured: boolean;
  created_at: Date;
}

export interface UserCampaignProgress {
  id: string;
  user_id: string;
  campaign_id: string;
  joined_at: Date;
  status: 'joined' | 'in_progress' | 'completed' | 'left';
  missions_completed: number;
  total_xp_earned: number;
  notify_on_start: boolean;
  completed_at: Date | null;
  updated_at: Date;
}

// Phishing simulator types
export interface UserPhishingProgress {
  id: string;
  user_id: string;
  scenario_id: string;
  scenario_type: 'email' | 'chat' | 'website' | 'upi';
  is_correct: boolean;
  action_taken: 'report' | 'ignore' | 'click';
  xp_earned: number;
  completed_at: Date;
}

export interface PhishingStats {
  total_scenarios: number;
  correct_identifications: number;
  accuracy_percentage: number;
  total_xp_earned: number;
  scenarios_by_type: {
    email: number;
    chat: number;
    website: number;
    upi: number;
  };
}

// Security tips for ThreatFeed
export interface SecurityTip {
  id: string;
  title_en: string;
  title_hi: string;
  content_en: string;
  content_hi: string;
  category: 'phishing' | 'password' | 'upi' | 'social' | 'general';
  severity: 'low' | 'medium' | 'high';
  icon: string;
  is_active: boolean;
  display_order: number;
  created_at: Date;
}

// Collection names as constants
export const COLLECTIONS = {
  PROFILES: 'profiles',
  CASES: 'cases',
  CASE_EVIDENCE: 'case_evidence',
  CASE_QUESTIONS: 'case_questions',
  USER_CASE_PROGRESS: 'user_case_progress',
  USER_ACTIVITY: 'user_activity',
  BADGES: 'badges',
  MISSIONS: 'missions',
  USER_MISSIONS: 'user_missions',
  CAMPAIGNS: 'campaigns',
  USER_CAMPAIGNS: 'user_campaigns',
  USER_PHISHING_PROGRESS: 'user_phishing_progress',
  SECURITY_TIPS: 'security_tips',
} as const;

// Badge definitions for the achievement system
export const BADGE_DEFINITIONS: Omit<Badge, 'id'>[] = [
  {
    name_en: 'First Case',
    name_hi: 'पहला केस',
    description_en: 'Solved your first case',
    description_hi: 'अपना पहला केस हल किया',
    icon: '🔍',
    category: 'milestone',
    requirement_type: 'cases_solved',
    requirement_value: 1,
  },
  {
    name_en: 'Detective',
    name_hi: 'जासूस',
    description_en: 'Solved 5 cases',
    description_hi: '5 केस हल किए',
    icon: '🕵️',
    category: 'milestone',
    requirement_type: 'cases_solved',
    requirement_value: 5,
  },
  {
    name_en: 'Master Investigator',
    name_hi: 'मास्टर जांचकर्ता',
    description_en: 'Solved 10 cases',
    description_hi: '10 केस हल किए',
    icon: '🏆',
    category: 'milestone',
    requirement_type: 'cases_solved',
    requirement_value: 10,
  },
  {
    name_en: 'Sharp Eye',
    name_hi: 'तेज नज़र',
    description_en: 'Achieved 80% accuracy',
    description_hi: '80% सटीकता हासिल की',
    icon: '🎯',
    category: 'skill',
    requirement_type: 'accuracy',
    requirement_value: 80,
  },
  {
    name_en: 'Perfectionist',
    name_hi: 'परफेक्शनिस्ट',
    description_en: 'Achieved 95% accuracy',
    description_hi: '95% सटीकता हासिल की',
    icon: '💎',
    category: 'skill',
    requirement_type: 'accuracy',
    requirement_value: 95,
  },
  {
    name_en: 'Week Warrior',
    name_hi: 'सप्ताह योद्धा',
    description_en: '7 day activity streak',
    description_hi: '7 दिन की गतिविधि लकीर',
    icon: '🔥',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 7,
  },
  {
    name_en: 'Cyber Guardian',
    name_hi: 'साइबर गार्डियन',
    description_en: 'Reached 500 NormiCyte score',
    description_hi: '500 नॉर्मीसाइट स्कोर तक पहुंचे',
    icon: '🛡️',
    category: 'achievement',
    requirement_type: 'score_reached',
    requirement_value: 500,
  },
  {
    name_en: 'Elite Agent',
    name_hi: 'एलीट एजेंट',
    description_en: 'Reached 1000 NormiCyte score',
    description_hi: '1000 नॉर्मीसाइट स्कोर तक पहुंचे',
    icon: '⭐',
    category: 'achievement',
    requirement_type: 'score_reached',
    requirement_value: 1000,
  },
];
