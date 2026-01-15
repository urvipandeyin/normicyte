import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { Bell, User, Search, LogOut, Settings, Flame } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DashboardHeader: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Welcome message */}
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('commandCenter')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('welcomeBack')}{profile?.display_name ? `, ${profile.display_name}` : ''}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Streak indicator */}
          {profile?.streak && profile.streak.current_streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">
                {profile.streak.current_streak}
              </span>
            </div>
          )}

          {/* Search */}
          <button className="p-2.5 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted hover:border-primary/30 transition-all duration-200">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted hover:border-primary/30 transition-all duration-200">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* Language toggle */}
          <LanguageToggle />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted hover:border-primary/30 transition-all duration-200">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-sm font-medium text-foreground block leading-tight">
                    {profile?.display_name || 'Agent'}
                  </span>
                  <span className="text-xs text-primary">
                    {profile?.normicyte_score || 0} pts
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                {language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Settings className="w-4 h-4 mr-2" />
                {language === 'hi' ? 'सेटिंग्स' : 'Settings'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
