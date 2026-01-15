import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Megaphone, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Campaign {
  id: string;
  titleKey: string;
  description: string;
  gradient: string;
  icon: string;
}

const campaigns: Campaign[] = [
  {
    id: '1',
    titleKey: 'upiSafetyWeek',
    description: 'Learn to protect your UPI transactions from scammers',
    gradient: 'from-neon-cyan/20 via-neon-blue/10 to-transparent',
    icon: '💳',
  },
  {
    id: '2',
    titleKey: 'phishingAwareness',
    description: 'Identify and avoid phishing emails, messages, and websites',
    gradient: 'from-neon-violet/20 via-neon-blue/10 to-transparent',
    icon: '🎣',
  },
  {
    id: '3',
    titleKey: 'socialMediaPrivacy',
    description: 'Secure your social media accounts and protect your privacy',
    gradient: 'from-neon-blue/20 via-neon-cyan/10 to-transparent',
    icon: '🔒',
  },
  {
    id: '4',
    titleKey: 'jobScamAwareness',
    description: 'Spot fake job offers and protect yourself from employment fraud',
    gradient: 'from-neon-orange/20 via-neon-red/10 to-transparent',
    icon: '💼',
  },
];

const CampaignBanner: React.FC = () => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const campaign = campaigns[currentIndex];

  return (
    <div className="glass-card-glow p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{t('awareness')}</h3>
      </div>

      <div className="relative overflow-hidden rounded-xl">
        <div className={`p-6 bg-gradient-to-r ${campaign.gradient} border border-primary/20 rounded-xl transition-all duration-500`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{campaign.icon}</span>
                <h4 className="text-xl font-bold text-foreground">{t(campaign.titleKey)}</h4>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                {campaign.description}
              </p>
              <Button 
                size="sm" 
                className="bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary"
              >
                Join Campaign
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {campaigns.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignBanner;
