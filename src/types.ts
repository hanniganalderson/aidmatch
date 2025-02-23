export interface UserAnswers {
  education_level: string;
  school: string;
  major: string;
  gpa: string;
  location: string;
  is_pell_eligible: string;
}

export interface SchoolData {
  name: string;
  city: string;
  state: string;
}

export interface Question {
  id: keyof UserAnswers;
  question: string;
  type: 'select' | 'combobox' | 'slider' | 'button';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string | null;
  requirements: string | null;
  difficulty_score: number;
  competition_level: string;
  roi_score: number;
  is_local: boolean;
  link: string | null;
  gpa_requirement: number | null;
  major: string | null;
  national: boolean | null;
  education_level: string[];
  is_recurring: boolean | null;
  recurring_period: string | null;
}

export interface ScoredScholarship extends Scholarship {
  score: number;
}

export interface UserProfile {
  user_id: string;
  education_level: string;
  school: string;
  major: string;
  gpa: number;
  location: string;
  is_pell_eligible: boolean;
  created_at?: string;
  updated_at?: string;
}

export type Theme = 'light' | 'dark';

export interface NavItem {
  label: string;
  href: string;
}