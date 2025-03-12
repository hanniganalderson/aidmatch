import { Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SubscriptionBadgeProps {
  showFree?: boolean;
  className?: string;
}

export function SubscriptionBadge({ 
  showFree = false,
  className = '' 
}: SubscriptionBadgeProps) {
  const { isSubscribed } = useAuth();
  
  if (!isSubscribed && !showFree) {
    return null;
  }
  
  return (
    <div className={`inline-flex items-center ${className}`}>
      {isSubscribed ? (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Plus
        </div>
      ) : showFree ? (
        <div className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">
          Free
        </div>
      ) : null}
    </div>
  );
} 