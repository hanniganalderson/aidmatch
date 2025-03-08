// types.ts

// User answers type
export interface UserAnswers {
  education_level: string;
  school: string;
  major: string;
  gpa: string;
  location: string;
  dashboard_preferences?: string[];
  [key: string]: string | number | string[] | undefined;
}

// School data type
export interface SchoolData {
  id: string;
  name: string;
  state: string;
}

// Question types
export type QuestionType = 'select' | 'combobox' | 'slider' | 'double' | 'multiselect';

export interface QuestionPart {
  id: string;
  question: string;
  type: 'select' | 'combobox' | 'slider';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  parts?: QuestionPart[];
}

// Scholarship types
export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string | null;
  requirements: string | null;
  difficulty_score: number;
  competition_level: 'Low' | 'Medium' | 'High';
  roi_score: number;
  is_local: boolean;
  link: string | null;
  gpa_requirement: number | null;
  major: string | null;
  state?: string;
  national: boolean;
  education_level: string[] | null;
  is_recurring: boolean;
  recurring_period: string | null;
  keywords?: string[];
  description?: string;
}

export interface ScoredScholarship extends Scholarship {
  score: number;
  explanation?: string;
}

export interface MatchResult {
  scholarships: ScoredScholarship[];
  totalMatches: number;
}