import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Calendar, DollarSign, GraduationCap, BookOpen, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function InputScholarship() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    amount: '',
    deadline: '',
    requirements: '',
    gpa_requirement: '',
    major: '',
    competition_level: '',
    education_level: [] as string[],
    link: '',
    is_local: false,
    location: ''
  });

  const educationLevels = [
    'High School Senior',
    'College Freshman',
    'College Sophomore',
    'College Junior',
    'College Senior',
    'Masters Student',
    'PhD Student'
  ];

  const competitionLevels = ['low', 'medium', 'high'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleEducationLevelChange = (level: string) => {
    setFormData(prev => {
      const currentLevels = [...prev.education_level];
      if (currentLevels.includes(level)) {
        return { ...prev, education_level: currentLevels.filter(l => l !== level) };
      } else {
        return { ...prev, education_level: [...currentLevels, level] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/signin');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.provider || !formData.amount) {
        throw new Error('Please fill in all required fields');
      }
      
      // Convert amount to number
      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        throw new Error('Please enter a valid amount');
      }
      
      // Prepare data for submission
      const scholarshipData = {
        name: formData.name,
        provider: formData.provider,
        amount: amount,
        deadline: formData.deadline || null,
        requirements: formData.requirements || null,
        gpa_requirement: formData.gpa_requirement || null,
        major: formData.major || null,
        competition_level: formData.competition_level || 'medium',
        education_level: formData.education_level.length > 0 ? formData.education_level : null,
        link: formData.link || null,
        is_local: formData.is_local,
        state: formData.is_local ? formData.location : null,
        submitted_by: user.id,
        roi_score: 50, // Default value
        national: !formData.is_local
      };
      
      // Submit to Supabase
      const { error: submitError } = await supabase
        .from('scholarships')
        .insert([scholarshipData]);
      
      if (submitError) throw submitError;
      
      // Success!
      setSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        provider: '',
        amount: '',
        deadline: '',
        requirements: '',
        gpa_requirement: '',
        major: '',
        competition_level: '',
        education_level: [],
        link: '',
        is_local: false,
        location: ''
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err) {
      console.error('Error submitting scholarship:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit scholarship');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full mb-6">
              <Plus className="w-4 h-4" />
              <span>Contribute</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Submit a Scholarship
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Help other students by adding scholarships you've discovered to our database
            </p>
          </div>
          
          <div className="bg-white dark:bg-[#171923]/60 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-[#2A2D3A] p-8 shadow-xl">
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500"
              >
                Scholarship submitted successfully! Thank you for your contribution.
              </motion.div>
            )}
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500"
              >
                {error}
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Scholarship Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="provider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Provider/Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="provider"
                      name="provider"
                      value={formData.provider}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount ($) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="5000"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Application Deadline
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        id="deadline"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requirements/Description
                  </label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Describe the scholarship requirements and eligibility criteria"
                  />
                </div>
                
                <div>
                  <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Application Link
                  </label>
                  <input
                    type="url"
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://example.com/apply"
                  />
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-[#2A2D3A] pt-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Eligibility Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="gpa_requirement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum GPA
                    </label>
                    <input
                      type="text"
                      id="gpa_requirement"
                      name="gpa_requirement"
                      value={formData.gpa_requirement}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="3.0"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="major" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Major/Field of Study
                    </label>
                    <input
                      type="text"
                      id="major"
                      name="major"
                      value={formData.major}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g. Engineering, Business, Any"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Education Level
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {educationLevels.map(level => (
                      <label
                        key={level}
                        className={`
                          flex items-center justify-center px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer
                          ${formData.education_level.includes(level)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white dark:bg-[#171923] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#2A2D3A]'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.education_level.includes(level)}
                          onChange={() => handleEducationLevelChange(level)}
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Competition Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {competitionLevels.map(level => (
                      <label
                        key={level}
                        className={`
                          flex items-center justify-center px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer
                          ${formData.competition_level === level
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white dark:bg-[#171923] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#2A2D3A]'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="competition_level"
                          value={level}
                          className="sr-only"
                          checked={formData.competition_level === level}
                          onChange={handleChange}
                        />
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-[#2A2D3A] pt-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Details
                </h2>
                
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_local"
                      checked={formData.is_local}
                      onChange={handleCheckboxChange}
                      className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-300 dark:border-[#2A2D3A]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      This is a state/local scholarship
                    </span>
                  </label>
                </div>
                
                {formData.is_local && (
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g. California"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white
                    ${isSubmitting
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Submit Scholarship
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}