import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Sparkles, GraduationCap, Award, Target } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext'; // Adjust path as needed

interface AnimateProps {
  y?: number[] | number;
  scale?: number;
  opacity?: number;
}

export function ReadyToMatch(): JSX.Element {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <motion.div 
          className={`max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-md border ${
            theme === 'dark' 
              ? 'border-indigo-900/30 bg-gray-900/80' 
              : 'border-indigo-200/50 bg-white/90'
          } backdrop-blur-sm transition-all duration-300`}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          {/* Decorative background patterns */}
          <div className="absolute inset-0">
            <div className={`absolute inset-0 ${
              theme === 'dark'
                ? 'bg-[radial-gradient(circle_at_30%_20%,rgba(121,74,255,0.05)_0%,rgba(0,0,0,0)_60%)]'
                : 'bg-[radial-gradient(circle_at_30%_20%,rgba(121,74,255,0.08)_0%,rgba(0,0,0,0)_60%)]'
            }`}></div>
            <div className={`absolute inset-0 ${
              theme === 'dark'
                ? 'bg-[radial-gradient(circle_at_70%_80%,rgba(121,74,255,0.05)_0%,rgba(0,0,0,0)_60%)]'
                : 'bg-[radial-gradient(circle_at_70%_80%,rgba(121,74,255,0.08)_0%,rgba(0,0,0,0)_60%)]'
            }`}></div>
          </div>
          
          <div className="relative z-10 p-10 md:p-16">
            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* Left content */}
              <div className="flex-1">
                <motion.div 
                  className={`inline-flex items-center px-4 py-2 rounded-full ${
                    theme === 'dark'
                      ? 'bg-indigo-900/30 text-indigo-300'
                      : 'bg-indigo-50 text-indigo-600'
                  } text-sm font-medium mb-4`}
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Personalized Matching
                </motion.div>
                
                <motion.h2 
                  className={`text-3xl md:text-4xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  } mb-6`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Ready to Find <span className={`${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-indigo-400 to-purple-400'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  } bg-clip-text text-transparent`}>Your Scholarships?</span>
                </motion.h2>
                
                <motion.p 
                  className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  } mb-8 text-lg`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  Complete our questionnaire and get matched with scholarships tailored to your unique academic profile and qualifications.
                </motion.p>
                
                <motion.div 
                  className="space-y-4 mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${
                      theme === 'dark'
                        ? 'bg-indigo-900/40'
                        : 'bg-indigo-100'
                    } flex items-center justify-center`}>
                      <CheckCircle className={`w-4 h-4 ${
                        theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'
                      }`} />
                    </div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Personalized recommendations
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${
                      theme === 'dark'
                        ? 'bg-indigo-900/40'
                        : 'bg-indigo-100'
                    } flex items-center justify-center`}>
                      <CheckCircle className={`w-4 h-4 ${
                        theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'
                      }`} />
                    </div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Opportunities matched to your strengths
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${
                      theme === 'dark'
                        ? 'bg-indigo-900/40'
                        : 'bg-indigo-100'
                    } flex items-center justify-center`}>
                      <CheckCircle className={`w-4 h-4 ${
                        theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'
                      }`} />
                    </div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Higher likelihood of success
                    </span>
                  </div>
                </motion.div>
                
                <motion.button
                  onClick={() => navigate('/questionnaire')}
                  className={`bg-gradient-to-r ${
                    theme === 'dark'
                      ? 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                      : 'from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                  } text-white px-8 py-4 rounded-xl font-medium text-lg shadow-lg flex items-center gap-2 transition-transform hover:scale-105`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <span>Start Matching Now</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
              
              {/* Right content - visual element */}
              <motion.div 
                className="flex-1 flex justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="relative w-72 h-72">
                  {/* Decorative circles */}
                  <div className={`absolute inset-0 rounded-full border-4 border-dashed ${
                    theme === 'dark' ? 'border-indigo-800/30' : 'border-indigo-200/50'
                  } animate-spin-slow`}></div>
                  <div className={`absolute inset-[15%] rounded-full border-4 border-dashed ${
                    theme === 'dark' ? 'border-purple-800/30' : 'border-purple-200/50'
                  } animate-spin-slow-reverse`}></div>
                  
                  {/* Center content */}
                  <div className={`absolute inset-[30%] rounded-full bg-gradient-to-br ${
                    theme === 'dark'
                      ? 'from-indigo-600/90 to-purple-600/90'
                      : 'from-indigo-500 to-purple-600'
                  } flex items-center justify-center shadow-lg`}>
                    <div className="text-center">
                      <GraduationCap className="w-10 h-10 text-white mx-auto mb-2" />
                      <span className="text-white font-bold">Find Your Match</span>
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <motion.div 
                    className={`absolute top-5 right-5 w-16 h-16 rounded-full bg-gradient-to-br ${
                      theme === 'dark'
                        ? 'from-indigo-500/80 to-indigo-700/80'
                        : 'from-indigo-400 to-indigo-600'
                    } flex items-center justify-center shadow-lg`}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <Award className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <motion.div 
                    className={`absolute bottom-10 left-0 w-14 h-14 rounded-full bg-gradient-to-br ${
                      theme === 'dark'
                        ? 'from-purple-500/80 to-purple-700/80'
                        : 'from-purple-400 to-purple-600'
                    } flex items-center justify-center shadow-lg`}
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <Sparkles className="w-7 h-7 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}