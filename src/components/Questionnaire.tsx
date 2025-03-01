import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ProgressBar } from './ProgressBar';
import { SearchInput } from './SearchInput';
import { SchoolSearch } from './SchoolSearch';
import { EducationLevelCard } from './EducationLevelCard';
import { USMap } from './USMap';
import type { UserAnswers, SchoolData } from '../types';
import { questions, majors } from '../constants';

interface QuestionnaireProps {
  onSubmit: (answers: UserAnswers) => void;
  initialValues?: Partial<UserAnswers>;
}

export function Questionnaire({ onSubmit, initialValues = {} }: QuestionnaireProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Initialize with default values for all required fields
  const [answers, setAnswers] = useState<UserAnswers>({
    education_level: initialValues.education_level || '',
    school: initialValues.school || '',
    major: initialValues.major || '',
    gpa: initialValues.gpa || '',
    is_pell_eligible: initialValues.is_pell_eligible || '',
    location: initialValues.location || '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [majorInput, setMajorInput] = useState(initialValues.major || '');
  const [filteredMajors, setFilteredMajors] = useState<string[]>([...majors]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSchoolSelect = useCallback((school: SchoolData) => {
    setAnswers(prev => ({
      ...prev,
      school: school.name
    }));
    setError(null);
  }, []);

  const handleMajorInput = useCallback((value: string) => {
    setError(null);
    setMajorInput(value);
    setFilteredMajors(
      [...majors].filter(major => 
        major.toLowerCase().includes(value.toLowerCase())
      )
    );
    setDropdownOpen(true);
  }, []);

  const handleMajorSelect = useCallback((major: string) => {
    setMajorInput(major);
    setAnswers(prev => ({
      ...prev,
      major
    }));
    setDropdownOpen(false);
    setError(null);
  }, []);

  useEffect(() => {
    setIsComplete(
      questions.every(q => {
        const value = answers[q.id as keyof UserAnswers];
        return value !== undefined && value !== '';
      })
    );
  }, [answers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAnswer = useCallback((value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentStep].id]: value
    }));
    setError(null);
  }, [currentStep]);

  const handleNext = useCallback(async () => {
    setError(null);
    const questionId = questions[currentStep].id as keyof UserAnswers;
    const currentAnswer = answers[questionId];
    
    if (!currentAnswer || (typeof currentAnswer === 'string' && currentAnswer.trim() === '')) {
      setError('Please provide an answer to continue');
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      try {
        if (user) {
          const { error: upsertError } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: user.id,
              ...answers,
              gpa: typeof answers.gpa === 'string' ? parseFloat(answers.gpa) : answers.gpa,
              is_pell_eligible: answers.is_pell_eligible === 'Yes'
            });

          if (upsertError) throw upsertError;
        }
        
        // Call the onSubmit prop with the current answers
        onSubmit(answers);
        
        navigate('/results');
      } catch (error) {
        console.error('Error saving profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to save profile');
      }
    }
  }, [currentStep, answers, user, navigate, onSubmit]);

  const handleBack = useCallback(() => {
    setError(null);
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/');
    }
  }, [currentStep, navigate]);

  const currentQuestion = questions[currentStep];

  // Animation variants
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

  const renderQuestionContent = () => {
    const questionId = currentQuestion.id as keyof UserAnswers;
    const currentAnswer = answers[questionId];

    switch (currentQuestion.type) {
      case 'button':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options?.map((option) => (
              <motion.button
                key={option}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(option)}
                className={`px-6 py-4 rounded-lg border ${
                  currentAnswer === option
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-200 dark:border-[#2A2D3A] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1E2A] hover:border-gray-300 dark:hover:border-[#3A3F55]'
                } transition-colors flex items-center justify-center gap-2`}
              >
                {option === 'Yes' && <CheckCircle className="w-5 h-5" />}
                {option === 'No' && <XCircle className="w-5 h-5" />}
                {option}
              </motion.button>
            ))}
          </div>
        );

      case 'combobox':
        return (
          <motion.div 
            variants={itemVariants}
            className="relative" 
            ref={dropdownRef}
          >
            {currentQuestion.id === 'school' ? (
              <SchoolSearch
                value={answers.school}
                onSelect={handleSchoolSelect}
                onChange={(value) => setAnswers(prev => ({ ...prev, school: value }))}
                error={error || undefined}
              />
            ) : (
              <div>
                <SearchInput
                  icon={Search}
                  type="text"
                  value={majorInput}
                  onChange={(e) => handleMajorInput(e.target.value)}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Search or enter your major"
                  className="w-full"
                />
                <AnimatePresence>
                  {dropdownOpen && filteredMajors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-20 w-full mt-2 py-1 bg-white dark:bg-[#1A1E2A] rounded-lg border border-gray-200 dark:border-[#2A2D3A] max-h-60 overflow-y-auto shadow-lg"
                    >
                      {filteredMajors.map((major) => (
                        <motion.button
                          key={major}
                          whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                          onClick={() => handleMajorSelect(major)}
                          className="w-full flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-white hover:bg-blue-500/10 transition-all duration-200"
                        >
                          <span>{major}</span>
                          {major === currentAnswer && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        );

      case 'slider':
        const min = currentQuestion.min ?? 2.0;
        const max = currentQuestion.max ?? 4.0;
        const step = currentQuestion.step ?? 0.1;
        const defaultValue = (min + max) / 2;
        const displayValue = currentAnswer !== undefined && currentAnswer !== '' 
          ? currentAnswer 
          : defaultValue;
        
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-[#888888]">{min}</span>
              <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                {displayValue}
              </span>
              <span className="text-sm text-gray-500 dark:text-[#888888]">{max}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={String(displayValue)}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-gray-300 dark:hover:bg-white/20 transition-all duration-200"
            />
          </div>
        );

      case 'select':
        return currentQuestion.id === 'education_level' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options?.map((level) => (
              <EducationLevelCard
                key={level}
                level={level}
                selected={currentAnswer === level}
                onClick={() => handleAnswer(level)}
              />
            ))}
          </div>
        ) : currentQuestion.id === 'location' ? (
          <USMap
            selectedState={typeof currentAnswer === 'string' ? currentAnswer : ''}
            onStateSelect={(state) => handleAnswer(state)}
          />
        ) : (
          <div className="relative">
           <select
            value={typeof currentAnswer === 'string' ? currentAnswer : typeof currentAnswer === 'number' ? currentAnswer.toString() : ''}
            onChange={(e) => handleAnswer(String(e.target.value))}
            className="w-full p-3 rounded-lg bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white appearance-none hover:border-gray-300 dark:hover:border-white/20 focus:border-blue-500 dark:focus:border-[#5865F2] transition-all duration-200"
          >
            <option value="">Select an option...</option>
            {currentQuestion.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-24 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <ProgressBar
          currentStep={currentStep + 1}
          totalSteps={questions.length}
          stepTitle={currentQuestion.question}
          isComplete={isComplete}
        />

        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-gray-300 dark:border-gray-700 p-8 shadow-xl backdrop-blur-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500 pl-4">
                  {currentQuestion.question}
                </h2>

                {renderQuestionContent()}

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack} 
                className="px-6 py-3 rounded-lg border border-gray-200 dark:border-[#333333] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222222] transition-colors"
              >
                ← Back
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext} 
                disabled={!answers[currentQuestion.id as keyof UserAnswers]}
                className="px-6 py-3 rounded-lg bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep < questions.length - 1 ? 'Continue →' : 'See Matches →'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}