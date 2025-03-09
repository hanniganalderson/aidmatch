// src/types.ts - Updated
import { ComponentType } from 'react';

// Navigation item type
export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

// User's questionnaire answers
export interface UserAnswers {
  education_level: string;
  school: string;
  major: string;
  gpa: string;
  location: string;
  is_pell_eligible?: string;
  dashboard_preferences?: string[];
  [key: string]: string | boolean | number | string[] | undefined;
}

// School data for search functionality
export interface SchoolData {
  id: string;
  name: string;
  city?: string;
  state?: string;
}

// User profile data derived from answers
export interface UserProfile {
  user_id?: string;
  education_level: string;
  school: string;
  major: string;
  gpa: number;
  location: string;
  is_pell_eligible?: boolean;
  preferences?: Record<string, any>;
}

// Base scholarship type from database
export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string | null;
  requirements?: string;
  description?: string;
  difficulty_score?: number;
  competition_level: 'Low' | 'Medium' | 'High';
  roi_score?: number;
  is_local?: boolean;
  link?: string | null;
  gpa_requirement?: number;
  major?: string;
  national?: boolean;
  state?: string;
  school?: string;
  education_level?: string[];
  is_recurring?: boolean;
  recurring_period?: string | null;
  keywords?: string[];
  popularity?: number;
  is_pell_eligible?: boolean;
  // New properties for filtering
  is_need_based?: boolean;
  essay_required?: boolean;
  created_at?: string;
  updated_at?: string;
  // AI-generated flag
  is_ai_generated?: boolean;
}

// Scholarship with match score
export interface ScoredScholarship extends Scholarship {
  score: number;
  explanation?: string;
}

// Category of scholarships
export interface MatchCategory {
  name: string;
  count: number;
  scholarships: ScoredScholarship[];
}

// Complete matching result
export interface MatchResult {
  scholarships: ScoredScholarship[];
  categories: MatchCategory[];
  totalMatches: number;
}

// Filter options for results page
export interface ScholarshipFilters {
  minAmount: number;
  maxAmount: number;
  competition: string[];
  showSavedOnly: boolean;
  sortBy: string;
  scope: string[];
  deadline: string | null;
  educationLevel: string[];
  major: string | null;
  // New filter properties
  needBased: boolean | null;
  essayRequired: boolean | null;
}

// Question for the questionnaire
export interface Question {
  id: string;
  question: string;
  type: string;
  options?: string[];
  parts?: QuestionPart[];
  min?: number;
  max?: number;
  step?: number;
}

// Part of a double question
export interface QuestionPart {
  id: string;
  question: string;
  type: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}