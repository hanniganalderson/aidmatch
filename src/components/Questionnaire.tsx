import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ProgressBar } from './ProgressBar';
import { Search, ChevronDown, Check, GraduationCap, School, BookOpen, Microscope } from 'lucide-react';

const majors = [
  'Accounting',
  'Aerospace Engineering',
  'Agriculture',
  'Architecture',
  'Art & Design',
  'Biology',
  'Business Administration',
  'Chemical Engineering',
  'Chemistry',
  'Civil Engineering',
  'Communications',
  'Computer Engineering',
  'Computer Science',
  'Criminal Justice',
  'Data Science',
  'Economics',
  'Education',
  'Electrical Engineering',
  'English',
  'Environmental Science',
  'Finance',
  'History',
  'Industrial Engineering',
  'Information Technology',
  'International Relations',
  'Journalism',
  'Law',
  'Marketing',
  'Mathematics',
  'Mechanical Engineering',
  'Medicine',
  'Music',
  'Nursing',
  'Philosophy',
  'Physics',
  'Political Science',
  'Psychology',
  'Public Health',
  'Social Work',
  'Sociology',
  'Software Engineering',
  'Statistics',
  'Theatre',
  'Urban Planning',
  'Veterinary Medicine',
  'Other'
];

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const educationLevels = [
  'High School Senior',
  'College Freshman',
  'College Sophomore',
  'College Junior',
  'College Senior',
  'Masters Student',
  'PhD Student'
];

const questions = [
  {
    id: 'education_level',
    question: 'What\'s your current education level?',
    type: 'select',
    options: educationLevels
  },
  {
    id: 'school',
    question: 'What school or institution are you currently attending?',
    type: 'combobox',
    options: []
  },
  {
    id: 'major',
    question: 'What\'s your major or intended field of study?',
    type: 'combobox',
    options: majors
  },
  {
    id: 'gpa',
    question: 'What\'s your GPA?',
    type: 'slider',
    min: 2.0,
    max: 4.0,
    step: 0.1
  },
  {
    id: 'location',
    question: 'Which state are you in?',
    type: 'select',
    options: states
  }
];

