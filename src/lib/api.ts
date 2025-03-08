import type { UserAnswers, Scholarship, SchoolData } from '../types';

const API_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'apikey': API_KEY,
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export async function searchSchools(query: string): Promise<SchoolData[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    name: `ilike.*${query}*`,
    select: 'id,name,state',
    limit: '10'
  });

  return fetchApi(`schools?${params}`);
}

export async function getMatchedScholarships(answers: UserAnswers) {
  // Build query parameters based on user answers
  const params = new URLSearchParams({
    select: '*',
    education_level: `cs.{${answers.education_level}}`,
    order: 'amount.desc,deadline.asc',
    limit: '50'
  });

  if (answers.gpa) {
    params.append('gpa_requirement', `lte.${answers.gpa}`);
  }

  if (answers.major) {
    params.append('major', `ilike.*${answers.major}*`);
  }

  if (answers.location) {
    params.append('or', `(state.eq.${answers.location},national.eq.true)`);
  }

  const scholarships = await fetchApi(`scholarships?${params}`);
  return calculateScores(scholarships, answers);
}

function calculateScores(scholarships: Scholarship[], answers: UserAnswers) {
  return scholarships.map(scholarship => {
    let score = 100;

    // Education level match
    if (scholarship.education_level?.includes(answers.education_level)) {
      score += 20;
    }

    // GPA match
    if (scholarship.gpa_requirement && answers.gpa) {
      const gpaBuffer = parseFloat(answers.gpa) - scholarship.gpa_requirement;
      if (gpaBuffer >= 0) {
        score += Math.min(20, gpaBuffer * 10);
      }
    }

    // Major match
    if (scholarship.major?.toLowerCase() === answers.major.toLowerCase()) {
      score += 20;
    }

    // Location match
    if (scholarship.state === answers.location) {
      score += 15;
    } else if (scholarship.national) {
      score += 10;
    }

    // Competition level adjustment
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

    // Amount factor (up to 15 points)
    const amountScore = Math.min(15, (scholarship.amount / 10000) * 15);
    score += amountScore;

    // Deadline proximity (if exists)
    if (scholarship.deadline) {
      const daysUntilDeadline = Math.ceil(
        (new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilDeadline <= 7) {
        score += 10; // Urgent
      } else if (daysUntilDeadline <= 30) {
        score += 5; // Approaching
      }
    }

    return {
      ...scholarship,
      score: Math.max(0, Math.min(100, Math.round(score)))
    };
  }).sort((a, b) => b.score - a.score);
}

export async function saveScholarship(userId: string, scholarshipId: string) {
  return fetchApi('saved_scholarships', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      scholarship_id: scholarshipId,
      saved_at: new Date().toISOString()
    })
  });
}

export async function unsaveScholarship(userId: string, scholarshipId: string) {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    scholarship_id: `eq.${scholarshipId}`
  });

  return fetchApi(`saved_scholarships?${params}`, {
    method: 'DELETE'
  });
}

export async function getSavedScholarships(userId: string) {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    select: 'scholarship_id,scholarships(*)'
  });

  return fetchApi(`saved_scholarships?${params}`);
}