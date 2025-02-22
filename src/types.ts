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
  roiFactors: {
    awardSize: number;
    applicationEase: number;
    competition: number;
  };
}

export interface UserProfile {
  gpa: number;
  major: string;
  location: string;
  financialNeed?: boolean;
  categories: string[];
  step: number;
  educationLevel?: 'highschool' | 'college';
}

export type Theme = 'light' | 'dark';

export interface NavItem {
  label: string;
  href: string;
}