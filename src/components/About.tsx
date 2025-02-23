import { motion } from 'framer-motion';
import { Mail, Send, Users, Award, BookOpen, Brain, Shield, Target, Sparkles, Heart, Compass, CheckCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function About() {
  const [formType, setFormType] = useState<'contact' | 'partnership'>('contact');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [organization, setOrganization] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <div className="relative py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-800 backdrop-blur-sm" />
          <div className="container relative mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <span className="inline-flex items-center space-x-2 bg-[#5865F2]/10 text-[#5865F2] px-4 py-2 rounded-full mb-8">
                <Heart className="w-4 h-4" />
                <span>Our Mission</span>
              </span>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Empowering Students Through
                <span className="block bg-gradient-to-r from-[#5865F2] to-[#4A90E2] bg-clip-text text-transparent">
                  AI-Driven Opportunities
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto">
                We're building the future of scholarship discovery, where artificial intelligence meets educational opportunity.
                Our platform is designed to make finding and applying for scholarships more efficient and personalized than ever before.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-[#1A1A1A]/50 backdrop-blur-sm rounded-2xl p-8 border border-[#333333]">
                  <div className="bg-[#5865F2]/10 rounded-lg p-3 inline-block mb-4">
                    <Brain className="w-6 h-6 text-[#5865F2]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Smart Matching</h3>
                  <p className="text-gray-400">
                    Our AI understands your unique story and matches you with opportunities that align with your journey.
                  </p>
                </div>

                <div className="bg-[#1A1A1A]/50 backdrop-blur-sm rounded-2xl p-8 border border-[#333333]">
                  <div className="bg-[#4A90E2]/10 rounded-lg p-3 inline-block mb-4">
                    <Shield className="w-6 h-6 text-[#4A90E2]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Verified Awards</h3>
                  <p className="text-gray-400">
                    Every scholarship in our database is thoroughly vetted and updated daily.
                  </p>
                </div>

                <div className="bg-[#1A1A1A]/50 backdrop-blur-sm rounded-2xl p-8 border border-[#333333]">
                  <div className="bg-[#43B581]/10 rounded-lg p-3 inline-block mb-4">
                    <Compass className="w-6 h-6 text-[#43B581]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Guided Journey</h3>
                  <p className="text-gray-400">
                    Step-by-step assistance to help you submit strong applications and track progress.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="relative py-24 bg-[#1A1A1A]">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="container relative mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-[#1A1A1A]/60 backdrop-blur-lg rounded-2xl border border-[#333333] overflow-hidden">
                <div className="flex border-b border-[#333333]">
                  <button
                    onClick={() => setFormType('contact')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${formType === 'contact' ? 'bg-[#222222] text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    Contact Us
                  </button>
                  <button
                    onClick={() => setFormType('partnership')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${formType === 'partnership' ? 'bg-[#222222] text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    Partnership Inquiry
                  </button>
                </div>

                <div className="p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {formType === 'contact' ? 'Get in Touch' : 'Partner With Us'}
                  </h2>

                  {submitted ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-[#43B581]/20 rounded-full mb-4">
                        <Send className="w-8 h-8 text-[#43B581]" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                      <p className="text-gray-400">
                        Thank you for reaching out. We'll get back to you soon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                          {formType === 'partnership' ? 'Contact Name' : 'Name'}
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#222222] border border-[#333333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5865F2] transition-colors"
                          required
                        />
                      </div>

                      {formType === 'partnership' && (
                        <div>
                          <label htmlFor="organization" className="block text-sm font-medium text-gray-300 mb-2">
                            Organization
                          </label>
                          <input
                            type="text"
                            id="organization"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            className="w-full bg-[#222222] border border-[#333333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5865F2] transition-colors"
                            required
                          />
                        </div>
                      )}

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#222222] border border-[#333333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5865F2] transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                          Message
                        </label>
                        <textarea
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                          className="w-full bg-[#222222] border border-[#333333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5865F2] transition-colors resize-none"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl py-3 px-4 font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>Send Message</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
