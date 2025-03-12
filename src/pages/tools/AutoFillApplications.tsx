import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from "../../components/ui/label";
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

export function AutoFillApplications() {
  const { user, isSubscribed } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a file to process");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 3000);
    
    // In a real implementation, you would:
    // 1. Upload the file to your server
    // 2. Process it with your auto-fill logic
    // 3. Return the filled application
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };
  
  return (
    <ProtectedRoute requireQuestionnaire={false}>
      <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Auto-Fill Applications</h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Upload scholarship application forms and we'll automatically fill them with your profile information.
              </p>
            </motion.div>
            
            {!isSubscribed ? (
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center"
              >
                <div className="mb-6">
                  <FileText className="w-16 h-16 mx-auto text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Plus Feature</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Auto-Fill Applications is available exclusively to Plus members. Upgrade to access this time-saving feature.
                </p>
                <Button 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  onClick={() => window.location.href = '/plus'}
                >
                  Upgrade to Plus
                </Button>
              </motion.div>
            ) : (
              <motion.div variants={itemVariants}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                  <div className="p-8">
                    {!isComplete ? (
                      <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                          <Label htmlFor="application-file" className="block mb-2">
                            Upload Application Form (PDF)
                          </Label>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              Drag and drop your application form here, or click to browse
                            </p>
                            <Input
                              id="application-file"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('application-file')?.click()}
                            >
                              Select File
                            </Button>
                            {file && (
                              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                Selected: {file.name}
                              </div>
                            )}
                          </div>
                          {error && (
                            <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {error}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-center">
                          <Button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                            disabled={!file || isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Processing...
                              </>
                            ) : (
                              'Auto-Fill Application'
                            )}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-center">
                        <div className="mb-6 flex justify-center">
                          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Application Filled Successfully!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Your application has been auto-filled with your profile information.
                        </p>
                        <div className="flex justify-center gap-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setFile(null);
                              setIsComplete(false);
                            }}
                          >
                            Process Another
                          </Button>
                          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <Download className="w-4 h-4 mr-2" />
                            Download Filled Application
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            <motion.div variants={itemVariants} className="mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
                <h2 className="text-xl font-semibold mb-4">How It Works</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Upload Your Application</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload a scholarship application form in PDF, DOC, or DOCX format.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium">AI Processing</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Our AI analyzes the form and identifies fields that need to be filled.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Auto-Fill</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        The form is automatically filled with information from your profile.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">4</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Download & Submit</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Download the filled application and submit it to the scholarship provider.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 