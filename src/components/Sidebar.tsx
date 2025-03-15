// src/components/Sidebar.tsx
import React from 'react';
import { FileText } from 'lucide-react';
import { PlusBadge } from './ui/PlusBadge';

// Fix the icon prop type to use React.ElementType instead of LucideIcon
interface SidebarItemProps {
  // Use React.ReactNode for the rendered icon component to fix type issue
  icon: React.ReactNode; 
  label: string;
  path: string;
  badge?: React.ReactNode;
  active?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  path, 
  badge,
  active = false 
}) => {
  return (
    <div className={`flex items-center gap-4 py-2 px-3 rounded-lg ${
      active ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
    }`}>
      <div className="w-6 h-6 text-gray-500 dark:text-gray-400">
        {icon} {/* Now it's used as a ReactNode, not as a component type */}
      </div>
      <span className={`text-gray-700 dark:text-gray-300 ${
        active ? 'font-medium' : ''
      }`}>{label}</span>
      {badge}
    </div>
  );
};

type SidebarProps = {
  // Any props you need
};

const Sidebar: React.FC<SidebarProps> = () => {
  const isSubscribed = true; // Replace with actual subscription logic

  return (
    <div className="space-y-6">
      {/* Pass <FileText /> as ReactNode instead of the FileText component type */}
      <SidebarItem 
        icon={<FileText className="w-full h-full" />}
        label="Essay Helper" 
        path="/essay-helper"
        badge={isSubscribed ? <PlusBadge size="sm" showText={false} /> : null}
        active={true}
      />
      {/* Add more items as needed */}
    </div>
  );
};

export default Sidebar;