import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getCaseQuestions,
  updateCaseProgress,
  updateProfileStatsOnCaseComplete,
  addUserActivity,
  updateWeeklyProgress
} from '@/firebase/database';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  AlertTriangle, ChevronLeft, Send, Shield, Lock,
  FileText, CheckCircle, AlertCircle
} from 'lucide-react';

interface Case {
  id: string;
  case_number: string;
  title_en: string;
  title_hi: string;
  xp_reward: number;
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

interface Props {
  caseData: Case;
  responses: any[];
  onBack: () => void;
  onSubmit: () => void;
}

const SubmitAnalysis: React.FC<Props> = ({ caseData, responses, onBack, onSubmit }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [caseData.id]);

  const fetchQuestions = async () => {
    try {
      const questionsData = await getCaseQuestions(caseData.id);
      setQuestions(questionsData as Question[]);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirmed || !user) return;
    
    setSubmitting(true);

    try {
      // Calculate score
      let correct = 0;
      const feedback: any[] = [];
      
      questions.forEach((q, i) => {
        const userAnswer = responses[i];
        const correctAnswer = q.correct_answer;
        let isCorrect = false;
        
        if (q.question_type === 'multiple_choice' || q.question_type === 'yes_no_reasoning') {
          isCorrect = userAnswer === correctAnswer.answer;
        } else if (q.question_type === 'multi_select') {
          const userSet = new Set(userAnswer || []);
          const correctSet = new Set(correctAnswer.answers || []);
          isCorrect = userSet.size === correctSet.size && [...userSet].every(x => correctSet.has(x));
        } else if (q.question_type === 'short_answer') {
          const keywords = correctAnswer.keywords || [];
          const answerLower = (userAnswer || '').toLowerCase();
          isCorrect = keywords.some((kw: string) => answerLower.includes(kw.toLowerCase()));
        }
        
        if (isCorrect) correct++;
        feedback.push({
          question_id: q.id,
          user_answer: userAnswer,
          correct_answer: correctAnswer,
          is_correct: isCorrect,
          explanation: language === 'hi' ? q.explanation_hi : q.explanation_en
        });
      });
      
      const score = Math.round((correct / questions.length) * 100);
      const verdict = score >= 80 ? 'solved' : score >= 50 ? 'partially_solved' : 'needs_improvement';
      const xpReward = caseData.xp_reward || 100;
      const xpEarned = Math.round(xpReward * (score / 100));
      
      // Update case progress with reviewed status
      await updateCaseProgress(user.uid, caseData.id, {
        status: 'reviewed',
        score,
        verdict: verdict as any,
        feedback,
        submitted_at: new Date()
      });
      
      // Update profile stats (score, cases_solved, accuracy)
      await updateProfileStatsOnCaseComplete(user.uid, xpEarned, score);
      
      // Log activity
      await addUserActivity(user.uid, {
        activity_type: 'case_completed',
        title_en: `Completed ${caseData.case_number}: ${caseData.title_en}`,
        title_hi: `${caseData.case_number} पूर्ण: ${caseData.title_hi}`,
        xp_earned: xpEarned,
      });
      
      // Update weekly progress
      const scoreChange = score >= 80 ? 50 : score >= 50 ? 30 : 10;
      await updateWeeklyProgress(user.uid, scoreChange, 1, xpEarned);
      
      toast.success(language === 'hi' ? 'विश्लेषण जमा हो गया!' : 'Analysis submitted successfully!');
      onSubmit();
    } catch (error) {
      console.error('Error submitting analysis:', error);
      toast.error(language === 'hi' ? 'जमा करने में त्रुटि' : 'Error submitting analysis');
      setSubmitting(false);
    }
  };

