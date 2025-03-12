import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Sparkles, RefreshCw, ChevronDown, ChevronUp, FileText, Award } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export function FinancialOptimizer() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      setShowResults(true);
    }, 2500);
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
                <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Financial Aid Optimizer
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                Maximize your financial aid with AI-powered recommendations for FAFSA, grants, tax benefits, and more.
              </p>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Financial Aid Analysis
                </h2>
                
                {!showResults ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">
                        Our AI will analyze your profile and provide personalized recommendations to maximize your financial aid opportunities, including:
                      </p>
                      <ul className="mt-3 space-y-2">
                        <li className="flex items-start">
                          <span className="text-indigo-500 mr-2">•</span>
                          <span>FAFSA optimization strategies</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-indigo-500 mr-2">•</span>
                          <span>Grant and scholarship opportunities</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-indigo-500 mr-2">•</span>
                          <span>Tax benefits and credits</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-indigo-500 mr-2">•</span>
                          <span>Work-study and loan recommendations</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing Your Profile...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Financial Aid Recommendations
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                        <Sparkles className="w-5 h-5" />
                        <span>Analysis Complete</span>
                      </div>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        Based on your profile, we've identified several opportunities to maximize your financial aid.
                      </p>
                    </div>
                    
                    {/* FAFSA Optimization */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection('fafsa')}
                        className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 text-left"
                      >
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-indigo-500 mr-2" />
                          <span className="font-medium text-gray-900 dark:text-white">FAFSA Optimization</span>
                        </div>
                        {expandedSection === 'fafsa' ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      
                      {expandedSection === 'fafsa' && (
                        <div className="p-4 bg-white dark:bg-gray-800">
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2 font-bold">✓</span>
                              <div>
                                <p className="font-medium">Submit FAFSA Early</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Submit your FAFSA as soon as possible after October 1st to maximize your aid eligibility.
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2 font-bold">✓</span>
                              <div>
                                <p className="font-medium">Report Assets Strategically</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Consider timing of major purchases and investments to optimize your Expected Family Contribution (EFC).
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2 font-bold">✓</span>
                              <div>
                                <p className="font-medium">Appeal Financial Aid Offers</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  If your financial situation has changed, contact the financial aid office to request a professional judgment review.
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Grants & Scholarships */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection('grants')}
                        className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 text-left"
                      >
                        <div className="flex items-center">
                          <Award className="w-5 h-5 text-indigo-500 mr-2" />
                          <span className="font-medium text-gray-900 dark:text-white">Grants & Scholarships</span>
                        </div>
                        {expandedSection === 'grants' ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      
                      {expandedSection === 'grants' && (
                        <div className="p-4 bg-white dark:bg-gray-800">
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2 font-bold">✓</span>
                              <div>
                                <p className="font-medium">Pell Grant Eligibility</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Based on your profile, you may be eligible for up to $6,895 in Pell Grant funding.
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2 font-bold">✓</span>
                              <div>
                                <p className="font-medium">State-Specific Grants</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Your state offers additional grant programs for residents. Apply through your state's higher education agency.
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2 font-bold">✓</span>
                              <div>
                                <p className="font-medium">Institutional Scholarships</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Contact your school's financial aid office about merit-based and need-based institutional scholarships.
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Tax Benefits */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection('tax')}
                        className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 text-left"
                      >
                        <div className="flex items-center">
                          <DollarSign className="w-5 h-5 text-indigo-500 mr-2" />
                          <span className="font-medium text-gray-900 dark:text-white">Tax Benefits</span>
                        </div>
                        {expandedSection === 'tax' ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      
                      {expandedSection === 'tax' && (
                        <div className="p-4 bg-white dark:bg-gray-800">
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2 font-bold">✓</span>
                              <div>
                                <p className="font-medium">American Opportunity Tax Credit</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Claim up to $2,500 per eligible student for qualified education expenses.
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2 font-bold">✓</span>
                              <div>
                                <p className="font-medium">Lifetime Learning Credit</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Claim up to $2,000 per tax return for qualified education expenses.
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2 font-bold">✓</span>
                              <div>
                                <p className="font-medium">Student Loan Interest Deduction</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Deduct up to $2,500 of student loan interest paid during the tax year.
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          setShowResults(false);
                          setExpandedSection(null);
                        }}
                        variant="outline"
                        className="mr-2"
                      >
                        Start Over
                      </Button>
                      <Button>
                        Download Full Report
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