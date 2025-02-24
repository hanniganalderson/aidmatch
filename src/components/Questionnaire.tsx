// src/components/Questionnaire.tsx
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(option)}
                className={`px-6 py-4 rounded-lg border ${
                  currentAnswer === option
                    ? 'bg-[#5865F2] border-[#5865F2] text-white'
                    : 'border-[#333333] text-gray-300 hover:bg-[#222222]'
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
          <div className="relative" ref={dropdownRef}>
            {currentQuestion.id === 'school' ? (
              <SchoolSearch
                onSelect={handleSchoolSelect}
                onChange={(value) => setAnswers(prev => ({ ...prev, school: value }))}
                value={answers.school}
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
                      className="absolute z-20 w-full mt-2 py-1 bg-[#222222] rounded-lg border border-[#333333] max-h-60 overflow-y-auto shadow-lg"
                    >
                      {filteredMajors.map((major) => (
                        <motion.button
                          key={major}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                          onClick={() => handleMajorSelect(major)}
                          className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:text-white hover:bg-[#5865F2]/20 transition-all duration-200"
                        >
                          <span>{major}</span>
                          {major === currentAnswer && (
                            <Check className="w-4 h-4 text-[#5865F2]" />
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
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
              <span className="text-sm text-[#888888]">{min}</span>
              <span className="text-2xl font-semibold text-white">
                {displayValue}
              </span>
              <span className="text-sm text-[#888888]">{max}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={displayValue}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-white/20 transition-all duration-200"
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
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-900/50 border border-white/10 text-white appearance-none hover:border-white/20 focus:border-[#5865F2] transition-all duration-200"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1c2e] to-[#1a1c2e] py-24 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute -top-[30rem] -left-[30rem] w-[60rem] h-[60rem] rounded-full bg-[#5865F2] opacity-20 blur-[128px]" />
        <div className="absolute -bottom-[30rem] -right-[30rem] w-[60rem] h-[60rem] rounded-full bg-[#43B581] opacity-20 blur-[128px]" />
      </div>
      
      <div className="relative max-w-2xl mx-auto px-4 z-10">
        <ProgressBar
          currentStep={currentStep + 1}
          totalSteps={questions.length}
          stepTitle={currentQuestion.question}
          isComplete={isComplete}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-gray-900/50 rounded-2xl border border-white/10 p-8 shadow-xl backdrop-blur-lg"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold text-white mb-6">
                {currentQuestion.question}
              </h2>

              {renderQuestionContent()}

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2"
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
              className="px-6 py-3 rounded-lg border border-[#333333] text-gray-300 hover:bg-[#222222] transition-colors"
            >
              ← Back
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext} 
              disabled={!answers[currentQuestion.id as keyof UserAnswers]}
              className="px-6 py-3 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep < questions.length - 1 ? 'Continue →' : 'See Matches →'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}