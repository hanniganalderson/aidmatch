// constants.ts
import { Question } from './types';

export const questions: Question[] = [
  {
    id: 'education_and_school',
    question: 'Tell us about your education',
    type: 'double',
    parts: [
      {
        id: 'education_level',
        question: 'What\'s your current education level?',
        type: 'select',
        options: [
          'High School Senior',
          'College Freshman',
          'College Sophomore',
          'College Junior',
          'College Senior',
          'Masters Student',
          'PhD Student'
        ]
      },
      {
        id: 'school',
        question: 'What school do you attend or plan to attend?',
        type: 'combobox',
        options: []
      }
    ]
  },
  {
    id: 'location',
    question: 'Which state are you in?',
    type: 'select',
    options: [
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
    ]
  },
  {
    id: 'major_and_gpa',
    question: 'Tell us about your academics',
    type: 'double',
    parts: [
      {
        id: 'major',
        question: 'What\'s your major or intended field of study?',
        type: 'combobox',
        options: [
          'Computer Science',
          'Engineering',
          'Business',
          'Medicine',
          'Law',
          'Arts',
          'Education',
          'Sciences',
          'Mathematics',
          'Social Sciences',
          'Humanities'
        ]
      },
      {
        id: 'gpa',
        question: 'What\'s your GPA?',
        type: 'slider',
        min: 2.0,
        max: 4.0,
        step: 0.1
      }
    ]
  },
  {
    id: 'dashboard_preferences',
    question: 'What would you like to see on your financial aid dashboard?',
    type: 'multiselect',
    options: [
      'Scholarship Deadlines',
      'Application Status',
      'Financial Aid Tips',
      'FAFSA Updates',
      'Loan Information',
      'Grant Opportunities',
      'Work-Study Programs'
    ]
  }
];