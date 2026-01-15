import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NormiCyteScore from '@/components/dashboard/NormiCyteScore';
import ThreatFeed from '@/components/dashboard/ThreatFeed';
import ActiveMissions from '@/components/dashboard/ActiveMissions';
import CampaignBanner from '@/components/dashboard/CampaignBanner';
import RecentActivity from '@/components/dashboard/RecentActivity';
import CaseProgress from '@/components/dashboard/CaseProgress';
import ProfileSetupWizard from '@/components/profile/ProfileSetupWizard';
import { useAuth } from '@/contexts/AuthContext';
import { getWeeklyScoreChange } from '@/firebase/database';

interface DashboardStats {
  normicyteScore: number;
  casesSolved: number;
  missionsCompleted: number;
  accuracy: number;
  weeklyChange: number;
}

const Dashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    normicyteScore: 0,
    casesSolved: 0,
    missionsCompleted: 0,
    accuracy: 0,
    weeklyChange: 0,
  });

  useEffect(() => {
    if (profile && !profile.profile_completed) {
      setShowProfileSetup(true);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      const weeklyChange = getWeeklyScoreChange(profile);
      setStats({
        normicyteScore: profile.normicyte_score || 0,
        casesSolved: profile.cases_solved || 0,
        missionsCompleted: profile.missions_completed || 0,
        accuracy: Number(profile.accuracy_percentage) || 0,
        weeklyChange,
      });
    }
  }, [profile]);

  const handleProfileSetupComplete = async () => {
    setShowProfileSetup(false);
    await refreshProfile();
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <DashboardHeader />
        
        <main className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-1 space-y-6">
              <NormiCyteScore score={stats.normicyteScore} weeklyChange={stats.weeklyChange} />
              <CampaignBanner />
              <RecentActivity />
            </div>

            {/* Right columns */}
            <div className="lg:col-span-2 space-y-6">
              <CaseProgress />
              <ThreatFeed />
              <ActiveMissions />
            </div>
          </div>
        </main>
      </div>

      {showProfileSetup && (
        <ProfileSetupWizard onComplete={handleProfileSetupComplete} />
      )}
    </div>
  );
};

export default Dashboard;
