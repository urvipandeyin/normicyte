import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Target, ChevronRight, Zap, Lock, Smartphone, Eye, Globe, Key, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getMissions, getUserMissionProgress, startMission, DEFAULT_MISSIONS } from '@/firebase/database';
import type { Mission, UserMissionProgress } from '@/firebase/types';
import { toast } from 'sonner';

const iconMap: Record<string, React.ElementType> = {
  zap: Zap,
  lock: Lock,
  smartphone: Smartphone,
  eye: Eye,
  globe: Globe,
  key: Key,
  book: BookOpen,
};

interface MissionWithProgress extends Mission {
  progress: number;
  status: 'active' | 'available' | 'completed';
}

const ActiveMissions: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [missions, setMissions] = useState<MissionWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMissions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Try to load from Firebase first
        let missionsList = await getMissions();
        
        // If no missions in Firebase, use defaults
        if (missionsList.length === 0) {
          missionsList = DEFAULT_MISSIONS.map((m, index) => ({
            id: (index + 1).toString(),
            ...m,
            created_at: new Date(),
          })) as Mission[];
        }

        // Get user progress
        const progressMap = await getUserMissionProgress(user.uid);

        // Combine missions with progress and take top 4
        const missionsWithProgress: MissionWithProgress[] = missionsList
          .map(mission => {
            const userProgress = progressMap[mission.id];
            let status: 'active' | 'available' | 'completed' = 'available';
            let progressPercent = 0;

            if (userProgress) {
              if (userProgress.status === 'completed') {
                status = 'completed';
                progressPercent = 100;
              } else if (userProgress.status === 'in_progress') {
                status = 'active';
                progressPercent = userProgress.progress_percentage || 0;
              }
            }

            return {
              ...mission,
              progress: progressPercent,
              status,
            };
          })
          .sort((a, b) => {
            // Sort: active first, then available, then completed
            const order = { active: 0, available: 1, completed: 2 };
            return order[a.status] - order[b.status];
          })
          .slice(0, 4);

        setMissions(missionsWithProgress);
      } catch (error) {
        console.error('Error loading missions:', error);
        // Use default missions on error
        const defaultMissionsWithProgress: MissionWithProgress[] = DEFAULT_MISSIONS
          .slice(0, 4)
          .map((m, index) => ({
            id: (index + 1).toString(),
            ...m,
            created_at: new Date(),
            progress: 0,
            status: 'available' as const,
          }));
        setMissions(defaultMissionsWithProgress);
      } finally {
        setLoading(false);
      }
    };

    loadMissions();
  }, [user]);

  const handleMissionClick = async (mission: MissionWithProgress) => {
    if (!user) {
      toast.error(language === 'hi' ? 'कृपया पहले लॉग इन करें' : 'Please log in first');
      return;
    }

    try {
      if (mission.status === 'available') {
        await startMission(user.uid, mission.id);
      }
      navigate(`/missions/${mission.id}`);
    } catch (error) {
      console.error('Error starting mission:', error);
      toast.error(language === 'hi' ? 'मिशन शुरू करने में विफल' : 'Failed to start mission');
    }
  };

  const activeCount = missions.filter(m => m.status === 'active').length;

  if (loading) {
    return (
      <div className="glass-card-glow p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{t('activeMissions')}</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-muted/30 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card-glow p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{t('activeMissions')}</h3>
        </div>
        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
          {activeCount} {language === 'hi' ? 'सक्रिय' : 'Active'}
        </span>
      </div>

      <div className="space-y-3">
        {missions.map((mission, index) => {
          const Icon = iconMap[mission.icon] || BookOpen;
          const isActive = mission.status === 'active';
          const isCompleted = mission.status === 'completed';
          
          return (
            <div
              key={mission.id}
              className={`p-4 rounded-xl border transition-all duration-300 animate-fade-in ${
                isActive 
                  ? 'bg-primary/5 border-primary/30 hover:border-primary/50' 
                  : isCompleted
                    ? 'bg-success/5 border-success/20 opacity-70'
                    : 'bg-card/30 border-border/30 hover:border-border/50'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  isActive 
                    ? 'bg-primary/20 border border-primary/30' 
                    : isCompleted
                      ? 'bg-success/20 border border-success/30'
                      : 'bg-muted/50 border border-border/30'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">
                      {language === 'hi' ? mission.title_hi : mission.title_en}
                    </span>
                    <span className={`text-xs font-medium ${isCompleted ? 'text-success' : 'text-primary'}`}>
                      {isCompleted ? (language === 'hi' ? 'पूर्ण' : 'Done') : `+${mission.xp_reward} XP`}
                    </span>
                  </div>
                  
                  {isActive && (
                    <div className="space-y-1">
                      <Progress value={mission.progress} className="h-1.5" />
                      <span className="text-xs text-muted-foreground">
                        {mission.progress}% {language === 'hi' ? 'पूर्ण' : 'complete'}
                      </span>
                    </div>
                  )}
                </div>

                {!isCompleted && (
                  <Button
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className={`${
                      isActive 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'border-border/50 hover:bg-muted/50'
                    }`}
                    onClick={() => handleMissionClick(mission)}
                  >
                    {isActive ? t('continueMission') : t('startMission')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      <Button 
        variant="ghost" 
        className="w-full mt-4 text-primary hover:text-primary/80"
        onClick={() => navigate('/missions')}
      >
        {language === 'hi' ? 'सभी मिशन देखें' : 'View All Missions'}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

export default ActiveMissions;
