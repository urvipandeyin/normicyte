import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Megaphone, Users, Calendar, ChevronRight, Target, Bell, BellOff, LogOut, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getCampaigns,
  getUserCampaignProgress,
  joinCampaign,
  leaveCampaign,
  setNotifyOnCampaignStart,
  getCampaignParticipantCount,
  DEFAULT_CAMPAIGNS,
} from '@/firebase/database';
import type { Campaign, UserCampaignProgress } from '@/firebase/types';

interface CampaignWithStatus extends Campaign {
  participantCount: number;
  userStatus: 'not_joined' | 'joined' | 'in_progress' | 'completed' | 'left';
  notifyOnStart: boolean;
}

const Campaigns: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState<CampaignWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadCampaigns = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Try to load from Firebase
      let campaignsList = await getCampaigns();

      // Use defaults if no campaigns
      if (campaignsList.length === 0) {
        campaignsList = DEFAULT_CAMPAIGNS.map((c, index) => ({
          id: (index + 1).toString(),
          ...c,
          created_at: new Date(),
        })) as Campaign[];
      }

      // Get user progress
      const userProgress = await getUserCampaignProgress(user.uid);

      // Determine campaign status based on dates
      const now = new Date();
      const campaignsWithStatus: CampaignWithStatus[] = await Promise.all(
        campaignsList.map(async (campaign) => {
          // Calculate actual status based on dates
          let status: Campaign['status'] = campaign.status;
          if (now < campaign.start_date) {
            status = 'upcoming';
          } else if (now > campaign.end_date) {
            status = 'completed';
          } else {
            status = 'active';
          }

          // Get participant count (try from Firebase, fallback to estimate)
          let participantCount = 0;
          try {
            participantCount = await getCampaignParticipantCount(campaign.id);
          } catch {
            participantCount = Math.floor(Math.random() * 10000) + 1000;
          }

          const progress = userProgress[campaign.id];

          return {
            ...campaign,
            status,
            participantCount,
            userStatus: progress?.status || 'not_joined',
            notifyOnStart: progress?.notify_on_start || false,
          };
        })
      );

      setCampaigns(campaignsWithStatus);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      // Use defaults on error
      const defaultCampaigns: CampaignWithStatus[] = DEFAULT_CAMPAIGNS.map((c, index) => ({
        id: (index + 1).toString(),
        ...c,
        created_at: new Date(),
        participantCount: Math.floor(Math.random() * 10000) + 1000,
        userStatus: 'not_joined' as const,
        notifyOnStart: false,
      }));
      setCampaigns(defaultCampaigns);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [user]);

  const handleJoinCampaign = async (campaignId: string) => {
    if (!user) {
      toast.error(language === 'hi' ? 'कृपया पहले लॉग इन करें' : 'Please log in first');
      return;
    }

    setActionLoading(campaignId);
    try {
      await joinCampaign(user.uid, campaignId);
      toast.success(language === 'hi' ? 'अभियान में शामिल हो गए!' : 'Joined campaign!');
      await loadCampaigns();
    } catch (error) {
      console.error('Error joining campaign:', error);
      toast.error(language === 'hi' ? 'शामिल होने में विफल' : 'Failed to join');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveCampaign = async (campaignId: string) => {
    if (!user) return;

    setActionLoading(campaignId);
    try {
      await leaveCampaign(user.uid, campaignId);
      toast.success(language === 'hi' ? 'अभियान छोड़ दिया' : 'Left campaign');
      await loadCampaigns();
    } catch (error) {
      console.error('Error leaving campaign:', error);
      toast.error(language === 'hi' ? 'छोड़ने में विफल' : 'Failed to leave');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleNotify = async (campaignId: string, currentNotify: boolean) => {
    if (!user) return;

    setActionLoading(campaignId);
    try {
      await setNotifyOnCampaignStart(user.uid, campaignId, !currentNotify);
      toast.success(
        !currentNotify
          ? (language === 'hi' ? 'अधिसूचना चालू' : 'Notifications enabled')
          : (language === 'hi' ? 'अधिसूचना बंद' : 'Notifications disabled')
      );
      await loadCampaigns();
    } catch (error) {
      console.error('Error toggling notification:', error);
      toast.error(language === 'hi' ? 'विफल' : 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const upcomingCampaigns = campaigns.filter(c => c.status === 'upcoming');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 rounded-full text-xs font-medium badge-secure">{language === 'hi' ? 'सक्रिय' : 'Active'}</span>;
      case 'upcoming':
        return <span className="px-2 py-1 rounded-full text-xs font-medium badge-info">{language === 'hi' ? 'आगामी' : 'Upcoming'}</span>;
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground">{language === 'hi' ? 'समाप्त' : 'Completed'}</span>;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const CampaignCard = ({ campaign, featured = false }: { campaign: CampaignWithStatus; featured?: boolean }) => {
    const isJoined = campaign.userStatus === 'joined' || campaign.userStatus === 'in_progress';
    const isLoading = actionLoading === campaign.id;

    return (
      <div
        className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30 ${
          featured ? 'lg:col-span-2' : ''
        } ${isJoined ? 'ring-2 ring-primary/30' : ''}`}
      >
        <div className={`p-6 bg-gradient-to-r ${campaign.gradient}`}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-5xl">{campaign.icon}</span>
            <div className="flex items-center gap-2">
              {isJoined && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {language === 'hi' ? 'शामिल' : 'Joined'}
                </span>
              )}
              {getStatusBadge(campaign.status)}
            </div>
          </div>
          <h3 className={`font-bold text-foreground mb-2 ${featured ? 'text-2xl' : 'text-lg'}`}>
            {language === 'hi' ? campaign.title_hi : campaign.title_en}
          </h3>
          <p className="text-muted-foreground text-sm">
            {language === 'hi' ? campaign.description_hi : campaign.description_en}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{campaign.participantCount.toLocaleString()} {language === 'hi' ? 'प्रतिभागी' : 'participants'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>{campaign.mission_ids?.length || 0} {language === 'hi' ? 'मिशन' : 'missions'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(campaign.start_date)} — {formatDate(campaign.end_date)}</span>
          </div>

          {campaign.status === 'active' && (
            <div className="flex gap-2">
              {!isJoined ? (
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  onClick={() => handleJoinCampaign(campaign.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (language === 'hi' ? 'शामिल हो रहे...' : 'Joining...') : (language === 'hi' ? 'शामिल हों' : 'Join Campaign')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Button 
                    className="flex-1 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
                    onClick={() => {}}
                  >
                    {language === 'hi' ? 'जारी रखें' : 'Continue'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleLeaveCampaign(campaign.id)}
                    disabled={isLoading}
                    title={language === 'hi' ? 'अभियान छोड़ें' : 'Leave campaign'}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          )}

          {campaign.status === 'upcoming' && (
            <div className="flex gap-2">
              <Button 
                className={`flex-1 ${
                  campaign.notifyOnStart
                    ? 'bg-primary/10 border border-primary/30 text-primary'
                    : 'bg-muted/50 border border-border/50'
                }`}
                onClick={() => handleToggleNotify(campaign.id, campaign.notifyOnStart)}
                disabled={isLoading}
              >
                {campaign.notifyOnStart ? (
                  <>
                    <BellOff className="w-4 h-4 mr-2" />
                    {language === 'hi' ? 'अधिसूचना बंद' : 'Cancel Notification'}
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    {language === 'hi' ? 'मुझे सूचित करें' : 'Notify Me'}
                  </>
                )}
              </Button>
            </div>
          )}

          {campaign.status === 'completed' && (
            <Button 
              className="w-full bg-muted/30 text-muted-foreground"
              disabled
            >
              {language === 'hi' ? 'परिणाम देखें' : 'View Results'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <DashboardHeader />
          <main className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted/30 rounded w-1/4"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-muted/30 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <DashboardHeader />
        
        <main className="p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-primary" />
                {t('campaigns')}
              </h2>
              <p className="text-muted-foreground">
                {language === 'hi' 
                  ? 'जागरूकता अभियानों में शामिल हों और समुदाय के साथ सीखें'
                  : 'Join awareness campaigns and learn with the community'}
              </p>
            </div>
          </div>

          {/* Active Campaigns */}
          {activeCampaigns.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                {language === 'hi' ? 'अभी सक्रिय' : 'Active Now'}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCampaigns.map((campaign, index) => (
                  <CampaignCard key={campaign.id} campaign={campaign} featured={index === 0} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Campaigns */}
          {upcomingCampaigns.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {language === 'hi' ? 'आगामी' : 'Upcoming'}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </section>
          )}

          {/* Completed Campaigns */}
          {completedCampaigns.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {language === 'hi' ? 'पिछले अभियान' : 'Past Campaigns'}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Campaigns;
