import type { Scholarship } from '../types';
import type { UserProfile } from './scholarshipService';

const STEM_MAJORS = [
  'Computer Science',
  'Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Information Technology',
  'Data Science',
  'Statistics',
  'Biochemistry',
  'Environmental Science',
  'Neuroscience',
  'Robotics',
  'Cybersecurity'
];

function isSTEMMajor(major: string): boolean {
  return STEM_MAJORS.some(stemMajor => 
    major.toLowerCase().includes(stemMajor.toLowerCase())
  );
}

export function calculateScholarshipScore(scholarship: Scholarship, userProfile: UserProfile): number {
  let score = 100; // Base score

  // Education Level Match (0-25 points)
  if (!scholarship.education_level || scholarship.education_level === userProfile.education_level) {
    score += 25;
  }

  // Location Match (0-20 points)
  if (!scholarship.state || scholarship.state === userProfile.location) {
    score += 20;
  }

  // School Match (0-25 points)
  if (!scholarship.school || scholarship.school === userProfile.school) {
    score += 25;
  }

  // Major Match (0-25 points)
  const majorMatches = 
    !scholarship.major || 
    scholarship.major === userProfile.major ||
    (scholarship.major === 'STEM' && isSTEMMajor(userProfile.major));
  if (majorMatches) {
    score += 25;
  }

  // GPA Score (0-30 points)
  if (scholarship.gpa_requirement) {
    const gpaBuffer = userProfile.gpa - scholarship.gpa_requirement;
    score += Math.min(gpaBuffer * 15, 30); // Up to 30 points
  }

  // Amount Factor (0-20 points)
  const amountScore = Math.min(20, (scholarship.amount / 10000) * 20);
  score += amountScore;

  // Competition Level (-10 to +10 points)
  switch (scholarship.competition_level) {
    case 'Low':
      score += 10;
      break;
    case 'Medium':
      score += 5;
      break;
    case 'High':
      score -= 5;
      break;
  }

  // Deadline Proximity (-10 to +10 points)
  const daysUntilDeadline = scholarship.deadline ? Math.ceil(
    (new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ) : 90; // Default to 90 days if no deadline
  
  if (daysUntilDeadline <= 30) {
    // Urgent deadlines get a boost
    score += Math.min(10, (30 - daysUntilDeadline) / 3);
  } else if (daysUntilDeadline > 90) {
    // Far-off deadlines get slightly penalized
    score -= Math.min(10, (daysUntilDeadline - 90) / 30);
  }

  // Normalize final score to 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}