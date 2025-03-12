import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Sparkles, Send, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export function EssayAssistant() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setResult(
        "Here's a draft for your scholarship essay:\n\n" +
        "Throughout my academic journey, I've consistently demonstrated a commitment to excellence and a passion for learning. My experiences have shaped me into a resilient and determined individual who thrives in challenging environments.\n\n" +
        "One significant challenge I faced was [describe specific challenge]. This experience taught me valuable lessons about perseverance and adaptability. Rather than viewing obstacles as setbacks, I've learned to see them as opportunities for growth and development.\n\n" +
        "My academic achievements reflect my dedication to excellence. Maintaining a [GPA] while participating in [extracurricular activities] has required careful time management and prioritization. These skills will serve me well as I pursue higher education.\n\n" +
        "Looking ahead, I aim to [describe future goals]. This scholarship would provide crucial support in helping me achieve these aspirations by [explain how the scholarship would help].\n\n" +
        "I believe I am an ideal candidate for this scholarship because [unique qualities that align with the scholarship's values]. I am committed to making the most of this opportunity and contributing positively to my academic community."
      );
      setGenerating(false);
    }, 2000);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                <PenTool className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI Essay Assistant
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                Craft compelling scholarship essays with AI-powered assistance. Get suggestions, improve your writing, and stand out from other applicants.
              </p>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Generate Essay Draft
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Describe the scholarship and what you want to highlight about yourself
                    </label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Example: I'm applying for the Engineering Excellence Scholarship. I want to highlight my passion for robotics, my 3.8 GPA, and my community service at the local STEM center."
                      className="min-h-32"
                    />
                  </div>
                  
                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Essay Draft
                      </>
                    )}
                  </Button>
                </div>
                
                {result && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Generated Essay Draft
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 whitespace-pre-wrap">
                      {result}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" className="mr-2">
                        Regenerate
                      </Button>
                      <Button>
                        Edit & Refine
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 