import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Target, Zap, Lock, Smartphone, Eye, Globe, Key, ChevronRight, CheckCircle, Star, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  getMissions, 
  getUserMissionProgress, 
  startMission,
  DEFAULT_MISSIONS 
} from '@/firebase/database';
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

const Missions: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [missions, setMissions] = useState<MissionWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMissions = async () => {
      if (!user) return;
      
      setLoading(true);
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

        // Combine missions with progress
        const missionsWithProgress: MissionWithProgress[] = missionsList.map(mission => {
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
        });

        setMissions(missionsWithProgress);
      } catch (error) {
        console.error('Error loading missions:', error);
        // Use default missions on error
        const defaultMissionsWithProgress: MissionWithProgress[] = DEFAULT_MISSIONS.map((m, index) => ({
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

  const getDifficultyColor = (difficulty: Mission['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'badge-secure';
      case 'medium': return 'badge-warning';
      case 'hard': return 'badge-danger';
    }
  };

  const handleStartMission = async (mission: MissionWithProgress) => {
    if (!user) {
      toast.error('Please log in to start missions');
      return;
    }

    try {
      if (mission.status === 'available') {
        await startMission(user.uid, mission.id);
      }
      navigate(`/missions/${mission.id}`);
    } catch (error) {
      console.error('Error starting mission:', error);
      toast.error('Failed to start mission');
    }
  };

  const activeMissions = missions.filter(m => m.status === 'active');
  const availableMissions = missions.filter(m => m.status === 'available');
  const completedMissions = missions.filter(m => m.status === 'completed');

  const totalXpEarned = profile?.total_xp || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <DashboardHeader />
          <main className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted/30 rounded w-1/4"></div>
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 bg-muted/30 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <DashboardHeader />
        
        <main className="p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t('missions')}</h2>
              <p className="text-muted-foreground">
                {language === 'hi' 
                  ? 'अपनी साइबर जागरूकता बढ़ाने के लिए प्रशिक्षण मिशन पूरा करें'
                  : 'Complete training missions to boost your cyber awareness'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {totalXpEarned.toLocaleString()} XP {language === 'hi' ? 'अर्जित' : 'Earned'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Missions */}
          {activeMissions.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                {language === 'hi' ? 'प्रगति में' : 'In Progress'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {activeMissions.map((mission, index) => {
                  const Icon = iconMap[mission.icon] || BookOpen;
                  return (
                    <div
                      key={mission.id}
                      className="glass-card-glow p-5 rounded-2xl animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {language === 'hi' ? mission.title_hi : mission.title_en}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${getDifficultyColor(mission.difficulty)}`}>
                              {mission.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {language === 'hi' ? mission.description_hi : mission.description_en}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{mission.progress}% {language === 'hi' ? 'पूर्ण' : 'complete'}</span>
                              <span className="text-primary font-medium">+{mission.xp_reward} XP</span>
                            </div>
                            <Progress value={mission.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-primary hover:bg-primary/90"
                        onClick={() => handleStartMission(mission)}
                      >
                        {t('continueMission')}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Available Missions */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {language === 'hi' ? 'उपलब्ध मिशन' : 'Available Missions'}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableMissions.map((mission, index) => {
                const Icon = iconMap[mission.icon] || BookOpen;
                return (
                  <div
                    key={mission.id}
                    className="glass-card p-5 rounded-2xl hover:border-primary/30 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-muted/50 border border-border/30">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">
                            {language === 'hi' ? mission.title_hi : mission.title_en}
                          </h4>
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium uppercase ${getDifficultyColor(mission.difficulty)}`}>
                          {mission.difficulty}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {language === 'hi' ? mission.description_hi : mission.description_en}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>⏱ {mission.duration_minutes} min</span>
                      <span className="text-primary font-medium">+{mission.xp_reward} XP</span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleStartMission(mission)}
                    >
                      {t('startMission')}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Completed Missions */}
          {completedMissions.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                {language === 'hi' ? 'पूर्ण' : 'Completed'}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedMissions.map((mission) => {
                  const Icon = iconMap[mission.icon] || BookOpen;
                  return (
                    <div
                      key={mission.id}
                      className="glass-card p-5 rounded-2xl opacity-70"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-success/10 border border-success/30">
                          <Icon className="w-5 h-5 text-success" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground flex items-center gap-2">
                            {language === 'hi' ? mission.title_hi : mission.title_en}
                            <CheckCircle className="w-4 h-4 text-success" />
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {language === 'hi' ? mission.description_hi : mission.description_en}
                          </p>
                          <span className="text-xs text-success font-medium mt-2 inline-block">
                            +{mission.xp_reward} XP {language === 'hi' ? 'अर्जित' : 'Earned'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Missions;
