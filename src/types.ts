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
  education_level?: string;
  major?: string;
  gpa?: string;
  state?: string;
  school?: string;
  extracurricular_activities?: string[];
  ethnicity?: string;
  gender?: string;
  income_level?: string;
  first_generation?: boolean;
  disabilities?: string[];
  military_affiliation?: string;
  interests?: string[];
  career_goals?: string[];
  achievements?: string[];
  [key: string]: any;
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
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  education_level?: string;
  major?: string;
  gpa?: string;
  school?: string;
  state?: string;
  is_subscribed?: boolean;
  stripe_customer_id?: string;
  created_at?: string;
  updated_at?: string;
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
export interface ScoredScholarship {
  id: string;
  name: string;
  description: string;
  amount: number;
  deadline: string;
  requirements: string;
  application_link?: string;
  score: number;
  match_reasons?: string[];
  provider?: string;
  competition_level?: 'Low' | 'Medium' | 'High';
  major?: string;
  gpa_requirement?: number;
  education_level?: string[];
  link?: string;
  essay_required?: boolean;
  is_need_based?: boolean;
  is_merit_based?: boolean;
  application_process?: string;
  match_score?: number;
  explanation?: string;
  is_ai_generated?: boolean;
  recurring_period?: string;
  is_recurring?: boolean;
  subscription?: string;
  join?: string;
  length?: string;
  is_local?: boolean;
  national?: boolean;
  website?: string;
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

export interface SubscriptionData {
  id: string;
  user_id: string;
  status: string;
  price_id?: string;
  quantity?: number;
  cancel_at_period_end?: boolean;
  created_at: string;
  current_period_start?: string;
  current_period_end?: string;
  ended_at?: string;
  cancel_at?: string;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
}