import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { ArrowRight, Brain, Shield, Target, Sparkles } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

export function LandingPage() {
  const navigate = useNavigate();
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#121212]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-800 backdrop-blur-sm" />
        </div>
        
        <div className="container relative mx-auto px-4 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8"
            >
              <div className="inline-flex items-center space-x-2 bg-[#5865F2]/10 text-[#5865F2] px-4 py-2 rounded-full">
                <Brain className="w-4 h-4" />
                <span>GPT-4 Powered</span>
              </div>
              <div className="inline-flex items-center space-x-2 bg-[#4A90E2]/10 text-[#4A90E2] px-4 py-2 rounded-full">
                <Target className="w-4 h-4" />
                <span>Smart Matching</span>
              </div>
              <div className="inline-flex items-center space-x-2 bg-[#43B581]/10 text-[#43B581] px-4 py-2 rounded-full">
                <Shield className="w-4 h-4" />
                <span>Verified Awards</span>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#5865F2] to-[#4A90E2] animate-gradient bg-300% animate-gradient">
                Discover Your
                <br />
                Perfect Scholarship
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-[#888888] max-w-2xl mx-auto mb-8"
            >
              Stop wasting time on low-ROI applications. Our AI matches you with scholarships where you have the highest chance of winning.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => navigate('/questionnaire')}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-[#5865F2] rounded-lg overflow-hidden transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#5865F2] via-[#4A90E2] to-[#5865F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center">
                Find My Matches
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* How It Works Section - Moved up */}
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
        className="container mx-auto px-4 py-20"
      >
        <motion.div
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-[#888888] text-lg">Three simple steps to your perfect scholarship match</p>
        </motion.div>

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
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="bg-[#1A1A1A] rounded-xl p-8 border border-[#333333] transform transition-all duration-300"
            >
              <div className="bg-[#222222] rounded-lg w-16 h-16 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-[#888888]">{feature.description}</p>
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

      {/* Mission Section */}
      <motion.div
        initial="hidden"
        animate={controls}
        variants={fadeInUp}
        className="container mx-auto px-4 py-20 bg-[#1A1A1A]"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-[#888888]">
              We believe every student deserves access to education funding opportunities. Our platform uses AI to democratize the scholarship search process—no fluff, no ads, just results.
            </p>
          </div>

          <div className="flex justify-center">
            <motion.button
              onClick={() => navigate('/about')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group inline-flex items-center text-[#5865F2] hover:text-[#4752C4] transition-colors"
            >
              Learn more about us
              <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>
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
                      Our Mission
                    </a>
                  </li>
                  <li>
                    <a href="/about#contact" className="text-[#888888] hover:text-white transition-colors">
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
                    <a href="mailto:support@aidmatch.com" className="text-[#888888] hover:text-white transition-colors">
                      support@aidmatch.com
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-4">Follow Us</h3>
                <p className="text-[#888888]">
                  Coming soon
                </p>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-[#333333] text-center text-[#888888]">
              <p>© {new Date().getFullYear()} AidMatch. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}