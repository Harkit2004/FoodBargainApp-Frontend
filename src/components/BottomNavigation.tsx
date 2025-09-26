import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Utensils, User, Store } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  requiresPartner?: boolean;
}

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const allNavItems: NavItem[] = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/restaurants', icon: Utensils, label: 'Restaurants' },
    { path: '/partner', icon: Store, label: 'Partner', requiresPartner: true },
    { path: '/profile', icon: User, label: 'Profile' },
  ];
  
  // Filter nav items based on user permissions
  const navItems = allNavItems.filter(item => {
    if (item.requiresPartner) {
      console.log('Partner check - user:', user, 'isPartner:', user?.isPartner);
      return user?.isPartner === true;
    }
    return true;
  });

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50">
      <div className="w-full max-w-md">
        <nav className="bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 mx-2 mb-2 rounded-xl shadow-lg">
          <div className="flex justify-around px-2 py-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                    isActive 
                      ? 'text-blue-400 bg-blue-500/20 shadow-sm shadow-blue-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};