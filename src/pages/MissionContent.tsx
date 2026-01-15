import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChevronLeft, ChevronRight, CheckCircle, XCircle, 
  Trophy, Zap, Lock, Smartphone, Eye, Globe, Key, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  getMission, 
  getMissionProgress, 
  startMission, 
  updateMissionProgress, 
  completeMission,
  DEFAULT_MISSIONS 
} from '@/firebase/database';
import type { Mission, UserMissionProgress, MissionQuiz } from '@/firebase/types';
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

const MissionContent: React.FC = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t, language } = useLanguage();
  const { user, refreshProfile } = useAuth();
  
  const [mission, setMission] = useState<Mission | null>(null);
  const [progress, setProgress] = useState<UserMissionProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  useEffect(() => {
    const loadMission = async () => {
      if (!missionId || !user) return;
      
      setLoading(true);
      try {
        // Try to get from Firebase first
        let missionData = await getMission(missionId);
        
        // If not in Firebase, use default missions
        if (!missionData) {
          const defaultMission = DEFAULT_MISSIONS.find(
            m => m.title_en.toLowerCase().replace(/\s+/g, '-') === missionId ||
                 m.display_order.toString() === missionId
          );
          if (defaultMission) {
            missionData = { id: missionId, ...defaultMission, created_at: new Date() } as Mission;
          }
        }
        
        if (missionData) {
          setMission(missionData);
          
          // Get or create progress
          let progressData = await getMissionProgress(user.uid, missionId);
          if (!progressData) {
            await startMission(user.uid, missionId);
            progressData = await getMissionProgress(user.uid, missionId);
          }
          setProgress(progressData);
          
          if (progressData?.current_section_index) {
            setCurrentSection(progressData.current_section_index);
          }
        }
      } catch (error) {
        console.error('Error loading mission:', error);
        toast.error('Failed to load mission');
      } finally {
        setLoading(false);
      }
    };

    loadMission();
  }, [missionId, user]);

  const totalSections = mission?.content?.sections?.length || 0;
  const hasQuiz = (mission?.content?.quiz?.length || 0) > 0;
  const totalSteps = totalSections + (hasQuiz ? 1 : 0);

  const handleNext = async () => {
    if (!mission || !user || !missionId) return;

    if (currentSection < totalSections - 1) {
      const newSection = currentSection + 1;
      setCurrentSection(newSection);
      
      // Update progress in Firebase
      const progressPercentage = Math.round(((newSection + 1) / totalSteps) * 100);
      try {
        await updateMissionProgress(user.uid, missionId, {
          current_section_index: newSection,
          progress_percentage: progressPercentage,
        });
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    } else if (hasQuiz && !showQuiz) {
      setShowQuiz(true);
    }
  };

  const handlePrevious = () => {
    if (showQuiz) {
      setShowQuiz(false);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    if (quizSubmitted) return;
    
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuizIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex < (mission?.content?.quiz?.length || 1) - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    }
  };

  const handlePreviousQuizQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!mission || !user || !missionId) return;
    
    const quiz = mission.content?.quiz || [];
    let correctCount = 0;
    
    quiz.forEach((q, index) => {
      if (quizAnswers[index] === q.correct_index) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / quiz.length) * 100);
    const xpEarned = Math.round((score / 100) * mission.xp_reward);
    
    setQuizSubmitted(true);
    
    try {
      await completeMission(user.uid, missionId, score, xpEarned);
      await refreshProfile();
      
      toast.success(
        language === 'hi' 
          ? `मिशन पूरा! +${xpEarned} XP अर्जित` 
          : `Mission Complete! +${xpEarned} XP earned`
      );
    } catch (error) {
      console.error('Error completing mission:', error);
      toast.error('Failed to save progress');
    }
  };

  const handleBackToMissions = () => {
    navigate('/missions');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">Mission not found</h2>
          <Button onClick={handleBackToMissions}>Back to Missions</Button>
        </div>
      </div>
    );
  }

  const Icon = iconMap[mission.icon] || BookOpen;
  const currentSectionData = mission.content?.sections?.[currentSection];
  const currentQuizData = mission.content?.quiz?.[currentQuizIndex];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <DashboardHeader />
        
        <main className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" onClick={handleBackToMissions} className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {language === 'hi' ? mission.title_hi : mission.title_en}
                </h1>
                <p className="text-muted-foreground">
                  {language === 'hi' ? mission.description_hi : mission.description_en}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {showQuiz 
                    ? (language === 'hi' ? 'क्विज़' : 'Quiz')
                    : `${language === 'hi' ? 'अनुभाग' : 'Section'} ${currentSection + 1}/${totalSections}`
                  }
                </span>
                <span className="text-primary font-medium">+{mission.xp_reward} XP</span>
              </div>
              <Progress 
                value={showQuiz ? 100 : ((currentSection + 1) / totalSteps) * 100} 
                className="h-2" 
              />
            </div>
          </div>

          {/* Content */}
          <div className="glass-card p-6 rounded-2xl mb-6">
            {!showQuiz && currentSectionData ? (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-semibold text-foreground">
                  {language === 'hi' ? currentSectionData.title_hi : currentSectionData.title_en}
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {language === 'hi' ? currentSectionData.content_hi : currentSectionData.content_en}
                </p>
                {currentSectionData.image_url && (
                  <img 
                    src={currentSectionData.image_url} 
                    alt="" 
                    className="rounded-xl max-w-full h-auto"
                  />
                )}
              </div>
            ) : !showQuiz && mission.content?.introduction_en ? (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-semibold text-foreground">
                  {language === 'hi' ? 'परिचय' : 'Introduction'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {language === 'hi' ? mission.content.introduction_hi : mission.content.introduction_en}
                </p>
              </div>
            ) : showQuiz && currentQuizData ? (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    {language === 'hi' ? 'क्विज़' : 'Quiz'}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {currentQuizIndex + 1}/{mission.content?.quiz?.length || 0}
                  </span>
                </div>
                
                <p className="text-foreground font-medium">
                  {language === 'hi' ? currentQuizData.question_hi : currentQuizData.question_en}
                </p>
                
                <div className="space-y-3">
                  {currentQuizData.options.map((option, index) => {
                    const isSelected = quizAnswers[currentQuizIndex] === index;
                    const isCorrect = index === currentQuizData.correct_index;
                    const showResult = quizSubmitted;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuizAnswer(index)}
                        disabled={quizSubmitted}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          showResult
                            ? isCorrect
                              ? 'bg-success/10 border-success/30 text-success'
                              : isSelected
                                ? 'bg-destructive/10 border-destructive/30 text-destructive'
                                : 'bg-muted/30 border-border/30'
                            : isSelected
                              ? 'bg-primary/10 border-primary/30'
                              : 'bg-card/30 border-border/30 hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-success" />}
                          {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive" />}
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className={`p-4 rounded-xl ${
                    quizAnswers[currentQuizIndex] === currentQuizData.correct_index
                      ? 'bg-success/10 border border-success/30'
                      : 'bg-muted/30 border border-border/30'
                  }`}>
                    <p className="text-sm text-muted-foreground">
                      {language === 'hi' ? currentQuizData.explanation_hi : currentQuizData.explanation_en}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {language === 'hi' ? 'मिशन पूरा!' : 'Mission Complete!'}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {language === 'hi' 
                    ? 'आपने सभी अनुभाग पूरे कर लिए हैं।' 
                    : 'You have completed all sections.'}
                </p>
                <Button onClick={handleBackToMissions}>
                  {language === 'hi' ? 'मिशन पर वापस जाएं' : 'Back to Missions'}
                </Button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSection === 0 && !showQuiz}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {language === 'hi' ? 'पिछला' : 'Previous'}
            </Button>

            {showQuiz ? (
              <div className="flex gap-2">
                {currentQuizIndex > 0 && (
                  <Button variant="outline" onClick={handlePreviousQuizQuestion}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                )}
                
                {!quizSubmitted && currentQuizIndex < (mission.content?.quiz?.length || 1) - 1 ? (
                  <Button onClick={handleNextQuizQuestion} disabled={quizAnswers[currentQuizIndex] === undefined}>
                    {language === 'hi' ? 'अगला प्रश्न' : 'Next Question'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : !quizSubmitted ? (
                  <Button 
                    onClick={handleSubmitQuiz}
                    disabled={quizAnswers.length < (mission.content?.quiz?.length || 0)}
                  >
                    {language === 'hi' ? 'जमा करें' : 'Submit'}
                  </Button>
                ) : currentQuizIndex < (mission.content?.quiz?.length || 1) - 1 ? (
                  <Button onClick={handleNextQuizQuestion}>
                    {language === 'hi' ? 'अगला प्रश्न' : 'Next Question'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleBackToMissions}>
                    {language === 'hi' ? 'पूर्ण' : 'Finish'}
                    <Trophy className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            ) : (
              <Button onClick={handleNext}>
                {currentSection < totalSections - 1 
                  ? (language === 'hi' ? 'अगला' : 'Next')
                  : hasQuiz 
                    ? (language === 'hi' ? 'क्विज़ शुरू करें' : 'Start Quiz')
                    : (language === 'hi' ? 'पूर्ण' : 'Complete')
                }
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MissionContent;
