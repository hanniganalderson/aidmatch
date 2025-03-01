import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Award, BookOpen, Brain, Shield, Target, Sparkles, Heart, Compass } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

export function About() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [organization, setOrganization] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
  const [missionRef, missionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [contactRef, contactInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div className="min-h-screen">
      {/* Mission Section */}
      <section 
        ref={missionRef}
        className="py-24"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={missionInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.span 
              variants={itemVariants}
              className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full mb-8"
            >
              <Heart className="w-4 h-4" />
              <span>Our Mission</span>
            </motion.span>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Empowering Students Through
              <span className="block blue-text">
                AI-Driven Opportunities
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto"
            >
              We're building the future of scholarship discovery, where artificial intelligence meets educational opportunity.
              Our platform is designed to make finding and applying for scholarships more efficient and personalized than ever before.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <motion.div 
                variants={itemVariants}
                className="feature-card"
              >
                <div className="bg-blue-500/10 rounded-lg p-3 inline-block mb-4">
                  <Brain className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Smart Matching</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our platform analyzes your academic profile and matches you with opportunities that align with your qualifications.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="feature-card"
              >
                <div className="bg-blue-500/10 rounded-lg p-3 inline-block mb-4">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Verified Awards</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Every scholarship in our database is thoroughly vetted and updated daily.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="feature-card"
              >
                <div className="bg-blue-500/10 rounded-lg p-3 inline-block mb-4">
                  <Compass className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Guided Journey</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Step-by-step assistance to help you submit strong applications and track progress.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        className="py-24 bg-gray-50 dark:bg-[#13151E]/50"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-16">
              <motion.span 
                variants={itemVariants}
                className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full mb-4"
              >
                <Sparkles className="w-4 h-4" />
                <span>Key Features</span>
              </motion.span>
              
              <motion.h2 
                variants={itemVariants}
                className="text-3xl font-bold text-gray-900 dark:text-white mb-6"
              >
                How AidMatch Transforms Scholarship Discovery
              </motion.h2>
              
              <motion.p 
                variants={itemVariants}
                className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
              >
                Our platform combines cutting-edge technology with a deep understanding of the scholarship landscape to deliver a superior experience.
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                variants={itemVariants}
                className="feature-card"
              >
                <div className="bg-blue-500/10 rounded-lg p-3 inline-block mb-4">
                  <Target className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Personalized Matching</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our algorithm considers your GPA, major, location, and more to find scholarships where you have the highest chance of success.
                </p>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="feature-card"
              >
                <div className="bg-blue-500/10 rounded-lg p-3 inline-block mb-4">
                  <Award className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">High-ROI Focus</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We prioritize scholarships with the best return on investment, considering award amount, competition level, and application complexity.
                </p>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="feature-card"
              >
                <div className="bg-blue-500/10 rounded-lg p-3 inline-block mb-4">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Comprehensive Database</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Access thousands of scholarships from national organizations, local communities, and specialized programs.
                </p>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="feature-card"
              >
                <div className="bg-blue-500/10 rounded-lg p-3 inline-block mb-4">
                  <Brain className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">AI-Powered Insights</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get personalized explanations for why each scholarship matches your profile and tips to strengthen your application.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        ref={contactRef}
        className="py-24"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={contactInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="max-w-3xl mx-auto"
          >
            <div className="gradient-border">
              <div className="gradient-border-content">
                <div className="text-center mb-8">
                  <motion.span 
                    variants={itemVariants}
                    className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full mb-4"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Get in Touch</span>
                  </motion.span>
                  
                  <motion.h2 
                    variants={itemVariants}
                    className="text-3xl font-bold text-gray-900 dark:text-white mb-6"
                  >
                    Contact Us
                  </motion.h2>
                  
                  <motion.p 
                    variants={itemVariants}
                    className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8"
                  >
                    Have questions or feedback? We'd love to hear from you.
                  </motion.p>
                </div>

                {submitted ? (
                  <motion.div 
                    variants={itemVariants}
                    className="text-center py-8"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                      <Send className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form 
                    variants={itemVariants}
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                  >
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="input-field resize-none"
                        required
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white rounded-lg py-3 px-4 font-medium transition-colors flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <span>Send Message</span>
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </motion.form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}