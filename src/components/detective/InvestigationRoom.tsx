import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getCaseEvidence, 
  getCaseQuestions, 
  updateCaseProgress
} from '@/firebase/database';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, MessageSquare, Link, CreditCard, FileSearch,
  ChevronRight, ChevronLeft, ArrowLeft, Shield, Lock,
  Mail, Globe, Banknote, MessageCircle, FolderOpen, Eye
} from 'lucide-react';

interface Case {
  id: string;
  case_number: string;
  title_en: string;
  title_hi: string;
}

interface Evidence {
  id: string;
  evidence_type: string;
  content_en: string;
  content_hi: string;
  display_order: number;
}

interface Question {
  id: string;
  question_en: string;
  question_hi: string;
  question_type: string;
  options: string[] | null;
  correct_answer: any;
  explanation_en: string;
  explanation_hi: string;
  display_order: number;
}

interface UserProgress {
  id: string;
  current_question_index: number;
  responses: any[];
  status: string;
}

interface Props {
  caseData: Case;
  progress: UserProgress;
  onBack: () => void;
  onComplete: (responses: any[]) => void;
}

const InvestigationRoom: React.FC<Props> = ({ caseData, progress, onBack, onComplete }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(progress?.current_question_index || 0);
  const [responses, setResponses] = useState<any[]>(progress?.responses || []);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<string>('all');
  const [evidenceExpanded, setEvidenceExpanded] = useState(true);

  useEffect(() => {
    fetchData();
  }, [caseData.id]);

  useEffect(() => {
    // Restore current answer when navigating back
    if (responses[currentIndex]) {
      setCurrentAnswer(responses[currentIndex]);
    } else {
      setCurrentAnswer(null);
    }
  }, [currentIndex, responses]);

  const fetchData = async () => {
    try {
      const [evidenceData, questionsData] = await Promise.all([
        getCaseEvidence(caseData.id),
        getCaseQuestions(caseData.id)
      ]);
      
      setEvidence(evidenceData as Evidence[]);
      setQuestions(questionsData as Question[]);
    } catch (error) {
      console.error('Error fetching case data:', error);
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'chat': return MessageCircle;
      case 'url': return Globe;
      case 'transaction': return Banknote;
      default: return FileSearch;
    }
  };

  const getEvidenceColor = (type: string) => {
    switch (type) {
      case 'email': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'chat': return 'text-violet-400 bg-violet-500/10 border-violet-500/30';
      case 'url': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'transaction': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';
    }
  };

  const evidenceTypes = ['all', ...new Set(evidence.map(e => e.evidence_type))];
  
  const filteredEvidence = activeEvidenceTab === 'all' 
    ? evidence 
    : evidence.filter(e => e.evidence_type === activeEvidenceTab);

  const saveProgress = async (newResponses: any[], newIndex: number) => {
    if (!user) return;
    setSaving(true);
    
    try {
      await updateCaseProgress(user.uid, caseData.id, {
        responses: newResponses,
        current_question_index: newIndex,
        status: 'in_progress' as any,
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
    
    setSaving(false);
  };

  const handleNext = async () => {
    if (!currentAnswer) return;
    
    const newResponses = [...responses];
    newResponses[currentIndex] = currentAnswer;
    setResponses(newResponses);
    
    if (currentIndex < questions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentAnswer(newResponses[newIndex] || null);
      await saveProgress(newResponses, newIndex);
    } else {
      // All questions answered - proceed to submission
      await saveProgress(newResponses, currentIndex);
      onComplete(newResponses);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentAnswer(responses[newIndex] || null);
    }
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
      {/* Evidence Room Panel - Persistent */}
      <div className={`${evidenceExpanded ? 'lg:w-[400px]' : 'lg:w-16'} flex-shrink-0 transition-all duration-300`}>
        <div className="h-full rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-cyan-950/30 backdrop-blur-xl overflow-hidden flex flex-col">
          {/* Evidence Room Header */}
          <div className="px-4 py-4 border-b border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <FolderOpen className="w-5 h-5 text-cyan-400" />
                </div>
                {evidenceExpanded && (
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {language === 'hi' ? 'सबूत कक्ष' : 'EVIDENCE ROOM'}
                    </h3>
                    <p className="text-xs text-cyan-400/60 font-mono">{evidence.length} {language === 'hi' ? 'आइटम' : 'ITEMS'}</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setEvidenceExpanded(!evidenceExpanded)}
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
              >
                <Eye className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>

          {evidenceExpanded && (
            <>
              {/* Evidence Type Tabs */}
              <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/20">
                <div className="flex flex-wrap gap-2">
                  {evidenceTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setActiveEvidenceTab(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeEvidenceTab === type 
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                          : 'bg-slate-800/50 text-zinc-400 border border-slate-700/50 hover:border-slate-600/50'
                      }`}
                    >
                      {type === 'all' ? (language === 'hi' ? 'सभी' : 'All') : type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Evidence Items - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredEvidence.map((e) => {
                  const Icon = getEvidenceIcon(e.evidence_type);
                  const colorClass = getEvidenceColor(e.evidence_type);
                  return (
                    <div 
                      key={e.id} 
                      className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden"
                    >
                      {/* Evidence Type Header */}
                      <div className={`px-3 py-2 border-b border-slate-700/50 flex items-center gap-2 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {e.evidence_type}
                        </span>
                        <span className="text-xs opacity-60 ml-auto font-mono">
                          #{e.display_order}
                        </span>
                      </div>
                      
                      {/* Evidence Content */}
                      <div className="p-4">
                        <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                          {language === 'hi' ? e.content_hi : e.content_en}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Investigation Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Investigation Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">{t('backToCases')}</span>
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-mono">{caseData.case_number}</span>
            <div className="h-4 w-px bg-slate-700" />
            <span className="text-xs text-cyan-400 font-mono">
              {language === 'hi' ? 'जांच सक्रिय' : 'INVESTIGATION ACTIVE'}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="flex-1 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-violet-950/20 backdrop-blur-xl overflow-hidden flex flex-col">
          {/* Progress Bar */}
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">
                  {language === 'hi' ? 'जांच प्रश्न' : 'INVESTIGATION QUESTION'}
                </span>
              </div>
              <span className="text-sm text-zinc-400 font-mono">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            
            {/* Question Progress Dots */}
            <div className="flex items-center gap-1.5">
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i < currentIndex ? 'bg-emerald-500' : 
                    i === currentIndex ? 'bg-cyan-500 animate-pulse' : 
                    'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentQuestion && (
              <>
                {/* Question Text */}
                <div className="mb-8">
                  <p className="text-lg text-white leading-relaxed">
                    {language === 'hi' ? currentQuestion.question_hi : currentQuestion.question_en}
                  </p>
                </div>

                {/* Answer Options */}
                {currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'yes_no_reasoning' ? (
                  <div className="space-y-3">
                    {(currentQuestion.options || []).map((opt: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setCurrentAnswer(opt)}
                        className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                          currentAnswer === opt 
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10' 
                            : 'bg-slate-800/30 border-slate-700/50 text-zinc-300 hover:border-slate-600/50 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                            currentAnswer === opt ? 'border-cyan-500 bg-cyan-500' : 'border-slate-600'
                          }`}>
                            {currentAnswer === opt && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="text-sm leading-relaxed">{opt}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : currentQuestion.question_type === 'multi_select' ? (
                  <div className="space-y-3">
                    <p className="text-xs text-zinc-500 mb-4 flex items-center gap-2">
                      <Lock className="w-3 h-3" />
                      {language === 'hi' ? 'सभी लागू विकल्प चुनें' : 'Select all that apply'}
                    </p>
                    {(currentQuestion.options || []).map((opt: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => {
                          const arr = currentAnswer || [];
                          setCurrentAnswer(
                            arr.includes(opt) 
                              ? arr.filter((x: string) => x !== opt)
                              : [...arr, opt]
                          );
                        }}
                        className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                          (currentAnswer || []).includes(opt)
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10' 
                            : 'bg-slate-800/30 border-slate-700/50 text-zinc-300 hover:border-slate-600/50 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2 ${
                            (currentAnswer || []).includes(opt) ? 'border-cyan-500 bg-cyan-500' : 'border-slate-600'
                          }`}>
                            {(currentAnswer || []).includes(opt) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm leading-relaxed">{opt}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      value={currentAnswer || ''}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder={language === 'hi' ? 'अपना विश्लेषण यहां लिखें...' : 'Write your analysis here...'}
                      className="min-h-[180px] bg-slate-800/30 border-slate-700/50 text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-none"
                    />
                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      {language === 'hi' 
                        ? 'विस्तृत और साक्ष्य-आधारित उत्तर दें'
                        : 'Provide a detailed, evidence-based response'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/20">
            <div className="flex items-center gap-4">
              {currentIndex > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="border-slate-700 bg-slate-800/50 text-zinc-300 hover:bg-slate-800 hover:text-white hover:border-slate-600"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {language === 'hi' ? 'पिछला' : 'Previous'}
                </Button>
              )}
              
              <Button 
                onClick={handleNext}
                disabled={!currentAnswer || saving}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {language === 'hi' ? 'सहेजा जा रहा है...' : 'Saving...'}
                  </span>
                ) : currentIndex < questions.length - 1 ? (
                  <>
                    {language === 'hi' ? 'अगला प्रश्न' : 'Next Question'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    {language === 'hi' ? 'जमा करने के लिए आगे बढ़ें' : 'Proceed to Submit'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
            
            {/* No feedback notice */}
            <p className="text-xs text-center text-zinc-600 mt-3 flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />
              {language === 'hi' 
                ? 'जमा करने तक कोई फीडबैक नहीं मिलेगा'
                : 'No feedback will be provided until submission'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestigationRoom;
