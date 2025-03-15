import { useNavigate } from 'react-router-dom';
import { Target, Sparkles, ArrowRight, Check, DollarSign, BookOpen, Clock, Award, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ScholarshipCarousel } from './ScholarshipCarousel';
import { ReadyToMatch } from './ReadyToMatch'; // Import the ReadyToMatch component
import { Button } from './ui/button';
import { Card } from './ui/card';

export function LandingPage(): JSX.Element {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Use intersection observer for scroll animations
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [contributeRef, contributeInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Add these animation variants to the ScholarshipCarousel component
  const carouselItemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        ref={heroRef} 
        className="relative pt-20 pb-32 overflow-hidden"
      >
        <motion.div
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="container mx-auto px-6"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={itemVariants}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 px-4 py-2 rounded-full mb-6">
                <Award className="w-4 h-4" />
                <span className="font-medium">AI-Powered Scholarship Matching</span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
                Find Your Perfect
                <br />
                <span className="bg-gradient-green-blue bg-clip-text text-transparent">
                  Scholarship Match
                </span>
              </h1>
              <p className="text-xl font-medium text-primary-600 dark:text-primary-400 mb-6">
                Your Financial Aid Pathway, Simplified
              </p>

              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-8">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/90 dark:bg-surface-dark-100/70 backdrop-blur-sm border border-gray-100 dark:border-surface-dark-50/20 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-wider text-primary-600 dark:text-primary-400 font-medium">Unclaimed funds yearly</p>
                    <p className="font-bold text-xl text-gray-900 dark:text-white">$100,000,000+</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/90 dark:bg-surface-dark-100/70 backdrop-blur-sm border border-gray-100 dark:border-surface-dark-50/20 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-wider text-primary-600 dark:text-primary-400 font-medium">Average student loan debt</p>
                    <p className="font-bold text-xl text-gray-900 dark:text-white">$38,000</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/90 dark:bg-surface-dark-100/70 backdrop-blur-sm border border-gray-100 dark:border-surface-dark-50/20 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary-600 dark:text-primary-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-wider text-primary-600 dark:text-primary-400 font-medium">Time saved with AI matching</p>
                    <p className="font-bold text-xl text-gray-900 dark:text-white">10+ hours</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 mb-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => navigate('/questionnaire')}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Start Matching
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </Button>
              </div>
            </motion.div>

            {/* Scholarship Carousel */}
            <motion.div
              variants={itemVariants}
              className="relative mt-16 max-w-md mx-auto"
            >
              <ScholarshipCarousel />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        className="py-24 relative bg-gray-50/80 dark:bg-surface-dark-100/30"
      >
        <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.05)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(16,185,129,0.025)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-16">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 px-4 py-2 rounded-full mb-4"
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">How It Works</span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-gray-900 dark:text-white mb-6"
              >
                Your Path to Financial Aid Success
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
              >
                Our platform combines cutting-edge AI with a deep understanding of the scholarship landscape to deliver a superior experience.
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.2 }}
                className="group p-6 bg-white dark:bg-surface-dark-100/60 rounded-xl shadow-sm hover:shadow-premium border border-gray-100 dark:border-surface-dark-50/20 hover:border-primary-200 dark:hover:border-primary-800/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-6 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors duration-300">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  Tell Us About Yourself
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Share your academic background and goals so we can find scholarships that match your unique qualifications.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>Quick questionnaire about your education</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>Secure and private data handling</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.4 }}
                className="group p-6 bg-white dark:bg-surface-dark-100/60 rounded-xl shadow-sm hover:shadow-premium border border-gray-100 dark:border-surface-dark-50/20 hover:border-primary-200 dark:hover:border-primary-800/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-6 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors duration-300">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  Get Matched
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Our AI identifies scholarships where you have the highest probability of success based on your specific qualifications.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>Emphasis on local scholarships</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>Personalized match percentage</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.6 }}
                className="group p-6 bg-white dark:bg-surface-dark-100/60 rounded-xl shadow-sm hover:shadow-premium border border-gray-100 dark:border-surface-dark-50/20 hover:border-primary-200 dark:hover:border-primary-800/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-6 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors duration-300">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  Apply & Win
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Every scholarship in our database is thoroughly vetted and updated regularly to ensure legitimacy and accuracy.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>Direct application links</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>Application deadline reminders</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contribute Section */}
      <section 
        ref={contributeRef}
        className="py-24 relative bg-gray-50/80 dark:bg-surface-dark-100/30">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.05)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(16,185,129,0.025)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={contributeInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 px-4 py-2 rounded-full mb-4">
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">Contribute</span>
              </div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Help Grow Our Scholarship Database</h2>
              <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                Know of a scholarship that's not in our database? Share it with the community and help other students find opportunities they might have missed.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <Card className="p-6 hover:border-primary-200 dark:hover:border-primary-800/30 hover:shadow-premium transition-all duration-300">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Why Contribute?</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Help students discover more opportunities</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Increase visibility for lesser-known scholarships</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Build a stronger scholarship community</p>
                  </li>
                </ul>
              </Card>
              
              <div className="flex flex-col items-center text-center">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Adding a scholarship takes less than 5 minutes and helps students find funding for their education.
                </p>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => navigate('/contribute')}
                >
                  <Plus className="w-4 h-4" />
                  <span>Contribute Scholarship</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Replace the simple CTA Section with the ReadyToMatch component */}
      <ReadyToMatch />
    </div>
  );
}