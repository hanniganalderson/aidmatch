import { useState } from 'react';
import { FileText, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { PlusBadge } from './ui/PlusBadge';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useFeatureUsage } from '../hooks/useFeatureUsage';
import { FeatureName } from '../lib/feature-management';
import { ScoredScholarship } from '../types';
import { makeAIRequest, AIServiceType, getEssayAssistanceUserMessage } from '../lib/tiered-ai-service';

interface EssayAssistantProps {
  scholarship?: ScoredScholarship;
  className?: string;
}

// Simple markdown renderer component
const ReactMarkdown = ({ children }: { children: string }) => {
  // Convert markdown-like syntax to HTML (very basic implementation)
  const html = children
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    .replace(/#{3} (.*?)\n/g, '<h3>$1</h3>')
    .replace(/#{2} (.*?)\n/g, '<h2>$1</h2>')
    .replace(/#{1} (.*?)\n/g, '<h1>$1</h1>');

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export function EssayAssistant({ scholarship, className = '' }: EssayAssistantProps) {
  const { isSubscribed } = useSubscription();
  const [essayRequirements, setEssayRequirements] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    incrementUsage, 
    hasReachedLimit, 
    canUseFeature 
  } = useFeatureUsage(FeatureName.ESSAY_ASSISTANCE);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!essayRequirements || !userPrompt) {
      setError('Please fill in both fields');
      return;
    }
    
    // Check if user can use feature (if not subscribed)
    // Fixed: removed parentheses from canUseFeature
    if (!isSubscribed && !canUseFeature) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Track usage if not subscribed
      if (!isSubscribed) {
        await incrementUsage();
      }
      
      // Get user message for essay assistance
      const userMessage = getEssayAssistanceUserMessage(
        essayRequirements,
        userPrompt,
        scholarship,
        isSubscribed
      );
      
      // Make AI request
      const responseText = await makeAIRequest(
        AIServiceType.ESSAY_ASSISTANCE,
        isSubscribed,
        userMessage
      );
      
      setResponse(responseText);
    } catch (err) {
      console.error('Error getting essay assistance:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            AI Essay Assistant
            {isSubscribed && <PlusBadge size="sm" />}
          </h2>
        </div>
        
        {!response ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Essay Requirements
              </label>
              <Textarea
                placeholder="Paste the essay prompt or requirements here..."
                value={essayRequirements}
                onChange={(e) => setEssayRequirements(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                What do you need help with?
              </label>
              <Textarea
                placeholder="E.g., 'I need help brainstorming ideas for this essay' or 'How should I structure this essay?'"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              </div>
            )}
            
            {/* Fixed: removed parentheses from hasReachedLimit */}
            {!isSubscribed && !loading && hasReachedLimit && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                <h3 className="font-medium text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  Free Tier Limit Reached
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
                  You've reached your free tier limit for AI essay assistance.
                </p>
                <Button
                  onClick={() => window.location.href = '/plus'}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade to Plus
                </Button>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isSubscribed ? (
                  <span className="flex items-center gap-1">
                    <PlusBadge size="sm" />
                    Advanced essay assistance
                  </span>
                ) : (
                  <span>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      // Fixed: removed parentheses from hasReachedLimit
                      `${hasReachedLimit ? '0' : '1'} free uses remaining`
                    )}
                  </span>
                )}
              </div>
              
              <Button
                onClick={handleSubmit}
                // Fixed: removed parentheses from hasReachedLimit
                disabled={loading || (!isSubscribed && hasReachedLimit) || !essayRequirements || !userPrompt}
                className={`${isSubscribed ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" : ""}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Assistance
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="prose dark:prose-invert prose-sm max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setResponse('')}
              >
                Start Over
              </Button>
              
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(response);
                  // You could add a toast notification here
                }}
              >
                Copy to Clipboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}