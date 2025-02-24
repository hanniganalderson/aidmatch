import { LucideIcon } from 'lucide-react';

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
