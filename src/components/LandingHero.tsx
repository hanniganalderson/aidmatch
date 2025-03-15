import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-20 pb-24 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-secondary-500/10 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-100/80 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
            <span className="flex items-center justify-center w-5 h-5 bg-primary-500 rounded-full">
              <Sparkles className="w-3 h-3 text-white" />
            </span>
            <span className="text-sm font-medium">AI-Powered Scholarship Matching</span>
          </div>
          
          {/* Heading with gradient text */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find Your Perfect
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
              Scholarship Match
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl">
            Your Financial Aid Pathway, Simplified
          </p>
          
          {/* Stats with subtle animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full">
            {/* Stats cards with improved styling */}
          </div>
          
          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="gradient"
              className="px-8 py-3 text-lg"
              onClick={() => navigate('/questionnaire')}
            >
              Start Matching
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-3 text-lg"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero; 