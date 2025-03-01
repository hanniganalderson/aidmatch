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
  is_pell_eligible: string;
  location: string;
  [key: string]: string | boolean | number;
}

export interface SchoolData {
  id: string;
  name: string;
  city?: string;
  state?: string;
}