import React from 'react';

const CyberGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated grid */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-50" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 scanlines opacity-20" />
      
      {/* Corner accents */}
      <svg className="absolute top-8 left-8 w-24 h-24 text-primary/30" viewBox="0 0 100 100">
        <path d="M0 30 L0 0 L30 0" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <svg className="absolute top-8 right-8 w-24 h-24 text-primary/30" viewBox="0 0 100 100">
        <path d="M70 0 L100 0 L100 30" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <svg className="absolute bottom-8 left-8 w-24 h-24 text-primary/30" viewBox="0 0 100 100">
        <path d="M0 70 L0 100 L30 100" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <svg className="absolute bottom-8 right-8 w-24 h-24 text-primary/30" viewBox="0 0 100 100">
        <path d="M70 100 L100 100 L100 70" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default CyberGrid;
