import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getCases, getUserCaseProgress, createOrUpdateCaseProgress } from '@/firebase/database';
import type { Case as CaseType, UserCaseProgress } from '@/firebase/types';
import { Button } from '@/components/ui/button';
import { 
  Search, Shield, AlertTriangle, Filter, Play, Eye, CheckCircle, Clock,
  ChevronRight, Target, Lock, Crosshair, Radio, Activity
} from 'lucide-react';
import CaseBrief from './CaseBrief';
import InvestigationRoom from './InvestigationRoom';
import SubmitAnalysis from './SubmitAnalysis';
import CaseResults from './CaseResults';

interface Case {
  id: string;
  case_number: string;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  brief_en: string;
  brief_hi: string;
  difficulty: string;
  threat_type: string;
  xp_reward: number;
}

interface UserProgress {
  id: string;
  case_id: string;
  status: string;
  current_question_index: number;
  responses: any[];
  score: number | null;
  verdict: string | null;
  feedback: any;
}

const CaseList: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [threatFilter, setThreatFilter] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'brief' | 'investigation' | 'submit' | 'results'>('list');
  const [pendingResponses, setPendingResponses] = useState<any[]>([]);

  useEffect(() => {
    fetchCases();
  }, [user]);

  const fetchCases = async () => {
    if (!user) return;
    
    try {
      const casesData = await getCases();
      setCases(casesData as Case[]);

      const progressMap = await getUserCaseProgress(user.uid);
      setUserProgress(progressMap as Record<string, UserProgress>);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseComplete = async (responses: any[]) => {
    setPendingResponses(responses);
    setViewMode('submit');
  };

  const handleSubmitComplete = async () => {
    await fetchCases();
    await refreshProfile();
    setViewMode('results');
    setPendingResponses([]);
  };

  const handleBackFromSubmit = () => {
    setViewMode('investigation');
  };

  const getTitle = (c: Case) => language === 'hi' ? c.title_hi : c.title_en;
  const getDescription = (c: Case) => language === 'hi' ? c.description_hi : c.description_en;

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return { class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', glow: 'shadow-emerald-500/20' };
      case 'intermediate': return { class: 'bg-amber-500/20 text-amber-400 border-amber-500/30', glow: 'shadow-amber-500/20' };
      case 'advanced': return { class: 'bg-red-500/20 text-red-400 border-red-500/30', glow: 'shadow-red-500/20' };
      default: return { class: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', glow: 'shadow-cyan-500/20' };
    }
  };

  const getStatusConfig = (caseId: string) => {
    const progress = userProgress[caseId];
    if (!progress) return { 
      icon: <Clock className="w-4 h-4" />, 
      label: t('notStarted'), 
      class: 'text-zinc-400 bg-zinc-800/50',
      indicator: 'bg-zinc-500'
    };
    if (progress.status === 'reviewed') return { 
      icon: <CheckCircle className="w-4 h-4" />, 
      label: t('solved'), 
      class: 'text-emerald-400 bg-emerald-500/10',
      indicator: 'bg-emerald-500 animate-pulse'
    };
    if (progress.status === 'submitted') return { 
      icon: <Eye className="w-4 h-4" />, 
      label: t('submitted'), 
      class: 'text-violet-400 bg-violet-500/10',
      indicator: 'bg-violet-500 animate-pulse'
    };
    return { 
      icon: <Play className="w-4 h-4" />, 
      label: t('inProgress'), 
      class: 'text-cyan-400 bg-cyan-500/10',
      indicator: 'bg-cyan-500 animate-pulse'
    };
  };

  const getThreatTypeIcon = (threatType: string) => {
    switch (threatType.toLowerCase()) {
      case 'phishing':
      case 'financial scam': return <AlertTriangle className="w-4 h-4" />;
      case 'identity theft': return <Shield className="w-4 h-4" />;
      case 'job fraud': return <Target className="w-4 h-4" />;
      case 'social engineering': return <Crosshair className="w-4 h-4" />;
      default: return <Radio className="w-4 h-4" />;
    }
  };

  const handleCaseAction = (c: Case) => {
    setSelectedCase(c);
    const progress = userProgress[c.id];
    
    if (!progress) {
      setViewMode('brief');
    } else if (progress.status === 'reviewed') {
      setViewMode('results');
    } else if (progress.status === 'submitted') {
      setViewMode('results');
    } else {
      setViewMode('investigation');
    }
  };

  const startInvestigation = async () => {
    if (!selectedCase || !user) return;
    
    try {
      await createOrUpdateCaseProgress(user.uid, selectedCase.id, {
        status: 'in_progress',
        current_question_index: 0,
        responses: [],
      });
      await fetchCases();
      setViewMode('investigation');
    } catch (error) {
      console.error('Error starting investigation:', error);
    }
  };

  // Get unique threat types
  const uniqueThreatTypes = [...new Set(cases.map(c => c.threat_type))];

  const filteredCases = cases.filter(c => {
    const matchesDifficulty = difficultyFilter === 'all' || c.difficulty === difficultyFilter;
    const matchesThreat = threatFilter === 'all' || c.threat_type === threatFilter;
    return matchesDifficulty && matchesThreat;
  });

  // Count stats
  const solvedCount = Object.values(userProgress).filter(p => p.status === 'reviewed').length;
  const inProgressCount = Object.values(userProgress).filter(p => p.status === 'in_progress').length;

  if (viewMode === 'brief' && selectedCase) {
    return (
      <CaseBrief 
        caseData={selectedCase} 
        onBack={() => { setViewMode('list'); setSelectedCase(null); }}
        onStart={startInvestigation}
      />
    );
  }

  if (viewMode === 'investigation' && selectedCase) {
    return (
      <InvestigationRoom 
        caseData={selectedCase}
        progress={userProgress[selectedCase.id]}
        onBack={() => { setViewMode('list'); setSelectedCase(null); fetchCases(); }}
        onComplete={handleCaseComplete}
      />
    );
  }

  if (viewMode === 'submit' && selectedCase) {
    return (
      <SubmitAnalysis
        caseData={selectedCase}
        responses={pendingResponses}
        onBack={handleBackFromSubmit}
        onSubmit={handleSubmitComplete}
      />
    );
  }

  if (viewMode === 'results' && selectedCase) {
    return (
      <CaseResults 
        caseData={selectedCase}
        progress={userProgress[selectedCase.id]}
        onBack={() => { setViewMode('list'); setSelectedCase(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* SOC Header Panel */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-cyan-950/30 backdrop-blur-xl p-6">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">{t('digitalDetective')}</h2>
              <p className="text-cyan-400/80 text-sm font-mono tracking-wider">
                {language === 'hi' ? 'साइबर जांच कंसोल' : 'CYBER INVESTIGATION CONSOLE'}
              </p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs text-zinc-400 font-mono">QUEUE</span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <span className="text-lg font-bold text-white">{cases.length}</span>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-mono">SOLVED</span>
              <span className="text-lg font-bold text-emerald-400">{solvedCount}</span>
            </div>

            {inProgressCount > 0 && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs text-cyan-400 font-mono">ACTIVE</span>
                <span className="text-lg font-bold text-cyan-400">{inProgressCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-zinc-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        
        <div className="h-6 w-px bg-slate-700" />
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Difficulty</span>
          <select 
            value={difficultyFilter} 
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
          >
            <option value="all">{t('allCases')}</option>
            <option value="beginner">{t('beginner')}</option>
            <option value="intermediate">{t('intermediate')}</option>
            <option value="advanced">{t('advanced')}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Threat Type</span>
          <select 
            value={threatFilter} 
            onChange={(e) => setThreatFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
          >
            <option value="all">All Types</option>
            {uniqueThreatTypes.map(type => (
              <option key={type} value={type}>{t(type) || type}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-xs text-zinc-500">
          {filteredCases.length} {language === 'hi' ? 'केस' : 'cases'} {language === 'hi' ? 'उपलब्ध' : 'available'}
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="relative rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-slate-800 rounded w-2/3 mb-2"></div>
              <div className="h-16 bg-slate-800 rounded mb-4"></div>
            </div>
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-slate-700/50 bg-slate-900/30">
          <Search className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400 mb-2">
            {language === 'hi' ? 'कोई केस नहीं मिला' : 'No cases found'}
          </h3>
          <p className="text-zinc-500 text-sm">
            {language === 'hi' ? 'फ़िल्टर बदलकर देखें' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((c) => {
            const diffConfig = getDifficultyConfig(c.difficulty);
            const statusConfig = getStatusConfig(c.id);
            
            return (
              <div
                key={c.id}
                onClick={() => handleCaseAction(c)}
                className={`group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1`}
              >
                {/* Top accent line */}
                <div className={`absolute top-0 inset-x-0 h-px ${statusConfig.indicator}`} />
                
                {/* Status indicator dot */}
                <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${statusConfig.indicator}`} />
                
                <div className="p-5">
                  {/* Case Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {c.case_number}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase border ${diffConfig.class}`}>
                      {t(c.difficulty)}
                    </span>
                  </div>
                  
                  {/* Case Title */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {getTitle(c)}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                    {getDescription(c)}
                  </p>
                  
                  {/* Threat Type */}
                  <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <span className="text-violet-400">
                      {getThreatTypeIcon(c.threat_type)}
                    </span>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider">
                      {t(c.threat_type) || c.threat_type}
                    </span>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg ${statusConfig.class}`}>
                      {statusConfig.icon}
                      <span className="text-xs font-medium">{statusConfig.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-cyan-400">+{c.xp_reward}</span>
                      <span className="text-xs text-zinc-500">XP</span>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CaseList;
