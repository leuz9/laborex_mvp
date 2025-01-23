import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  BarChart2, 
  Folder, 
  CheckSquare, 
  UserPlus, 
  Briefcase, 
  Trophy, 
  Brain, 
  Heart, 
  MessageSquare,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Battery,
  LogOut,
  Package,
  Shield,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';

const Sidebar: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { signOut, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isViewer = userProfile?.role === 'viewer';

  const mainMenuItems = [
    { icon: Home, label: 'Dashboard', value: 'dashboard', path: '/' },
    { icon: Package, label: 'Produits', value: 'products', path: '/products' },
    { icon: Users, label: 'Team', value: 'team', path: '/team' },
    { icon: CheckSquare, label: 'Tasks', value: 'tasks', path: '/tasks' },
    ...(!isViewer ? [{ icon: Briefcase, label: 'Charge de travail', value: 'workload', path: '/workload' }] : []),
  ];

  const analyticsMenuItems = [
    { icon: BarChart2, label: 'Performance', value: 'performance-analytics', path: '/performance-analytics' },
    { icon: Battery, label: 'Ressources', value: 'resource-analytics', path: '/resource-analytics' },
    { icon: DollarSign, label: 'Budget', value: 'budget-analytics', path: '/budget-analytics' },
  ];

  const featureMenuItems = [
    // Gamification caché pour les viewers
    { icon: Trophy, label: 'Gamification', value: 'gamification', path: '/gamification' },
    // Développement caché pour les viewers
    ...(!isViewer ? [{ icon: Brain, label: 'Développement', value: 'career', path: '/career' }] : []),
    ...(!isViewer ? [{ icon: MessageSquare, label: 'Feedback', value: 'feedback', path: '/feedback' }] : []),
    { icon: Heart, label: 'Bien-être', value: 'wellness', path: '/wellness' },
    ...(!isViewer ? [{ icon: Calendar, label: 'Calendar', value: 'calendar', path: '/calendar' }] : []),
    { 
      icon: BookOpen, 
      label: 'Wiki Eyone', 
      value: 'wiki', 
      path: 'https://wiki.eyone.net',
      external: true 
    },
  ];

  const bottomMenuItems = [
    { icon: UserPlus, label: 'Invite Team', value: 'invite', path: '/invite', allowedRoles: ['superadmin', 'admin', 'manager'] },
    { icon: Shield, label: 'Gestion Utilisateurs', value: 'users', path: '/settings/users', allowedRoles: ['superadmin'] },
    { icon: Settings, label: 'Settings', value: 'settings', path: '/settings/user', allowedRoles: ['superadmin', 'admin', 'manager', 'team_lead', 'developer', 'viewer'] },
  ].filter(item => item.allowedRoles.includes(userProfile?.role || ''));

  const handleNavigation = (path: string, value: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank');
    } else {
      navigate(path);
      onTabChange(value);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="w-64 bg-eyone-gray-dark h-screen fixed left-0 top-0 text-white p-4 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <img 
            src="https://cdn1.vc4a.com/media/2017/06/eyone-logo.png"
            alt="Eyone Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-xl font-bold">EY-TEAMS</span>
        </div>
        <NotificationCenter />
      </div>

      {/* Profil utilisateur */}
      <div className="mb-6 p-4 bg-black/20 rounded-lg">
        <div className="flex items-center gap-3">
          <img
            src={userProfile?.avatar || DEFAULT_AVATAR}
            alt={userProfile?.displayName || 'Profile'}
            className="w-10 h-10 rounded-full object-cover border-2 border-eyone-orange"
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate" title={userProfile?.displayName || userProfile?.email}>
              {userProfile?.displayName || userProfile?.email}
            </div>
            <div className="text-sm text-gray-400 capitalize">{userProfile?.role || 'Utilisateur'}</div>
          </div>
        </div>
      </div>
      
      <nav className="space-y-2 flex-1 overflow-y-auto">
        {/* Menu principal */}
        {mainMenuItems.map(({ icon: Icon, label, value, path }) => (
          <button
            key={value}
            onClick={() => handleNavigation(path, value)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              location.pathname === path ? 'bg-eyone-orange' : 'hover:bg-white/10'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}

        {/* Section Analytics avec sous-menu - Caché pour les viewers */}
        {!isViewer && (
          <div className="py-2">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center justify-between w-full p-3 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <BarChart2 className="w-5 h-5" />
                <span>Analytics</span>
              </div>
              {showAnalytics ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {showAnalytics && (
              <div className="ml-4 mt-2 space-y-1">
                {analyticsMenuItems.map(({ icon: Icon, label, value, path }) => (
                  <button
                    key={value}
                    onClick={() => handleNavigation(path, value)}
                    className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${
                      location.pathname === path ? 'bg-eyone-orange' : 'hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fonctionnalités additionnelles */}
        {featureMenuItems.map(({ icon: Icon, label, value, path, external }) => (
          <button
            key={value}
            onClick={() => handleNavigation(path, value, external)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              location.pathname === path ? 'bg-eyone-orange' : 'hover:bg-white/10'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {external && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>
        ))}
      </nav>

      <div className="pt-4 space-y-2 border-t border-gray-700">
        {bottomMenuItems.map(({ icon: Icon, label, value, path }) => (
          <button
            key={value}
            onClick={() => handleNavigation(path, value)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              location.pathname === path ? 'bg-eyone-orange' : 'hover:bg-white/10'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
        
        {/* Bouton de déconnexion */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 text-eyone-orange hover:bg-eyone-orange/10 hover:text-eyone-orange/90 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;