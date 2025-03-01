// src/types.ts
import { ComponentType } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export interface UserAnswers {
  education_level: string;
  school: string;
  major: string;
  gpa: string;
  location: string;
  is_pell_eligible: string;
  [key: string]: string | boolean | number;
}

export interface SchoolData {
  id: string;
  name: string;
  city?: string;
  state?: string;
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
  competition_level: 'Low' | 'Medium' | 'High';
  roi_score: number;
  is_local: boolean;
  link: string | null;
  gpa_requirement: number | null;
  major: string | null;
  state?: string;
  school?: string;
  national: boolean | null;
  education_level: string[] | null;
  is_recurring: boolean | null;
  recurring_period: string | null;
  is_pell_eligible?: boolean;
  popularity?: number;
  keywords?: string[];
  description?: string;
  min_gpa?: number;
}

export interface ScoredScholarship extends Scholarship {
  score: number;
  explanation?: string;
  matchReasons?: string[];
}

export interface MatchCategory {
  name: string;
  label?: string;
  count: number;
  scholarships: ScoredScholarship[];
}

export interface UserProfile {
  education_level: string;
  school: string;
  major: string;
  gpa: number;
  location: string;
  is_pell_eligible: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MatchResult {
  scholarships: ScoredScholarship[];
  categories: MatchCategory[];
  totalMatches: number;
}

export type Theme = 'light' | 'dark';