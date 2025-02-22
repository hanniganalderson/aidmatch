import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { NavItem } from '../types';

const navItems: NavItem[] = [
  { label: 'About', href: '/about' }
];

export function Navigation() {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/20">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-semibold"
        >
          <GraduationCap className="w-6 h-6 text-[#5865F2]" />
          <span className="text-white">AidMatch</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
              <Link
                to="/questionnaire"
                className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}