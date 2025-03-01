import { LucideIcon } from 'lucide-react';

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string | null;
  major: string;
  majors?: string[];
  competition_level?: string;
  description?: string;
  match_score?: number;
  application_url: string;
  min_gpa?: number;
  education_level?: string;
  requirements?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface UserAnswers {
  // Add your questionnaire answer types here
  [key: string]: any;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface UserProfile {
  id: string;
  school: string;
  major: string;
  gpa: number;
  education_level: string;
  location: string;
}
