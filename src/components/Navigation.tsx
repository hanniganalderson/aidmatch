// src/components/Navigation.tsx
import { LayoutDashboard, Search, FileText, Bookmark, Settings, Info, LogOut, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { NavItem } from '../types';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Find Scholarships', href: '/questionnaire', icon: Search },
  { label: 'My Applications', href: '/applications', icon: FileText },
  { label: 'Saved', href: '/saved', icon: Bookmark },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'About', href: '/about', icon: Info }
];

export function Navigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isQuestionnaire = location.pathname === '/questionnaire';

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        const IconComponent = item.icon;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive 
                ? 'bg-[#3B3B3B] text-white' 
                : 'text-gray-400 hover:text-white hover:bg-[#3B3B3B]/50'
            }`}
          >
            <IconComponent className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
      
      <div className="mt-4">
        <div className="flex flex-col space-y-2">
          {user ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <>
              <Link
                to="/signin"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
              <Link
                to={isQuestionnaire ? "/signup" : "/questionnaire"}
                className="flex items-center justify-center px-3 py-2 text-sm font-medium bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors"
              >
                {isQuestionnaire ? "Sign Up" : "Get Started"}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