const EducationLevelCard = ({ level, selected, onClick }: { level: string; selected: boolean; onClick: () => void }) => {
  const getIcon = () => {
    switch (level) {
      case 'High School Senior':
        return <School className="w-6 h-6" />;
      case 'College Freshman':
      case 'College Sophomore':
      case 'College Junior':
      case 'College Senior':
        return <GraduationCap className="w-6 h-6" />;
      case 'Masters Student':
        return <BookOpen className="w-6 h-6" />;
      case 'PhD Student':
        return <Microscope className="w-6 h-6" />;
      default:
        return <GraduationCap className="w-6 h-6" />;
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-4 rounded-lg border transition-all duration-200 ${
        selected
          ? 'bg-[#5865F2]/20 border-[#5865F2] text-white'
          : 'bg-[#222222] border-[#333333] text-[#888888] hover:bg-[#2A2A2A]'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`${selected ? 'text-[#5865F2]' : 'text-[#666666]'}`}>
          {getIcon()}
        </div>
        <span className="text-left">{level}</span>
      </div>
    </motion.button>
  );
};

const SearchInput = ({ icon: Icon, ...props }: { icon: any } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="relative">
    <Icon className="absolute left-3 top-[50%] -translate-y-[50%] w-5 h-5 text-gray-400 pointer-events-none" />
    <input {...props} className={`input-field pl-10 ${props.className || ''}`} />
  </div>
);

export function Questionnaire() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [majorInput, setMajorInput] = useState('');
  const [filteredMajors, setFilteredMajors] = useState(majors);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [schoolInput, setSchoolInput] = useState('');
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

  const handleSchoolInput = async (value: string) => {
    setSchoolInput(value);
    handleAnswer(value);

    if (value.length >= 2) {
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('name')
          .ilike('name', `%${value}%`)
          .limit(5);

        if (error) throw error;
        if (data) {
          setSchoolSuggestions(data.map(school => school.name));
          setShowSchoolDropdown(true);
        }
      } catch (error) {
        console.error('Error fetching schools:', error);
        setSchoolSuggestions([]);
      }
    } else {
      setSchoolSuggestions([]);
      setShowSchoolDropdown(false);
    }
  };

  const handleSchoolSelect = (school: string) => {
    setSchoolInput(school);
    handleAnswer(school);
    setShowSchoolDropdown(false);
  };

  const handleMajorInput = (value: string) => {
    setMajorInput(value);
    setFilteredMajors(
      majors.filter(major => 
        major.toLowerCase().includes(value.toLowerCase())
      )
    );
    setDropdownOpen(true);
  };

  const handleMajorSelect = (major: string) => {
    setMajorInput(major);
    handleAnswer(major);
    setDropdownOpen(false);
  };

  useEffect(() => {
    // Check if all questions are answered
    setIsComplete(Object.keys(answers).length === questions.length);
  }, [answers]);

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.major-dropdown')) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentStep].id]: value
    }));
    setError(null);
  };

  const handleNext = async () => {
    const currentAnswer = answers[questions[currentStep].id];
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
              ...answers
            }, {
              onConflict: 'user_id'
            });

          if (upsertError) throw upsertError;
        }
        
        navigate('/results', { state: { answers } });
      } catch (error) {
        console.error('Error saving profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to save profile');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError(null);
    } else {
      navigate('/');
    }
  };

  const currentQuestion = questions[currentStep];

  const renderQuestionContent = () => {
    switch (currentQuestion.type) {
      case 'text':
        return (
          <div className="relative school-dropdown">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={schoolInput}
                onChange={(e) => handleSchoolInput(e.target.value)}
                className="input-field pl-10"
                placeholder="Enter your school name"
              />
            </div>
            <AnimatePresence>
              {showSchoolDropdown && schoolSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 w-full mt-2 py-1 bg-[#222222] rounded-lg border border-[#333333] max-h-60 overflow-y-auto"
                >
                  {schoolSuggestions.map((school) => (
                    <motion.button
                      key={school}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      onClick={() => handleSchoolSelect(school)}
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-300 transition-colors"
                    >
                      <span>{school}</span>
                      {school === answers[currentQuestion.id] && (
                        <Check className="w-4 h-4 text-[#5865F2]" />
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'combobox':
        return (
          <div className="relative">
            {currentQuestion.id === 'school' ? (
              <div>
                <SearchInput
                  icon={Search}
                  type="text"
                  value={schoolInput}
                  onChange={(e) => handleSchoolInput(e.target.value)}
                  placeholder="Enter your school name"
                />
                <AnimatePresence>
                  {showSchoolDropdown && schoolSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-20 w-full mt-2 py-1 bg-[#222222] rounded-lg border border-[#333333] max-h-60 overflow-y-auto"
                    >
                      {schoolSuggestions.map((school) => (
                        <motion.button
                          key={school}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                          onClick={() => handleSchoolSelect(school)}
                          className="w-full flex items-center justify-between px-4 py-3 text-gray-300 transition-colors"
                        >
                          <span>{school}</span>
                          {school === answers[currentQuestion.id] && (
                            <Check className="w-4 h-4 text-[#5865F2]" />
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div>
                <SearchInput
                  icon={Search}
                  type="text"
                  value={majorInput}
                  onChange={(e) => handleMajorInput(e.target.value)}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Search or enter your major"
                />
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-20 w-full mt-2 py-1 bg-[#222222] rounded-lg border border-[#333333] max-h-60 overflow-y-auto"
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
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#888888]">2.0</span>
              <span className="text-2xl font-semibold text-white">
                {answers[currentQuestion.id] || '3.0'}
              </span>
              <span className="text-sm text-[#888888]">4.0</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="4.0"
              step="0.1"
              value={answers[currentQuestion.id] || '3.0'}
              onChange={(e) => handleAnswer(e.target.value)}
              className="range-slider"
            />
          </div>
        );
      case 'select':
        return currentQuestion.id === 'education_level' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {educationLevels.map((level) => (
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
              className="input-field pr-10 appearance-none"
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
          className="bg-[#1A1A1A] rounded-xl border border-[#333333] p-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-medium text-white mb-6">
                {currentQuestion.question}
              </h2>

              {renderQuestionContent()}

              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <button 
              onClick={handleBack} 
              className="px-6 py-3 rounded-lg border border-[#333333] text-gray-300 hover:bg-[#222222] transition-colors"
            >
              ← Back
            </button>
            <button 
              onClick={handleNext} 
              disabled={!answers[currentQuestion.id]}
              className="px-6 py-3 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep < questions.length - 1 ? 'Continue →' : 'See Matches →'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}