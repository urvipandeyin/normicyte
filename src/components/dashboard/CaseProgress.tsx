import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getCases, getUserCaseProgress, getCaseQuestions } from '@/firebase/database';
import { Search, Trophy, Clock, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface CaseWithProgress {
  id: string;
  case_number: string;
  title_en: string;
  title_hi: string;
  difficulty: string;
  xp_reward: number;
  status: string;
  score: number | null;
  current_question_index: number;
  total_questions: number;
}

const CaseProgress: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCaseProgress();
    }
  }, [user]);

  const fetchCaseProgress = async () => {
    if (!user) return;

    try {
      // Fetch cases
      const casesData = await getCases();
      
      // Fetch user progress
      const progressData = await getUserCaseProgress(user.uid);

      // Count questions per case
      const questionCounts: Record<string, number> = {};
      for (const c of casesData) {
        const questions = await getCaseQuestions(c.id);
        questionCounts[c.id] = questions.length;
      }

      const combinedData = casesData.map(c => {
        const progress = progressData[c.id];
        return {
          id: c.id,
          case_number: c.case_number,
          title_en: c.title_en,
          title_hi: c.title_hi,
          difficulty: c.difficulty,
          xp_reward: c.xp_reward || 100,
          status: progress?.status || 'not_started',
          score: progress?.score ? Number(progress.score) : null,
          current_question_index: progress?.current_question_index || 0,
          total_questions: questionCounts[c.id] || 5,
        };
      });

      setCases(combinedData);
    } catch (error) {
      console.error('Error fetching case progress:', error);
    }
    setLoading(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success bg-success/10 border-success/30';
      case 'medium': return 'text-warning bg-warning/10 border-warning/30';
      case 'hard': return 'text-destructive bg-destructive/10 border-destructive/30';
      default: return 'text-muted-foreground bg-muted/10 border-muted/30';
    }
  };

  const getStatusBadge = (status: string, score: number | null) => {
    if (status === 'reviewed' || status === 'submitted') {
      return (
        <div className="flex items-center gap-1 text-xs font-medium text-success">
          <Trophy className="w-3 h-3" />
          {score !== null ? `${Math.round(score)}%` : 'Done'}
        </div>
      );
    }
    if (status === 'in_progress') {
      return (
        <div className="flex items-center gap-1 text-xs font-medium text-warning">
          <Clock className="w-3 h-3" />
          {language === 'hi' ? 'जारी' : 'In Progress'}
        </div>
      );
    }
    return null;
  };

  const inProgressCases = cases.filter(c => c.status === 'in_progress');
  const completedCases = cases.filter(c => c.status === 'reviewed' || c.status === 'submitted');
  const availableCases = cases.filter(c => c.status === 'not_started');

  return (
    <div className="glass-card-glow p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {language === 'hi' ? 'डिजिटल डिटेक्टिव केसेज' : 'Digital Detective Cases'}
          </h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/detective')}
          className="text-primary hover:text-primary/80"
        >
          {language === 'hi' ? 'सभी देखें' : 'View All'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* In Progress */}
          {inProgressCases.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {language === 'hi' ? 'जारी' : 'In Progress'}
              </p>
              {inProgressCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate('/detective')}
                  className="p-4 rounded-xl bg-primary/5 border border-primary/30 hover:border-primary/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{c.case_number}</span>
                      <span className="font-medium text-foreground">
                        {language === 'hi' ? c.title_hi : c.title_en}
                      </span>
                    </div>
                    {getStatusBadge(c.status, c.score)}
                  </div>
                  <div className="space-y-1">
                    <Progress 
                      value={(c.current_question_index / c.total_questions) * 100} 
                      className="h-1.5" 
                    />
                    <p className="text-xs text-muted-foreground">
                      {c.current_question_index}/{c.total_questions} {language === 'hi' ? 'प्रश्न' : 'questions'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed */}
          {completedCases.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {language === 'hi' ? 'पूर्ण' : 'Completed'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {completedCases.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-success/5 border border-success/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate">
                        {language === 'hi' ? c.title_hi : c.title_en}
                      </span>
                      {getStatusBadge(c.status, c.score)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available */}
          {availableCases.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {language === 'hi' ? 'उपलब्ध' : 'Available'}
              </p>
              {availableCases.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate('/detective')}
                  className="p-3 rounded-xl bg-card/50 border border-border/30 hover:border-primary/30 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {language === 'hi' ? c.title_hi : c.title_en}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(c.difficulty)}`}>
                      {c.difficulty}
                    </span>
                  </div>
                  <span className="text-xs text-primary font-medium">+{c.xp_reward} XP</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaseProgress;
