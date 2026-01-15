import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { uploadAvatar } from '@/firebase/storage';
import { getUserActivities, getWeeklyScoreChange } from '@/firebase/database';
import { BADGE_DEFINITIONS } from '@/firebase/types';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Shield, Target, CheckCircle, Award, TrendingUp, 
  Edit, Camera, Save, X, Flame, Star, Clock,
  Search, Mail
} from 'lucide-react';

interface ActivityItem {
  id: string;
  activity_type: string;
  title_en: string;
  title_hi: string;
  xp_earned: number;
  created_at: string;
}

const Profile: React.FC = () => {
  const { profile, updateProfile, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    if (profile) {
      setEditDisplayName(profile.display_name || '');
      setEditUsername(profile.username || '');
      fetchActivities();
    }
  }, [profile]);

  const fetchActivities = async () => {
    if (!profile) return;
    try {
      const data = await getUserActivities(profile.user_id, 10);
      setActivities(data.map(a => ({
        ...a,
        created_at: a.created_at instanceof Date ? a.created_at.toISOString() : String(a.created_at),
      })));
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
    setLoadingActivities(false);
  };

  const getRoleLabel = (role: string | null) => {
    switch(role) {
      case 'student': return t('roleStudent');
      case 'beginner': return t('roleBeginner');
      case 'cyber_learner': return t('roleCyberLearner');
      case 'enthusiast': return t('roleEnthusiast');
      default: return t('roleCyberLearner');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(t('invalidFileType'));
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('fileTooLarge'));
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const { url, error } = await uploadAvatar(
        profile.user_id, 
        file,
        (progress) => setUploadProgress(progress)
      );

      if (error) throw error;

      if (url) {
        await updateProfile({ avatar_url: url });
        await refreshProfile();
        toast.success(t('avatarUploaded'));
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error?.code === 'storage/unauthorized') {
        toast.error(language === 'hi' ? 'अपलोड की अनुमति नहीं है' : 'Upload not authorized');
      } else {
        toast.error(t('uploadFailed'));
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!editDisplayName.trim()) {
      toast.error(t('enterDisplayName'));
      return;
    }

    setSaving(true);
    try {
      const { error } = await updateProfile({
        display_name: editDisplayName.trim(),
        username: editUsername.trim() || null,
      });

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      toast.success(language === 'hi' ? 'प्रोफ़ाइल अपडेट हो गई!' : 'Profile updated!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(t('profileUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'case_completed': return Search;
      case 'mission_completed': return Target;
      case 'phishing_detected': return Mail;
      default: return CheckCircle;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return language === 'hi' ? `${diffMins} मिनट पहले` : `${diffMins}m ago`;
    if (diffHours < 24) return language === 'hi' ? `${diffHours} घंटे पहले` : `${diffHours}h ago`;
    return language === 'hi' ? `${diffDays} दिन पहले` : `${diffDays}d ago`;
  };

  const earnedBadgeIds = (profile?.badges || []).map(b => b.badge_id);
  const weeklyChange = profile ? getWeeklyScoreChange(profile) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <DashboardHeader />
        
        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Identity Card */}
            <div className="glass-card-glow rounded-2xl p-8">
              <div className="flex items-start gap-6">
                {/* Avatar with upload */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden bg-muted">
                    <img 
                      src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=cyber1'} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <label className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity ${uploading ? 'opacity-100' : ''}`}>
                    {uploading ? (
                      <div className="text-center">
                        <div className="text-xs text-white mb-1">{Math.round(uploadProgress)}%</div>
                      </div>
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/gif,image/webp" 
                      onChange={handleAvatarUpload}
                      className="hidden" 
                      disabled={uploading}
                    />
                  </label>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('displayName')}</Label>
                        <Input
                          value={editDisplayName}
                          onChange={(e) => setEditDisplayName(e.target.value)}
                          placeholder={t('displayNamePlaceholder')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('username')}</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                          <Input
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            className="pl-8"
                            placeholder="cyber_agent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} disabled={saving} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? (language === 'hi' ? 'सेव हो रहा है...' : 'Saving...') : (language === 'hi' ? 'सेव करें' : 'Save')}
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                          <X className="w-4 h-4 mr-2" />
                          {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold text-foreground">
                          {profile?.display_name || 'Agent'}
                        </h1>
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      {profile?.username && (
                        <p className="text-muted-foreground mb-2">@{profile.username}</p>
                      )}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">{getRoleLabel(profile?.role)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Score */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-gradient-cyber">{profile?.normicyte_score || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('normiCyteScore')}</div>
                  {weeklyChange !== 0 && (
                    <div className={`text-xs mt-1 ${weeklyChange > 0 ? 'text-success' : 'text-destructive'}`}>
                      {weeklyChange > 0 ? '+' : ''}{weeklyChange} {language === 'hi' ? 'इस सप्ताह' : 'this week'}
                    </div>
                  )}
                </div>
              </div>

              {/* Streak Info */}
              {profile?.streak && profile.streak.current_streak > 0 && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold text-orange-500">
                        {profile.streak.current_streak} {language === 'hi' ? 'दिन की लकीर' : 'day streak'}
                      </span>
                    </div>
                    {profile.streak.longest_streak > profile.streak.current_streak && (
                      <span className="text-sm text-muted-foreground">
                        {language === 'hi' ? 'सबसे लंबी:' : 'Best:'} {profile.streak.longest_streak} {language === 'hi' ? 'दिन' : 'days'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{t('caseSolved')}</span>
                </div>
                <div className="text-3xl font-bold text-foreground">{profile?.cases_solved || 0}</div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <CheckCircle className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="font-medium text-foreground">{t('missions')}</span>
                </div>
                <div className="text-3xl font-bold text-foreground">{profile?.missions_completed || 0}</div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <span className="font-medium text-foreground">{t('accuracyScore')}</span>
                </div>
                <div className="text-3xl font-bold text-foreground">{profile?.accuracy_percentage || 0}%</div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Star className="w-5 h-5 text-warning" />
                  </div>
                  <span className="font-medium text-foreground">{language === 'hi' ? 'कुल XP' : 'Total XP'}</span>
                </div>
                <div className="text-3xl font-bold text-foreground">{profile?.total_xp || 0}</div>
              </div>
            </div>

            {/* Badges & Achievements */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                {language === 'hi' ? 'बैज और उपलब्धियां' : 'Badges & Achievements'}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {BADGE_DEFINITIONS.map((badge, index) => {
                  const badgeId = badge.name_en.toLowerCase().replace(/\s+/g, '_');
                  const isEarned = earnedBadgeIds.includes(badgeId);
                  
                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        isEarned 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-muted/30 border-border/50 opacity-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <p className="font-semibold text-foreground text-sm">
                        {language === 'hi' ? badge.name_hi : badge.name_en}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'hi' ? badge.description_hi : badge.description_en}
                      </p>
                      {isEarned && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-success">
                          <CheckCircle className="w-3 h-3" />
                          {language === 'hi' ? 'अर्जित' : 'Earned'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {language === 'hi' ? 'हालिया गतिविधि' : 'Recent Activity'}
              </h3>
              
              {loadingActivities ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{language === 'hi' ? 'अभी तक कोई गतिविधि नहीं' : 'No activity yet'}</p>
                  <p className="text-sm mt-1">{language === 'hi' ? 'केस हल करना शुरू करें!' : 'Start solving cases!'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => {
                    const Icon = getActivityIcon(activity.activity_type);
                    return (
                      <div 
                        key={activity.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            {language === 'hi' ? activity.title_hi : activity.title_en}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getTimeAgo(activity.created_at)}
                          </p>
                        </div>
                        {activity.xp_earned > 0 && (
                          <div className="flex items-center gap-1 text-sm font-medium text-primary">
                            <Star className="w-4 h-4" />
                            +{activity.xp_earned} XP
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
