import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, Variants } from 'framer-motion';
import { Brain, Shield, Target, Sparkles } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function LandingPage() {
  const navigate = useNavigate();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1c2e] to-[#1a1c2e] text-white overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute -top-[30rem] -left-[30rem] w-[60rem] h-[60rem] rounded-full bg-[#5865F2] opacity-20 blur-[128px]" />
        <div className="absolute -bottom-[30rem] -right-[30rem] w-[60rem] h-[60rem] rounded-full bg-[#43B581] opacity-20 blur-[128px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-xl font-semibold"
          >
            <Sparkles className="w-6 h-6 text-[#5865F2]" />
            AidMatch
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <button className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Sign In
            </button>
            <button 
              onClick={() => navigate('/questionnaire')}
              className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <div className="px-3 py-1 bg-[#5865F2]/10 text-[#5865F2] rounded-full text-sm font-medium flex items-center gap-1.5">
                <Brain className="w-4 h-4" />
                AI-Powered Matching
              </div>
              <div className="px-3 py-1 bg-[#4A90E2]/10 text-[#4A90E2] rounded-full text-sm font-medium flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Personalized Results
              </div>
              <div className="px-3 py-1 bg-[#43B581]/10 text-[#43B581] rounded-full text-sm font-medium flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Verified Scholarships
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight"
            >
              Find scholarships
              <br />
              <span className="bg-gradient-to-r from-[#5865F2] to-[#4A90E2] text-transparent bg-clip-text">
                tailored to you
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
              Our AI-powered platform matches you with scholarships you're most likely to win.
              Stop searching, start applying.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <button
                onClick={() => navigate('/questionnaire')}
                className="group relative w-full sm:w-auto px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                Get Started
                <motion.span
                  initial={{ x: 0 }}
                  animate={{ x: 3 }}
                  transition={{ 
                    duration: 0.6, 
                    repeat: Infinity, 
                    repeatType: 'reverse' 
                  }}
                >
                  →
                </motion.span>
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:bg-white/5 rounded-xl transition-all duration-200 font-medium text-gray-300 hover:text-white"
              >
                About Us
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.2
            }
          }
        }}
        className="container mx-auto px-6 py-20"
      >
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: <Brain className="w-8 h-8 text-[#5865F2]" />,
              title: "Smart Profile Analysis",
              description: "Our AI examines your academic profile and achievements to understand your unique qualifications."
            },
            {
              icon: <Target className="w-8 h-8 text-[#4A90E2]" />,
              title: "Precision Matching",
              description: "We identify scholarships where you have the highest probability of success."
            },
            {
              icon: <Sparkles className="w-8 h-8 text-[#43B581]" />,
              title: "Personalized Insights",
              description: "Get AI-powered advice on why each scholarship matches your profile."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="group bg-[#1A1A1A]/50 backdrop-blur-sm rounded-xl p-8 border-2 border-[#333333] hover:border-[#5865F2]/50 transition-all duration-200"
            >
              <div className="bg-[#222222] rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-[#5865F2]/10 transition-colors duration-200">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-[#5865F2] transition-colors duration-200">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial="hidden"
        animate={controls}
        variants={fadeInUp}
        className="bg-[#1A1A1A] py-20"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#5865F2] mb-2">GPT-4</div>
              <p className="text-[#888888]">Powered Matching</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#4A90E2] mb-2">24/7</div>
              <p className="text-[#888888]">Instant Access</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#43B581] mb-2">100%</div>
              <p className="text-[#888888]">Free to Use</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] border-t border-[#333333]">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-medium mb-4">About</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/about" className="text-[#888888] hover:text-white transition-colors">
                      Our Story
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="text-[#888888] hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/privacy" className="text-[#888888] hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-[#888888] hover:text-white transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-4">Support</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="mailto:support@scholarshipfinder.com" className="text-[#888888] hover:text-white transition-colors">
                      Email Us
                    </a>
                  </li>
                  <li>
                    <a href="/faq" className="text-[#888888] hover:text-white transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-4">Social</h3>
                <p className="text-[#888888]">Coming Soon</p>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-[#333333] text-center text-[#888888]">
              <p>© {new Date().getFullYear()} ScholarshipFinder. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}