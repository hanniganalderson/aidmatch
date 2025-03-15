import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, ArrowRight, MapPin, GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProgressBar } from './ProgressBar';
import { USMap } from './USMap';
import { SchoolSearch } from './SchoolSearch';
import { supabase } from '../lib/supabase';
import { FIELDS_OF_STUDY } from '../constants/fields-of-study';
import type { UserAnswers, SchoolData } from '../types';
import { PageBackground } from './PageBackground';

interface QuestionnaireProps {
  onSubmit: (answers: UserAnswers) => void;
  initialValues?: Partial<UserAnswers>;
}

// Define the steps for our simplified questionnaire with icons
const STEPS = [
  {
    id: 'location',
    question: 'What state are you going to school in?',
    description: "We'll use this to find location-specific scholarships",
    icon: MapPin
  },
  {
    id: 'education',
    question: 'Tell us about your education',
    description: 'Your current academic status helps us match you with the right opportunities',
    icon: GraduationCap
  },
  {
    id: 'major_gpa',
    question: 'What are you studying?',
    description: 'Many scholarships are specific to certain fields of study',
    icon: BookOpen
  }
];

// Education level options
const EDUCATION_LEVELS = [
  'High School Freshman',
  'High School Sophomore',
  'High School Junior',
  'High School Senior',
  'College Freshman',
  'College Sophomore',
  'College Junior',
  'College Senior',
  'Graduate Student',
  'PhD Student'
];