  const formatAnswer = (answer: any) => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    if (typeof answer === 'string' && answer.length > 100) {
      return answer.substring(0, 100) + '...';
    }
    return answer || '-';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-1/3"></div>
          <div className="h-64 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Warning Banner */}
      <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/30">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <span className="text-sm font-semibold text-red-400">
          {language === 'hi' ? 'अंतिम जमा • संशोधन संभव नहीं' : 'FINAL SUBMISSION • NO MODIFICATIONS ALLOWED'}
        </span>
        <AlertTriangle className="w-5 h-5 text-red-400" />
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-amber-950/20 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <Send className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                {language === 'hi' ? 'विश्लेषण जमा करें' : 'SUBMIT ANALYSIS'}
              </h2>
              <p className="text-sm text-zinc-400 font-mono">{caseData.case_number}</p>
            </div>
          </div>
        </div>

        {/* Response Summary */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">
              {language === 'hi' ? 'आपके उत्तरों का सारांश' : 'Your Response Summary'}
            </h3>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {questions.map((q, i) => (
              <div 
                key={q.id} 
                className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-slate-700/50 bg-slate-800/20 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono">
                    {language === 'hi' ? 'प्रश्न' : 'QUESTION'} {i + 1}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    responses[i] 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {responses[i] 
                      ? (language === 'hi' ? 'उत्तर दिया' : 'Answered') 
                      : (language === 'hi' ? 'छोड़ा गया' : 'Skipped')}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-sm text-zinc-300 mb-3">
                    {language === 'hi' ? q.question_hi : q.question_en}
                  </p>
                  <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                    <p className="text-xs text-cyan-400/80 mb-1">
                      {language === 'hi' ? 'आपका उत्तर' : 'Your Answer'}:
                    </p>
                    <p className="text-sm text-white">
                      {formatAnswer(responses[i])}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Warning */}
        <div className="mx-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400 mb-1">
                {language === 'hi' ? 'महत्वपूर्ण सूचना' : 'Critical Notice'}
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {language === 'hi'
                  ? 'एक बार जमा करने के बाद, आप अपने उत्तर नहीं बदल पाएंगे। आपके विश्लेषण का मूल्यांकन किया जाएगा और परिणाम आपको दिखाए जाएंगे। सुनिश्चित करें कि आपने सभी प्रश्नों की समीक्षा कर ली है।'
                  : 'Once submitted, you cannot modify your answers. Your analysis will be evaluated and results will be revealed. Make sure you have reviewed all your responses before confirming.'}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="mx-6 mb-6">
          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-700/50 bg-slate-800/20 cursor-pointer hover:border-cyan-500/30 transition-colors">
            <Checkbox 
              id="confirm" 
              checked={confirmed} 
              onCheckedChange={(c) => setConfirmed(!!c)} 
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-white">
                {language === 'hi' 
                  ? 'मैं पुष्टि करता/करती हूं कि यह मेरा अंतिम विश्लेषण है'
                  : 'I confirm this is my final analysis'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {language === 'hi'
                  ? 'मैं समझता/समझती हूं कि जमा करने के बाद कोई बदलाव नहीं किया जा सकता'
                  : 'I understand that no changes can be made after submission'}
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/20">
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              disabled={submitting}
              className="flex-1 border-slate-700 bg-slate-800/50 text-zinc-300 hover:bg-slate-800 hover:text-white hover:border-slate-600"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {language === 'hi' ? 'वापस जाएं' : 'Go Back'}
            </Button>
            
            <Button 
              onClick={handleSubmit}
              disabled={!confirmed || submitting}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {language === 'hi' ? 'जमा हो रहा है...' : 'Submitting...'}
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {language === 'hi' ? 'विश्लेषण जमा करें' : 'Submit Analysis'}
                </>
              )}
            </Button>
          </div>
          
          {/* Lock Notice */}
          <p className="text-xs text-center text-zinc-600 mt-3 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" />
            {language === 'hi' 
              ? 'यह क्रिया अपरिवर्तनीय है'
              : 'This action is irreversible'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubmitAnalysis;
