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
  amount: number;
  deadline: string;
  effortLevel: 'Low' | 'Medium' | 'High';
  matchScore: number;
  description: string;
  eligibility: string[];
  essayRequirements?: string[];
  applicationUrl: string;
  provider: string;
  min_gpa: number;
  major: string | null;
  school: string | null;
  state: string | null;
  education_level: string | null;
  requires_pell: boolean;
  roiFactors: {
    awardSize: number;
    applicationEase: number;
    competition: number;
  };
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