import { Question } from './types';

export const majors: readonly string[] = [
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
  'Other'
];

export const states: readonly string[] = [
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

export const educationLevels: readonly string[] = [
  'High School Senior',
  'College Freshman',
  'College Sophomore',
  'College Junior',
  'College Senior',
  'Masters Student',
  'PhD Student',
  'Other'
];

export const questions: Question[] = [
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
  },
  {
    id: 'is_pell_eligible',
    question: 'Are you Pell Grant eligible?',
    type: 'button',
    options: ['Yes', 'No']
  }
];