export function Questionnaire({ onSubmit, initialValues = {} }: QuestionnaireProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [majorInput, setMajorInput] = useState(initialValues.major || '');
  const [filteredMajors, setFilteredMajors] = useState<string[]>(FIELDS_OF_STUDY.slice(0, 20));
  const [majorDropdownOpen, setMajorDropdownOpen] = useState(false);
  const [validFields, setValidFields] = useState<Record<string, boolean>>({});
  const [hasInteractedWithGpa, setHasInteractedWithGpa] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize answers with defaults
  const [answers, setAnswers] = useState<UserAnswers>({
    education_level: initialValues.education_level || '',
    school: initialValues.school || '',
    major: initialValues.major || '',
    gpa: initialValues.gpa || '3.0',
    location: initialValues.location || '',
    dashboard_preferences: initialValues.dashboard_preferences || [],
  });

  const majorInputRef = useRef<HTMLInputElement>(null);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  const progressPathVariants = {
    inactive: { 
      backgroundColor: "rgba(209, 213, 219, 0.5)",
      transition: { duration: 0.3 } 
    },
    active: { 
      backgroundColor: "rgba(16, 185, 129, 1)", 
      transition: { duration: 0.5 } 
    }
  };

  // Calculate completion percentage
  const calculateProgress = useCallback(() => {
    let completedSteps = 0;
    if (answers.location) completedSteps++;
    if (answers.education_level && answers.school) completedSteps++;
    if (answers.major && answers.gpa) completedSteps++;
    
    return Math.round((completedSteps / STEPS.length) * 100);
  }, [answers]);

  // Validate fields as they change
  useEffect(() => {
    const newValidFields = { ...validFields };
    
    if (answers.location) newValidFields.location = true;
    if (answers.education_level) newValidFields.education_level = true;
    if (answers.school) newValidFields.school = true;
    if (answers.major) newValidFields.major = true;
    if (answers.gpa) newValidFields.gpa = true;
    
    setValidFields(newValidFields);
  }, [answers]);

  // Add this function to save user answers to Supabase
  const saveUserAnswers = async (answers: UserAnswers): Promise<boolean> => {
    if (!user) {
      console.error('Cannot save answers: User not logged in');
      return false;
    }
    
    try {
      // First check if user already has a profile
      const { data: existingData, error: fetchError } = await supabase
        .from('user_questionnaire_data')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking for existing data:', fetchError);
        return false;
      }
      
      // Prepare data for upsert
      const questionnaireData = {
        user_id: user.id,
        education_level: answers.education_level || null,
        major: answers.major || null,
        gpa: answers.gpa || null,
        state: answers.state || null,
        school: answers.school || null,
        extracurricular_activities: answers.extracurricular_activities || [],
        interests: answers.interests || [],
        updated_at: new Date().toISOString()
      };
      
      // Also update the user_profiles table for backward compatibility
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          education_level: answers.education_level || null,
          major: answers.major || null,
          gpa: answers.gpa || null,
          state: answers.state || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
        
      if (profileError) {
        console.error('Error updating user profile:', profileError);
        // Continue anyway, as the main data will be in user_questionnaire_data
      }
      
      // Save to user_questionnaire_data
      const { error: saveError } = await supabase
        .from('user_questionnaire_data')
        .upsert(questionnaireData, {
          onConflict: 'user_id'
        });
        
      if (saveError) {
        console.error('Error saving questionnaire data:', saveError);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error saving user answers:', err);
      return false;
    }
  };

  // Update the handleSubmit function to save data before proceeding
  const handleSubmit = async () => {
    // Validate required fields
    if (!answers.education_level || !answers.major || !answers.gpa) {
      setError('Please complete all required fields before continuing.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save answers to Supabase
      const saved = await saveUserAnswers(answers);
      
      if (!saved) {
        setError('Failed to save your information. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      // Call the onSubmit prop to proceed
      onSubmit(answers);
    } catch (err) {
      console.error('Error in form submission:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setError(null);

    // Validate current step
    if (currentStep === 0 && !answers.location) {
      setError('Please select your state to continue.');
      return;
    }

    if (currentStep === 1 && !answers.education_level) {
      setError('Please select your education level.');
      return;
    }

    if (currentStep === 2 && (!answers.major || !answers.gpa)) {
      setError('Please select your major and GPA.');
      return;
    }

    // If we're on the last step, submit
    if (currentStep === STEPS.length - 1) {
      handleSubmit();
      return;
    }

    // Otherwise go to next step
    setCurrentStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate('/');
    } else {
      setCurrentStep(prevStep => prevStep - 1);
    }
    setError(null);
  };

  const handleMajorInput = (value: string) => {
    setError(null);
    setMajorInput(value);
    setAnswers(prev => ({ ...prev, major: value }));
    
    // Filter majors based on input
    if (value.trim()) {
      setFilteredMajors(
        FIELDS_OF_STUDY.filter(major => 
          major.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 50) // Limit to 50 matches for performance
      );
    } else {
      // Show a default set of common majors if no search term
      setFilteredMajors(FIELDS_OF_STUDY.slice(0, 20));
    }
    
    setMajorDropdownOpen(true);
  };

  const handleMajorSelect = (major: string) => {
    setMajorInput(major);
    setAnswers(prev => ({ ...prev, major }));
    setMajorDropdownOpen(false);
    setError(null);
  };

  const handleSchoolSelect = (school: SchoolData) => {
    setAnswers(prev => ({ ...prev, school: school.name }));
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers(prev => ({ ...prev, gpa: e.target.value }));
    setHasInteractedWithGpa(true);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (majorInputRef.current && !majorInputRef.current.contains(event.target as Node)) {
        setMajorDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Custom UI for each step's illustration
  const renderStepIcon = (step: number) => {
    const StepIcon = STEPS[step].icon;
    return (
      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/40 flex items-center justify-center mb-6">
        <StepIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
    );
  };

  // Render the progress path
  const renderProgressPath = () => {
    return (
      <div className="flex items-center justify-between mb-8 px-8 md:px-16">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <motion.div 
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index <= currentStep 
                  ? 'border-green-500 bg-green-50 text-green-600 dark:border-green-400 dark:bg-green-900/30 dark:text-green-300' 
                  : 'border-gray-300 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}
              initial={false}
              animate={index <= currentStep ? "active" : "inactive"}
            >
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </motion.div>
            
            {/* Connecting Line */}
            {index < STEPS.length - 1 && (
              <motion.div 
                className="w-16 md:w-32 h-1 mx-2"
                initial="inactive"
                animate={index < currentStep ? "active" : "inactive"}
                variants={progressPathVariants}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Small summary of what's completed so far for steps 2 and 3
  const renderCompletedSummary = () => {
    if (currentStep === 0) return null;
    
    return (
      <div className="mb-6 p-3 bg-gradient-to-r from-primary-50/80 to-primary-50/80 dark:from-primary-900/20 dark:to-primary-900/20 rounded-lg">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your information so far:</div>
        {answers.location && currentStep >= 1 && (
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <MapPin className="w-3.5 h-3.5 text-primary-500" />
            <span>{answers.location}</span>
          </div>
        )}
        {answers.education_level && currentStep >= 2 && (
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mt-1">
            <GraduationCap className="w-3.5 h-3.5 text-primary-500" />
            <span>{answers.education_level} at {answers.school}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <PageBackground variant="gradient">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium text-sm">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>
          
          <div className="relative">
            {/* Custom step indicator */}
            {renderProgressPath()}
            
            {/* Card with content */}
            <div 
              className="relative bg-white/95 dark:bg-gray-800/95 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-xl backdrop-blur-sm"
            >
              {/* Header and icon */}
              <div className="relative text-center mb-6">
                {renderStepIcon(currentStep)}
                
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {STEPS[currentStep].question}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  {STEPS[currentStep].description}
                </p>
              </div>
              
              {/* Previous steps summary */}
              {renderCompletedSummary()}

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  {/* Step Content */}
                  {currentStep === 0 && (
                    <div className="min-h-[300px]">
                      <USMap 
                        selectedState={answers.location}
                        onStateSelect={(state) => {
                          setAnswers({ ...answers, location: state });
                          setError(null);
                        }}
                        className="w-full hover:cursor-pointer" 
                      />
                      <p className="text-center mt-4 font-medium text-gray-700 dark:text-gray-200">
                        {answers.location 
                          ? `Selected: ${answers.location}` 
                          : "Click on a state to select it"}
                      </p>
                    </div>
                  )}

                  {/* Step 2: Education Level & School */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-gray-800 dark:text-gray-100 font-medium text-lg">
                            Education Level
                          </label>
                          {validFields.education_level && (
                            <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Completed
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {EDUCATION_LEVELS.map((level) => (
                            <motion.button
                              key={level}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setAnswers({ ...answers, education_level: level });
                                setError(null);
                              }}
                              className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                                answers.education_level === level
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-gray-800 dark:text-gray-100 shadow-md'
                                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:border-green-300 dark:hover:border-green-500 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {level}
                                </span>
                                {answers.education_level === level && (
                                  <Check className="h-5 w-5 text-green-500" />
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-gray-800 dark:text-gray-100 font-medium text-lg">
                            School
                          </label>
                          {validFields.school && (
                            <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Completed
                            </span>
                          )}
                        </div>
                        <SchoolSearch 
                          value={answers.school}
                          onSelect={handleSchoolSelect}
                          onChange={(value) => setAnswers(prev => ({ ...prev, school: value }))}
                          className="bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Major & GPA */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-4 relative" ref={majorInputRef}>
                        <div className="flex items-center justify-between">
                          <label className="block text-gray-800 dark:text-gray-100 font-medium text-lg">
                            Field of Study
                          </label>
                          {validFields.major && (
                            <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Completed
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input 
                            type="text"
                            value={majorInput}
                            onChange={(e) => handleMajorInput(e.target.value)}
                            onFocus={() => setMajorDropdownOpen(true)}
                            className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                            placeholder="Search for your field of study"
                          />
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        
                        {majorDropdownOpen && filteredMajors.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-auto rounded-md border border-gray-200 dark:border-gray-700"
                          >
                            {filteredMajors.map((major) => (
                              <button
                                key={major}
                                className={`block w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 ${
                                  majorInput === major 
                                    ? 'bg-green-50 dark:bg-green-900/30 text-gray-800 dark:text-gray-100' 
                                    : 'text-gray-800 dark:text-gray-100'
                                }`}
                                onClick={() => handleMajorSelect(major)}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{major}</span>
                                  {majorInput === major && (
                                    <Check className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                              </button>
                            ))}
                            
                            {filteredMajors.length >= 50 && majorInput.trim() !== '' && (
                              <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                                Showing top 50 matches. Continue typing to refine results.
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label htmlFor="gpa" className="block text-gray-800 dark:text-gray-100 font-medium text-lg">
                            What is your GPA?
                          </label>
                          {hasInteractedWithGpa && (
                            <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Completed
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">2.0</span>
                          <input
                            type="range"
                            id="gpa"
                            name="gpa"
                            min="0"
                            max="4.0"
                            step="0.1"
                            value={answers.gpa || 0}
                            onChange={(e) => {
                              handleChange(e);
                              setHasInteractedWithGpa(true);
                            }}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">4.0</span>
                        </div>
                        <div className="flex justify-center mt-2">
                          <span className="text-xl font-bold text-green-600 dark:text-green-400">
                            {answers.gpa}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 dark:text-red-400 mt-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-10">
                <motion.button 
                  whileHover={{ scale: 1.03, x: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium flex items-center gap-2 hover:shadow-sm"
                >
                  ← Back
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.03, x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  {currentStep < STEPS.length - 1 ? (
                    <>Continue <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>See Matches <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}