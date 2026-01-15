import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Trophy, Target, CheckCircle, XCircle, 
  Lightbulb, Star, Shield, AlertTriangle, BookOpen,
  TrendingUp, Award, Brain
} from 'lucide-react';

interface Case {
  id: string;
  case_number: string;
  title_en: string;
  title_hi: string;
  xp_reward: number;
}

interface Progress {
  score: number | null;
  verdict: string | null;
  feedback: any[];
}

interface Props {
  caseData: Case;
  progress: Progress;
  onBack: () => void;
}

const CaseResults: React.FC<Props> = ({ caseData, progress, onBack }) => {
  const { t, language } = useLanguage();
  
  // Calculate actual XP earned based on score
  const scorePercent = progress.score || 0;
  const baseXP = caseData.xp_reward || 100;
  const xpEarned = Math.round(baseXP * (scorePercent / 100));
  
  // Count correct/incorrect
  const correctCount = (progress.feedback || []).filter(f => f.is_correct).length;
  const totalQuestions = (progress.feedback || []).length;

  const getVerdictConfig = (verdict: string | null) => {
    switch (verdict) {
      case 'solved': return {
        icon: <Trophy className="w-12 h-12" />,
        color: 'text-emerald-400',
        bgGlow: 'from-emerald-500/20 to-emerald-500/5',
        borderColor: 'border-emerald-500/30',
        label: language === 'hi' ? 'केस हल' : 'CASE SOLVED',
        message: language === 'hi' 
          ? 'उत्कृष्ट कार्य, विश्लेषक! आपने सभी खतरों की सही पहचान की और पेशेवर स्तर का विश्लेषण प्रदर्शित किया।'
          : 'Excellent work, Analyst! You correctly identified all threats and demonstrated professional-level analysis skills.'
      };
      case 'partially_solved': return {
        icon: <Star className="w-12 h-12" />,
        color: 'text-amber-400',
        bgGlow: 'from-amber-500/20 to-amber-500/5',
        borderColor: 'border-amber-500/30',
        label: language === 'hi' ? 'आंशिक रूप से हल' : 'PARTIALLY SOLVED',
        message: language === 'hi'
          ? 'अच्छा प्रयास! आपने कुछ महत्वपूर्ण संकेतों की पहचान की। नीचे दी गई समीक्षा से सीखें और अपने कौशल को और बेहतर बनाएं।'
          : 'Good effort! You identified some critical indicators. Review the feedback below to strengthen your analysis skills.'
      };
      default: return {
        icon: <BookOpen className="w-12 h-12" />,
        color: 'text-violet-400',
        bgGlow: 'from-violet-500/20 to-violet-500/5',
        borderColor: 'border-violet-500/30',
        label: language === 'hi' ? 'सुधार आवश्यक' : 'NEEDS IMPROVEMENT',
        message: language === 'hi'
          ? 'कोई बात नहीं! हर विशेषज्ञ एक शुरुआती था। नीचे दी गई विस्तृत समीक्षा का अध्ययन करें और इन सीखों को भविष्य के मामलों में लागू करें।'
          : 'Don\'t worry! Every expert was once a beginner. Study the detailed review below and apply these learnings to future cases.'
      };
    }
  };

  const verdictConfig = getVerdictConfig(progress.verdict);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm">{t('backToCases')}</span>
      </button>

      {/* Verdict Card */}
      <div className={`relative rounded-2xl border ${verdictConfig.borderColor} bg-gradient-to-br ${verdictConfig.bgGlow} backdrop-blur-xl overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-full transform translate-x-32 -translate-y-32" />
        
        <div className="relative z-10 p-8 text-center">
          {/* Verdict Icon */}
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-slate-900/50 border ${verdictConfig.borderColor} mb-6 ${verdictConfig.color}`}>
            {verdictConfig.icon}
          </div>
          
          {/* Verdict Label */}
          <h2 className={`text-3xl font-bold mb-3 tracking-wide ${verdictConfig.color}`}>
            {verdictConfig.label}
          </h2>
          
          {/* Case Info */}
          <p className="text-sm text-zinc-400 font-mono mb-2">
            {caseData.case_number}
          </p>
          <p className="text-lg text-white mb-4">
            {language === 'hi' ? caseData.title_hi : caseData.title_en}
          </p>
          
          {/* Verdict Message */}
          <p className="text-zinc-300 max-w-lg mx-auto leading-relaxed">
            {verdictConfig.message}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-slate-700/50 bg-slate-900/30 px-8 py-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Accuracy Score */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  {language === 'hi' ? 'सटीकता' : 'Accuracy'}
                </span>
              </div>
              <div className="text-4xl font-bold text-white">{progress.score || 0}%</div>
            </div>
            
            {/* Correct Answers */}
            <div className="text-center border-x border-slate-700/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  {language === 'hi' ? 'सही' : 'Correct'}
                </span>
              </div>
              <div className="text-4xl font-bold text-emerald-400">
                {correctCount}<span className="text-xl text-zinc-500">/{totalQuestions}</span>
              </div>
            </div>
            
            {/* XP Earned */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  {language === 'hi' ? 'अर्जित XP' : 'XP Earned'}
                </span>
              </div>
              <div className="text-4xl font-bold text-amber-400">+{xpEarned}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Question-by-Question Review */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {language === 'hi' ? 'विस्तृत समीक्षा' : 'DETAILED REVIEW'}
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                {language === 'hi' ? 'प्रश्न-दर-प्रश्न विश्लेषण' : 'QUESTION-BY-QUESTION ANALYSIS'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {(progress.feedback || []).map((fb: any, i: number) => (
            <div 
              key={i} 
              className={`rounded-xl border overflow-hidden ${
                fb.is_correct 
                  ? 'border-emerald-500/30 bg-emerald-500/5' 
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              {/* Question Header */}
              <div className={`px-5 py-3 border-b flex items-center gap-3 ${
                fb.is_correct 
                  ? 'border-emerald-500/20 bg-emerald-500/10' 
                  : 'border-red-500/20 bg-red-500/10'
              }`}>
                {fb.is_correct ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`text-sm font-semibold ${
                  fb.is_correct ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {language === 'hi' ? 'प्रश्न' : 'Question'} {i + 1}
                  {fb.is_correct 
                    ? (language === 'hi' ? ' — सही' : ' — Correct') 
                    : (language === 'hi' ? ' — गलत' : ' — Incorrect')}
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Answer Comparison */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Your Answer */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                      {language === 'hi' ? 'आपका उत्तर' : 'Your Answer'}
                    </p>
                    <p className={`text-sm ${fb.is_correct ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {Array.isArray(fb.user_answer) 
                        ? fb.user_answer.join(', ') 
                        : fb.user_answer || (language === 'hi' ? 'कोई उत्तर नहीं' : 'No answer')}
                    </p>
                  </div>
                  
                  {/* Correct Answer */}
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-xs text-emerald-400/80 mb-2 uppercase tracking-wider">
                      {language === 'hi' ? 'सही उत्तर' : 'Correct Answer'}
                    </p>
                    <p className="text-sm text-emerald-400">
                      {fb.correct_answer.answer || 
                       fb.correct_answer.answers?.join(', ') || 
                       fb.correct_answer.keywords?.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-violet-500/5 border border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                      {language === 'hi' ? 'मेंटर की अंतर्दृष्टि' : 'Mentor Insight'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {fb.explanation}
                  </p>
                </div>

                {/* Red Flags (if incorrect) */}
                {!fb.is_correct && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                        {language === 'hi' ? 'चूके हुए संकेत' : 'Missed Red Flags'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      {language === 'hi'
                        ? 'इस प्रश्न में, सबूतों में कुछ महत्वपूर्ण संकेत थे जो सही निष्कर्ष की ओर इशारा करते थे। भविष्य में ऐसे पैटर्न पर ध्यान दें।'
                        : 'In this question, there were key indicators in the evidence that pointed toward the correct conclusion. Pay attention to similar patterns in future cases.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Learnings Summary */}
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-violet-500/5 backdrop-blur-sm p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30">
            <Award className="w-6 h-6 text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-violet-400 mb-3">
              {language === 'hi' ? 'प्रमुख सीख' : 'Key Learnings'}
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400 flex-shrink-0 mt-1" />
                <p className="text-sm text-zinc-300">
                  {language === 'hi'
                    ? 'हमेशा प्रेषक की पहचान और डोमेन की वैधता सत्यापित करें।'
                    : 'Always verify sender identity and domain legitimacy before trusting any communication.'}
                </p>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400 flex-shrink-0 mt-1" />
                <p className="text-sm text-zinc-300">
                  {language === 'hi'
                    ? 'अग्रिम भुगतान की मांग एक प्रमुख लाल झंडा है।'
                    : 'Requests for advance payments or personal information are major red flags.'}
                </p>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400 flex-shrink-0 mt-1" />
                <p className="text-sm text-zinc-300">
                  {language === 'hi'
                    ? 'तात्कालिकता और दबाव की भावना स्कैमर्स की आम रणनीति है।'
                    : 'Urgency and pressure tactics are common manipulation techniques used by scammers.'}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Back to Cases Button */}
      <Button 
        onClick={onBack}
        className="w-full h-14 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-lg font-semibold border-0"
      >
        <Shield className="w-5 h-5 mr-2" />
        {language === 'hi' ? 'केस सूची पर वापस जाएं' : 'Return to Case List'}
      </Button>
    </div>
  );
};

export default CaseResults;
