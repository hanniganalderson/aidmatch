import { useNavigate } from 'react-router-dom';
import { GraduationCap, Brain, Shield, Target, Sparkles, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export function LandingPage() {
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
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div
              variants={itemVariants}
              className="text-center"
            >
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-8 text-gray-900 dark:text-white">
                Financial Aid
                <br />
                <span className="blue-text">
                  Simplified
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                Our platform matches you with scholarships you're most likely to win.
                Stop searching, start applying.
              </p>

              <div className="mt-8 mb-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/questionnaire')}
                  className="w-full sm:w-auto px-6 py-3 bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg text-white"
                >
                  Start Matching
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/about')}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-200 dark:border-[#2A2D3A] hover:border-gray-300 dark:hover:border-[#3A3F55] rounded-lg transition-all duration-200 font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  About AidMatch
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Floating scholarship cards */}
        <div className="absolute top-1/2 -right-20 transform -translate-y-1/2 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-64 p-4 bg-white/80 dark:bg-[#171923]/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-[#2A2D3A] shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-blue-500 font-semibold">$25,000</div>
                <div className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs">95% Match</div>
              </div>
              <h3 className="text-gray-900 dark:text-white font-medium mb-2">Future Tech Leaders Scholarship</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">For Computer Science majors with 3.5+ GPA</p>
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="w-64 p-4 bg-white/80 dark:bg-[#171923]/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-[#2A2D3A] shadow-xl absolute -bottom-24 -left-20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-blue-500 font-semibold">$10,000</div>
                <div className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs">87% Match</div>
              </div>
              <h3 className="text-gray-900 dark:text-white font-medium mb-2">STEM Diversity Grant</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Supporting underrepresented students in STEM</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with How It Works */}
      <section 
        ref={featuresRef}
        className="py-24 relative bg-gray-50 dark:bg-[#13151E]/50"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="feature-card group">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors duration-300">
                  <span className="text-blue-500 font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors duration-300">Tell Us About Yourself</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">Share your academic background and goals so we can find scholarships that match your unique qualifications.</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Quick questionnaire about your education</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Secure and private data handling</span>
                  </li>
                </ul>
              </div>
              
              <div className="feature-card group">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors duration-300">
                  <span className="text-blue-500 font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors duration-300">Get Matched</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">We identify scholarships where you have the highest probability of success based on your specific qualifications.</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Emphasis on local scholarships</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Personalized match percentage</span>
                  </li>
                </ul>
              </div>
              
              <div className="feature-card group">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors duration-300">
                  <span className="text-blue-500 font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors duration-300">Apply & Win</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">Every scholarship in our database is thoroughly vetted and updated regularly to ensure legitimacy and accuracy.</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Direct application links</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Application deadline reminders</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/questionnaire')}
                className="px-6 py-3 bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 rounded-lg transition-all duration-200 font-medium inline-flex items-center justify-center gap-2 shadow-lg text-white"
              >
                Start Matching
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={statsRef}
        className="py-24 relative"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full mb-4">
                <Target className="w-4 h-4" />
                <span>Why AidMatch</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Unlock Your Educational Potential</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Our platform is designed to save you time and increase your chances of winning scholarships.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="gradient-border">
                <div className="gradient-border-content text-center">
                  <div className="flex items-center justify-center mb-4">
                    <GraduationCap className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-4xl font-bold blue-text mb-2">10,000+</div>
                  <p className="text-gray-600 dark:text-gray-400">Scholarships Available</p>
                </div>
              </div>
              
              <div className="gradient-border">
                <div className="gradient-border-content text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-4xl font-bold blue-text mb-2">85%</div>
                  <p className="text-gray-600 dark:text-gray-400">Time Saved Searching</p>
                </div>
              </div>
              
              <div className="gradient-border">
                <div className="gradient-border-content text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-4xl font-bold blue-text mb-2">3x</div>
                  <p className="text-gray-600 dark:text-gray-400">Higher Success Rate</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative bg-gray-50 dark:bg-[#13151E]/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="gradient-border">
              <div className="gradient-border-content text-center py-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Ready to Find Your Perfect Scholarships?</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                  Complete our quick questionnaire and get matched with scholarships tailored to your profile.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/questionnaire')}
                  className="px-8 py-4 bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 rounded-lg transition-all duration-200 font-medium inline-flex items-center justify-center gap-2 shadow-lg text-white"
                >
                  Start Matching Now
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}