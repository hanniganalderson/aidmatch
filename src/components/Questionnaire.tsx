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
import type { UserAnswers, SchoolData } from '../types';
import { questions, majors } from '../constants';

export function Questionnaire() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserAnswers>>({});
  const [error, setError] = useState<string | null>(null);
  const [majorInput, setMajorInput] = useState('');
  const [filteredMajors, setFilteredMajors] = useState<typeof majors[number][]>([...majors]);
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
      questions.every(q => answers[q.id] !== undefined && answers[q.id] !== '')
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
    const currentAnswer = answers[questions[currentStep].id as keyof UserAnswers];
    if (!currentAnswer || currentAnswer.trim() === '') {
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
              gpa: parseFloat(answers.gpa || '0'),
              is_pell_eligible: answers.is_pell_eligible === 'Yes'
            });

          if (upsertError) throw upsertError;
        }
        
        navigate('/results', { state: { answers } });
      } catch (error) {
        console.error('Error saving profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to save profile');
      }
    }
  }, [currentStep, answers, user, navigate]);

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
                  answers[currentQuestion.id] === option
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
                value={answers.school || ''}
                error={error || undefined}
              />) : (
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
                          className="w-full flex items-center justify-between px-4 py-3 text-gray-300 transition-colors"
                        >
                          <span>{major}</span>
                          {major === answers[currentQuestion.id] && (
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
        
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#888888]">{min}</span>
              <span className="text-2xl font-semibold text-white">
                {answers[currentQuestion.id] || defaultValue}
              </span>
              <span className="text-sm text-[#888888]">{max}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={answers[currentQuestion.id] || defaultValue}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full h-2 bg-[#333333] rounded-lg appearance-none cursor-pointer"
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
                selected={answers[currentQuestion.id] === level}
                onClick={() => handleAnswer(level)}
              />
            ))}
          </div>
        ) : (
          <div className="relative">
            <select
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#222222] border border-[#333333] text-white appearance-none"
            >
              <option value="">Select {currentQuestion.id === 'location' ? 'a state' : 'an option'}...</option>
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
    <div className="min-h-screen bg-[#121212] py-24">
      <div className="max-w-2xl mx-auto px-4">
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
          className="bg-[#1A1A1A]/50 rounded-2xl border-2 border-[#333333] p-8 shadow-xl backdrop-blur-sm"
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
              disabled={!answers[currentQuestion.id]}
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