import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Target, AlertTriangle, ChevronRight, Shield, 
  FileText, Clock, Brain, Eye, Lock, AlertCircle, Crosshair
} from 'lucide-react';

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

interface CaseBriefProps {
  caseData: Case;
  onBack: () => void;
  onStart: () => void;
}

const CaseBrief: React.FC<CaseBriefProps> = ({ caseData, onBack, onStart }) => {
  const { t, language } = useLanguage();

  const getTitle = () => language === 'hi' ? caseData.title_hi : caseData.title_en;
  const getBrief = () => language === 'hi' ? caseData.brief_hi : caseData.brief_en;
  const getDescription = () => language === 'hi' ? caseData.description_hi : caseData.description_en;

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return { 
        class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        label: language === 'hi' ? 'शुरुआती' : 'BEGINNER',
        estimate: language === 'hi' ? '5-10 मिनट' : '5-10 min'
      };
      case 'intermediate': return { 
        class: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        label: language === 'hi' ? 'मध्यवर्ती' : 'INTERMEDIATE',
        estimate: language === 'hi' ? '10-15 मिनट' : '10-15 min'
      };
      case 'advanced': return { 
        class: 'bg-red-500/20 text-red-400 border-red-500/30',
        label: language === 'hi' ? 'उन्नत' : 'ADVANCED',
        estimate: language === 'hi' ? '15-20 मिनट' : '15-20 min'
      };
      default: return { 
        class: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        label: 'UNKNOWN',
        estimate: '10 min'
      };
    }
  };

  const diffConfig = getDifficultyConfig(caseData.difficulty);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">{t('backToCases')}</span>
      </button>

      {/* Classification Banner */}
      <div className="flex items-center justify-center gap-3 py-2 px-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-mono text-amber-400 tracking-widest uppercase">
          {language === 'hi' ? 'वर्गीकृत सामग्री • केवल अधिकृत विश्लेषक' : 'CLASSIFIED MATERIAL • AUTHORIZED ANALYSTS ONLY'}
        </span>
        <AlertTriangle className="w-4 h-4 text-amber-400" />
      </div>

      {/* Main Case Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-cyan-950/30 backdrop-blur-xl">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative z-10 p-8">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <span className="text-xs font-mono text-cyan-400/80 tracking-wider">CASE FILE</span>
                <p className="text-lg font-bold text-cyan-400 font-mono">{caseData.case_number}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-lg border ${diffConfig.class}`}>
                <span className="text-xs font-bold tracking-wider">{diffConfig.label}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-400 font-mono">{diffConfig.estimate}</span>
              </div>
            </div>
          </div>

          {/* Case Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            {getTitle()}
          </h1>
          
          {/* Threat Type Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30 mb-6">
            <Crosshair className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-400 font-medium">
              {t(caseData.threat_type) || caseData.threat_type}
            </span>
          </div>

          {/* XP Reward */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-zinc-400">
              {language === 'hi' ? 'पुरस्कार' : 'Reward'}:
            </span>
            <span className="text-xl font-bold text-cyan-400">+{caseData.xp_reward}</span>
            <span className="text-sm text-zinc-500">XP</span>
          </div>
        </div>
      </div>

      {/* Incident Briefing Section */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {language === 'hi' ? 'घटना ब्रीफिंग' : 'INCIDENT BRIEFING'}
              </h2>
              <p className="text-xs text-zinc-500 font-mono">
                {language === 'hi' ? 'वरिष्ठ विश्लेषक द्वारा' : 'FROM SENIOR ANALYST'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-zinc-300 leading-relaxed whitespace-pre-line text-base">
            {getBrief()}
          </p>
        </div>
      </div>

      {/* Investigation Objective */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-violet-500/5 backdrop-blur-sm p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <Target className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-cyan-400 mb-3 tracking-wide">
              {language === 'hi' ? 'जांच उद्देश्य' : 'INVESTIGATION OBJECTIVE'}
            </h3>
            <p className="text-zinc-300 leading-relaxed">
              {language === 'hi' 
                ? 'उपलब्ध सबूतों का गहन विश्लेषण करें। प्रत्येक सबूत की जांच करें, पैटर्न की पहचान करें, और निर्धारित करें कि यह घटना वैध है या साइबर खतरा। अपने निष्कर्षों को जांच प्रश्नों के माध्यम से प्रमाणित करें।'
                : 'Conduct a thorough analysis of the available evidence. Examine each piece of evidence, identify patterns and red flags, and determine whether this incident represents a legitimate communication or a cyber threat. Document your findings through the investigation questions.'}
            </p>
          </div>
        </div>
      </div>

      {/* Investigation Protocol */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 bg-red-500/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">
              {language === 'hi' ? 'जांच प्रोटोकॉल' : 'INVESTIGATION PROTOCOL'}
            </h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Rule Cards */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <Lock className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">
                  {language === 'hi' ? 'कोई संकेत नहीं' : 'No Hints Available'}
                </p>
                <p className="text-xs text-zinc-500">
                  {language === 'hi' 
                    ? 'आपको स्वतंत्र रूप से विश्लेषण करना होगा'
                    : 'You must analyze the evidence independently'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <Eye className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">
                  {language === 'hi' ? 'कोई तत्काल फीडबैक नहीं' : 'No Immediate Feedback'}
                </p>
                <p className="text-xs text-zinc-500">
                  {language === 'hi' 
                    ? 'परिणाम जमा करने के बाद ही दिखाई देंगे'
                    : 'Results revealed only after submission'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <ChevronRight className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">
                  {language === 'hi' ? 'क्रमिक प्रश्न' : 'Sequential Questions'}
                </p>
                <p className="text-xs text-zinc-500">
                  {language === 'hi' 
                    ? 'प्रत्येक प्रश्न क्रम में अनलॉक होगा'
                    : 'Each question unlocks in sequence'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <FileText className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">
                  {language === 'hi' ? 'सबूत हमेशा उपलब्ध' : 'Evidence Always Available'}
                </p>
                <p className="text-xs text-zinc-500">
                  {language === 'hi' 
                    ? 'किसी भी समय सबूत देख सकते हैं'
                    : 'Access evidence room anytime during investigation'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analyst Commitment Notice */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
        <Brain className="w-5 h-5 text-violet-400 flex-shrink-0" />
        <p className="text-sm text-zinc-400">
          {language === 'hi'
            ? 'याद रखें: एक वास्तविक साइबर विश्लेषक की तरह सोचें। उपलब्ध सबूतों के आधार पर तार्किक निष्कर्ष निकालें।'
            : 'Remember: Think like a real cyber analyst. Draw logical conclusions based on the available evidence. Your analysis will be evaluated on reasoning quality, not just correct answers.'}
        </p>
      </div>

      {/* Start Investigation CTA */}
      <Button 
        onClick={onStart}
        size="lg"
        className="w-full h-16 bg-gradient-to-r from-cyan-600 via-cyan-500 to-violet-500 hover:from-cyan-500 hover:via-cyan-400 hover:to-violet-400 text-white text-lg font-bold tracking-wide shadow-lg shadow-cyan-500/25 border-0 group transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span>{language === 'hi' ? 'जांच शुरू करें' : 'BEGIN INVESTIGATION'}</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </Button>
    </div>
  );
};

export default CaseBrief;
