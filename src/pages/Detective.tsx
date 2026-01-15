import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import ProfileSetupWizard from '@/components/profile/ProfileSetupWizard';
import CaseList from '@/components/detective/CaseList';

const Detective: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { profile } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    if (profile && !profile.profile_completed) {
      setShowProfileSetup(true);
    }
  }, [profile]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <DashboardHeader />
        
        <main className="p-6">
          <CaseList />
        </main>
      </div>

      {showProfileSetup && (
        <ProfileSetupWizard onComplete={() => setShowProfileSetup(false)} />
      )}
    </div>
  );
};

export default Detective;
