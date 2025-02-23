import { GraduationCap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { NavItem } from '../types';

const navItems: NavItem[] = [
  { label: 'About', href: '/about' }
];

export function Navigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isQuestionnaire = location.pathname === '/questionnaire';

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-semibold group"
        >
          <div className="p-2 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
            <GraduationCap className="w-6 h-6 text-primary-500" />
          </div>
          <span className="bg-gradient-premium bg-clip-text text-transparent">AidMatch</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={() => signOut()}
                className="btn-outline"
              >
                Sign Out
              </button>
              <Link
                to="/questionnaire"
                className="btn-primary"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="btn-outline"
              >
                Sign In
              </Link>
              <Link
                to={isQuestionnaire ? "/signup" : "/questionnaire"}
                className="btn-primary"
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