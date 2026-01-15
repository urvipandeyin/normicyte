import React from 'react';
import CyberGrid from '@/components/landing/CyberGrid';
import HeroSection from '@/components/landing/HeroSection';
import LanguageToggle from '@/components/ui/LanguageToggle';

const Landing: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Language toggle */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle />
      </div>

      {/* Animated background */}
      <CyberGrid />

      {/* Hero content */}
      <HeroSection />
    </div>
  );
};

export default Landing;
