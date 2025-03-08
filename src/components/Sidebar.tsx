import { NavLink } from 'react-router-dom';
import { Home, Search, BookOpen, User, Settings } from 'lucide-react';
import type { NavItem } from '../types';

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    label: 'Search',
    href: '/search',
    icon: Search
  },
  {
    label: 'My Applications',
    href: '/applications',
    icon: BookOpen
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings
  }
];

export function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[#1A1A1A] border-r border-[#333333] flex flex-col">
      {/* Logo Section */}
      <div className="sidebar-logo h-16 border-b border-[#333333]">
        <img src="/logo.png" alt="AidMatch Logo" className="w-8 h-8 mr-2" />
        <span className="text-white text-lg font-semibold">AidMatch</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `sidebar-item flex items-center space-x-3 text-gray-400 hover:text-white ${
                isActive ? 'active text-white bg-white/10' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
