import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Lightbulb, Shield, Lock, Smartphone, Globe, Phone, AlertTriangle, RefreshCw } from 'lucide-react';
import { getSecurityTips, DEFAULT_SECURITY_TIPS } from '@/firebase/database';
import type { SecurityTip } from '@/firebase/types';

const iconMap: Record<string, React.ElementType> = {
  shield: Shield,
  lock: Lock,
  globe: Globe,
  phone: Phone,
  alert: AlertTriangle,
  smartphone: Smartphone,
};

const ThreatFeed: React.FC = () => {
  const { t, language } = useLanguage();
  const [tips, setTips] = useState<SecurityTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const loadTips = async () => {
      setLoading(true);
      try {
        let securityTips = await getSecurityTips(5);
        
        // Use defaults if no tips in Firebase
        if (securityTips.length === 0) {
          securityTips = DEFAULT_SECURITY_TIPS.map((tip, index) => ({
            id: (index + 1).toString(),
            ...tip,
            created_at: new Date(),
          })) as SecurityTip[];
        }
        
        setTips(securityTips);
      } catch (error) {
        console.error('Error loading security tips:', error);
        // Use defaults on error
        const defaultTips = DEFAULT_SECURITY_TIPS.map((tip, index) => ({
          id: (index + 1).toString(),
          ...tip,
          created_at: new Date(),
        })) as SecurityTip[];
        setTips(defaultTips);
      } finally {
        setLoading(false);
      }
    };

    loadTips();
  }, []);

  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const getSeverityClass = (severity: SecurityTip['severity']) => {
    switch (severity) {
      case 'high': return 'badge-danger';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-info';
    }
  };

  const getCategoryLabel = (category: SecurityTip['category']) => {
    const labels: Record<string, { en: string; hi: string }> = {
      phishing: { en: 'Phishing', hi: 'फ़िशिंग' },
      password: { en: 'Passwords', hi: 'पासवर्ड' },
      upi: { en: 'UPI Safety', hi: 'UPI सुरक्षा' },
      social: { en: 'Social Media', hi: 'सोशल मीडिया' },
      general: { en: 'General', hi: 'सामान्य' },
    };
    return language === 'hi' ? labels[category]?.hi : labels[category]?.en;
  };

  if (loading) {
    return (
      <div className="glass-card-glow p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {language === 'hi' ? 'सुरक्षा सुझाव' : 'Security Tips'}
          </h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted/30 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card-glow p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {language === 'hi' ? 'सुरक्षा सुझाव' : 'Security Tips'}
          </h3>
        </div>
        <button 
          onClick={handleNextTip}
          className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          title={language === 'hi' ? 'अगला सुझाव' : 'Next tip'}
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-3">
        {tips.map((tip, index) => {
          const Icon = iconMap[tip.icon] || Shield;
          const isActive = index === currentTipIndex;
          
          return (
            <div
              key={tip.id}
              className={`p-4 rounded-xl border transition-all duration-300 animate-fade-in ${
                isActive 
                  ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20' 
                  : 'bg-card/50 border-border/50 hover:border-primary/30'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-primary/20 border border-primary/30' : 'bg-muted/50 border border-border/30'
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">
                      {language === 'hi' ? tip.title_hi : tip.title_en}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${getSeverityClass(tip.severity)}`}>
                      {getCategoryLabel(tip.category)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hi' ? tip.content_hi : tip.content_en}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThreatFeed;
