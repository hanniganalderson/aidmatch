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
    <nav className="navbar">
      <div className="navbar-container">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <GraduationCap className="w-8 h-8 text-[#5865F2] transition-transform duration-200 group-hover:scale-110" />
            <span className="text-xl font-bold bg-gradient-to-r from-[#5865F2] to-[#4A90E2] bg-clip-text text-transparent">
              AidMatch
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="navbar-link"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <button
                onClick={() => signOut()}
                className="navbar-link"
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
                className="navbar-link"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn-primary"
              >
                Sign Up →
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}