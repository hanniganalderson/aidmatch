import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export function SubscriptionCancel() {
  const navigate = useNavigate();
  
  // Track page view for analytics
  useEffect(() => {
    // You could add analytics tracking here
    console.log('Subscription cancel page viewed');
  }, []);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-8 border border-gray-200"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="bg-amber-100 p-3 rounded-full">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-4">
          Subscription Process Canceled
        </h1>
        
        <p className="text-gray-600 text-center mb-8">
          You've canceled the subscription process. No worries! You can still use AidMatch with our free features.
          If you change your mind, you can upgrade to Plus anytime.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline"
            onClick={() => navigate('/plus')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Plus Info
          </Button>
          
          <Button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-primary"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default SubscriptionCancel;