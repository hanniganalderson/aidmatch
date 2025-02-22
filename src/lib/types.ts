export interface QueryOptions {
  limit?: number;
  offset?: number;
  includeExpired?: boolean;
}

export interface ScoredScholarship extends Scholarship {
  score: number;
}

export interface SchoolData {
  name: string;
  city: string;
  state: string;
}

export interface UserProfile {
  education_level: string;
  school: string;
  major: string;
  gpa: number;
  location: string;
  is_pell_eligible: boolean;
}
