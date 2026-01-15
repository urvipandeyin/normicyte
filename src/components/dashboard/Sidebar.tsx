import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Mail, 
  Search, 
  Target, 
  Megaphone, 
  Bot,
  Shield,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
    { path: '/phishing', icon: Mail, labelKey: 'phishingSimulator' },
    { path: '/detective', icon: Search, labelKey: 'digitalDetective' },
    { path: '/missions', icon: Target, labelKey: 'missions' },
    { path: '/campaigns', icon: Megaphone, labelKey: 'campaigns' },
    { path: '/assistant', icon: Bot, labelKey: 'aiAssistant' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <aside className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 flex flex-col ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-gradient-cyber">NormiCyte</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary/10 border border-primary/30 text-primary' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
              {!collapsed && (
                <span className="font-medium truncate">{t(item.labelKey)}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* Profile Link */}
        <NavLink
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
            location.pathname === '/profile'
              ? 'bg-primary/10 border border-primary/30 text-primary'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          }`}
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.display_name || 'Agent'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.normicyte_score || 0} XP
              </p>
            </div>
          )}
        </NavLink>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">{t('logout')}</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
