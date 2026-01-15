import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NormiCyteScoreProps {
  score?: number;
  weeklyChange?: number;
}

const NormiCyteScore: React.FC<NormiCyteScoreProps> = ({ score = 0, weeklyChange = 0 }) => {
  const { t, language } = useLanguage();
  
  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: t('secure'), color: 'text-success', bg: 'from-success/20 to-success/5' };
    if (score >= 60) return { label: t('moderate'), color: 'text-primary', bg: 'from-primary/20 to-primary/5' };
    if (score >= 40) return { label: t('lowRisk'), color: 'text-warning', bg: 'from-warning/20 to-warning/5' };
    return { label: t('atRisk'), color: 'text-destructive', bg: 'from-destructive/20 to-destructive/5' };
  };

  const level = getScoreLevel(score);
  const circumference = 2 * Math.PI * 45;
  const displayScore = Math.min(score, 100); // Cap at 100 for circle
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const getTrendIcon = () => {
    if (weeklyChange > 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (weeklyChange < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendText = () => {
    if (weeklyChange === 0) {
      return language === 'hi' ? 'कोई बदलाव नहीं' : 'No change this week';
    }
    const sign = weeklyChange > 0 ? '+' : '';
    return language === 'hi' 
      ? `${sign}${weeklyChange} अंक इस सप्ताह` 
      : `${sign}${weeklyChange} points this week`;
  };

  return (
    <div className="glass-card-glow p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{t('normiCyteScore')}</h3>
      </div>

      <div className="flex flex-col items-center">
        {/* Circular progress */}
        <div className="relative w-40 h-40 mb-4">
          {/* Background glow */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-b ${level.bg} blur-xl`} />
          
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-foreground">{score}</span>
            <span className={`text-sm font-medium ${level.color}`}>{level.label}</span>
          </div>
        </div>

        {/* Stats */}
        <div className={`flex items-center gap-2 text-sm ${weeklyChange > 0 ? 'text-success' : weeklyChange < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {getTrendIcon()}
          <span>{getTrendText()}</span>
        </div>
      </div>
    </div>
  );
};

export default NormiCyteScore;
