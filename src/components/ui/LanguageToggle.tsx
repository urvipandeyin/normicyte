import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 group"
    >
      <Globe className="w-4 h-4 text-primary group-hover:text-primary" />
      <span className="text-sm font-medium text-foreground/90">
        {language === 'en' ? 'हिंदी' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageToggle;
