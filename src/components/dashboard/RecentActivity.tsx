import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUserActivities } from '@/firebase/database';
import { Activity, Star, Search, Mail, Target, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityItem {
  id: string;
  activity_type: string;
  title_en: string;
  title_hi: string;
  xp_earned: number;
  created_at: string;
}

const RecentActivity: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;
    
    try {
      const data = await getUserActivities(user.uid, 5);
      setActivities(data.map(a => ({
        ...a,
        created_at: a.created_at instanceof Date ? a.created_at.toISOString() : String(a.created_at),
      })));
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
    setLoading(false);
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

  return (
    <div className="glass-card p-5 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">
          {language === 'hi' ? 'हालिया गतिविधि' : 'Recent Activity'}
        </h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {language === 'hi' 
            ? 'अभी तक कोई गतिविधि नहीं। मिशन शुरू करें!' 
            : 'No activity yet. Start a mission!'}
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.activity_type);
            return (
              <div 
                key={activity.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {language === 'hi' ? activity.title_hi : activity.title_en}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getTimeAgo(activity.created_at)}
                  </p>
                </div>
                {activity.xp_earned > 0 && (
                  <div className="flex items-center gap-1 text-xs font-medium text-primary">
                    <Star className="w-3 h-3" />
                    +{activity.xp_earned}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
