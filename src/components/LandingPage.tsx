import { useNavigate } from 'react-router-dom';
import { Brain, Shield, Target, GraduationCap } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-gray-100">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex flex-wrap justify-center gap-3">
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
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8">
              Find scholarships
              <br />
              <span className="bg-gradient-to-r from-[#5865F2] to-[#4A90E2] text-transparent bg-clip-text">
                tailored to you
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Our AI-powered platform matches you with scholarships you're most likely to win.
              Stop searching, start applying.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/questionnaire')}
                className="group relative w-full sm:w-auto px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                Get Started
                <span>→</span>
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:bg-white/5 rounded-xl transition-all duration-200 font-medium text-gray-300 hover:text-white"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-[#1A1A1A]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 bg-[#222222] rounded-xl">
              <Brain className="w-8 h-8 text-[#5865F2] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-400">Our AI analyzes your profile to find scholarships you're most qualified for.</p>
            </div>
            <div className="p-6 bg-[#222222] rounded-xl">
              <Target className="w-8 h-8 text-[#4A90E2] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Personalized Results</h3>
              <p className="text-gray-400">Get scholarship recommendations based on your unique qualifications and interests.</p>
            </div>
            <div className="p-6 bg-[#222222] rounded-xl">
              <GraduationCap className="w-8 h-8 text-[#43B581] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Success Rate</h3>
              <p className="text-gray-400">Higher chances of winning with scholarships matched to your profile.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] border-t border-[#333333]">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigate('/about')} className="text-[#888888] hover:text-white transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/pricing')} className="text-[#888888] hover:text-white transition-colors">
                    Pricing
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/blog')} className="text-[#888888] hover:text-white transition-colors">
                    Blog
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/faq')} className="text-[#888888] hover:text-white transition-colors">
                    FAQs
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Contact</h3>
              <ul className="space-y-2 text-[#888888]">
                <li>support@aidmatch.com</li>
                <li>1-800-AID-MATCH</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-[#888888] mt-8">
            © {new Date().getFullYear()} AidMatch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
