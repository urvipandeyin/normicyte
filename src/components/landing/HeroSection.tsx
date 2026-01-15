import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
      {/* Logo */}
      <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 backdrop-blur-xl">
          <Shield className="w-10 h-10 text-primary" />
          <div className="absolute inset-0 rounded-2xl animate-glow-pulse" />
        </div>
      </div>

      {/* Brand name */}
      <h1 
        className="text-5xl md:text-7xl font-bold mb-4 tracking-tight animate-fade-in"
        style={{ animationDelay: '0.2s' }}
      >
        <span className="text-gradient-cyber">NormiCyte</span>
      </h1>

      {/* Tagline */}
      <p 
        className="text-2xl md:text-3xl font-light text-primary text-glow-cyan mb-6 animate-fade-in"
        style={{ animationDelay: '0.3s' }}
      >
        {t('tagline')}
      </p>

      {/* Subtitle */}
      <p 
        className="max-w-2xl text-lg text-muted-foreground mb-12 leading-relaxed animate-fade-in"
        style={{ animationDelay: '0.4s' }}
      >
        {t('subtitle')}
      </p>

      {/* CTA Buttons */}
      <div 
        className="flex flex-col sm:flex-row gap-4 animate-fade-in"
        style={{ animationDelay: '0.5s' }}
      >
        <Button
          onClick={() => navigate('/dashboard')}
          size="lg"
          className="group relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold px-8 py-6 text-lg rounded-xl border-0 hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all duration-300"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {t('getStarted')}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>

        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          size="lg"
          className="px-8 py-6 text-lg rounded-xl border-primary/30 bg-card/30 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
        >
          {t('exploreDashboard')}
        </Button>
      </div>

      {/* Feature pills */}
      <div 
        className="flex flex-wrap justify-center gap-3 mt-16 animate-fade-in"
        style={{ animationDelay: '0.6s' }}
      >
        {['Phishing Simulations', 'AI Mentor', 'Threat Training', 'Digital Detective'].map((feature, i) => (
          <span
            key={feature}
            className="px-4 py-2 rounded-full text-sm font-medium bg-card/50 border border-primary/20 text-muted-foreground backdrop-blur-sm"
          >
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
