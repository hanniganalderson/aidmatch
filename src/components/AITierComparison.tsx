import { CheckCircle, XCircle } from 'lucide-react';
import { PlusBadge } from './ui/PlusBadge';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';

interface FeatureComparisonProps {
  feature: string;
  free: boolean | string;
  plus: boolean | string;
}

function FeatureComparison({ feature, free, plus }: FeatureComparisonProps) {
  return (
    <div className="grid grid-cols-3 py-3 border-b border-gray-200 dark:border-gray-700 text-sm">
      <div className="text-gray-700 dark:text-gray-300">{feature}</div>
      <div className="text-center">
        {typeof free === 'boolean' ? (
          free ? (
            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400 mx-auto" />
          )
        ) : (
          <span className="text-gray-700 dark:text-gray-300">{free}</span>
        )}
      </div>
      <div className="text-center">
        {typeof plus === 'boolean' ? (
          plus ? (
            <CheckCircle className="h-5 w-5 text-indigo-500 mx-auto" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400 mx-auto" />
          )
        ) : (
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">{plus}</span>
        )}
      </div>
    </div>
  );
}

export function AITierComparison() {
  const navigate = useNavigate();
  const { isSubscribed } = useSubscription();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          AI Features Comparison
        </h2>
        
        <div className="grid grid-cols-3 pb-2 mb-2 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="text-gray-500 dark:text-gray-400 font-medium">Feature</div>
          <div className="text-center text-gray-500 dark:text-gray-400 font-medium">Free</div>
          <div className="text-center text-indigo-600 dark:text-indigo-400 font-medium flex justify-center items-center gap-1">
            <PlusBadge size="sm" />
            <span>Plus</span>
          </div>
        </div>
        
        <FeatureComparison 
          feature="AI Scholarship Recommendations" 
          free="5 per month" 
          plus="Unlimited" 
        />
        
        <FeatureComparison 
          feature="Scholarship Match Quality" 
          free="Basic" 
          plus="Advanced" 
        />
        
        <FeatureComparison 
          feature="Essay Assistance" 
          free="1 per month" 
          plus="Unlimited" 
        />
        
        <FeatureComparison 
          feature="Example Essay Paragraphs" 
          free={false} 
          plus={true} 
        />
        
        <FeatureComparison 
          feature="Detailed Application Strategy" 
          free={false} 
          plus={true} 
        />
        
        <FeatureComparison 
          feature="AI Model" 
          free="GPT-4o Mini" 
          plus="GPT-4o" 
        />
        
        {!isSubscribed && (
          <div className="mt-6">
            <Button
              onClick={() => navigate('/plus')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            >
              Upgrade to Plus
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 