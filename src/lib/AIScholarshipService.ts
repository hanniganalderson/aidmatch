// src/lib/AIScholarshipService.ts
import type { UserAnswers, ScoredScholarship } from '../types';
import { supabase } from './supabase';

// Helper function to get OpenAI API key from environment or database
async function getOpenAIKey(): Promise<string> {
  // First try to get from environment
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (apiKey) {
    console.log('Using OpenAI API key from environment');
    return apiKey;
  }
  
  // If not in environment, try to get from database
  try {
    console.log('Fetching OpenAI API key from database');
    const { data, error } = await supabase
      .from('api_keys')
      .select('openai_key')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching API key from database:', error);
      throw error;
    }
    
    if (data && data.openai_key) {
      console.log('API key found in database');
      return data.openai_key;
    }
    
    throw new Error('No API key found in database');
  } catch (error) {
    console.error('Error fetching API key from database:', error);
    throw new Error('OpenAI API key not configured');
  }
}

// Define the OpenAI API URL
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini'; // Using the model that was working before

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIGeneratedScholarship {
  name: string;
  provider: string;
  amount: number;
  deadline: string | null;
  requirements: string;
  description: string;
  competition_level: 'Low' | 'Medium' | 'High';
  major?: string;
  gpa_requirement?: number;
  education_level?: string[];
  website?: string;
  essay_required?: boolean;
  is_need_based?: boolean;
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get date X months in the future in YYYY-MM-DD format
 */
function getDateMonthsAhead(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

/**
 * Check if a string is a valid URL
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (e) {
    return false;
  }
}

/**
 * Get AI-powered scholarship recommendations based on user profile
 */
export async function getAIScholarshipRecommendations(
  userAnswers: UserAnswers,
  count: number = 5
): Promise<ScoredScholarship[]> {
  try {
    console.log('Generating AI scholarship recommendations...');
    
    // Extract profile information from answers
    const profile = {
      education_level: userAnswers.education_level,
      school: userAnswers.school,
      major: userAnswers.major,
      gpa: parseFloat(userAnswers.gpa),
      location: userAnswers.location
    };
    
    // Get API key
    const apiKey = await getOpenAIKey();

    // Enhanced system prompt for more accurate scholarship generation
    const systemPrompt = `You are an expert scholarship database generator. Create realistic, tailored scholarship opportunities for students based on their academic profile.
    Each scholarship should be realistic, specific, and well-matched to the student's profile.
    
    Format your response as a JSON array of scholarships with the following fields:
    - name: Scholarship name (be specific and realistic)
    - provider: Organization name (be specific and realistic)
    - amount: Dollar amount (realistic between $500-$25000)
    - deadline: Date in YYYY-MM-DD format (set within the next 3-9 months)
    - requirements: Brief description of eligibility criteria
    - description: 1-2 sentence summary of the scholarship
    - competition_level: One of "Low", "Medium", or "High"
    - major: Major field requirement (if applicable)
    - gpa_requirement: Minimum GPA (if applicable)
    - education_level: Array of eligible education levels
    - website: URL (only provide if you're certain it's a real scholarship website, otherwise leave as null)
    - essay_required: Boolean indicating if an essay is required
    - is_need_based: Boolean indicating if it's need-based vs. merit-based
    
    DO NOT include any text or explanations outside the JSON array. Return ONLY a valid JSON array.`;

    // Enhanced user prompt
    const userPrompt = `Generate ${count} realistic and highly relevant scholarship opportunities for a student with the following profile:
    
    Student Profile:
    - Education Level: ${profile.education_level}
    - School: ${profile.school}
    - Major: ${profile.major}
    - GPA: ${profile.gpa}
    - Location: ${profile.location}
    
    Create scholarships that would be excellent matches for this student. Include a mix of:
    1. Local scholarships specific to ${profile.location}
    2. Major-specific scholarships for ${profile.major}
    3. School-specific scholarships for students at ${profile.school}
    4. General scholarships this student would qualify for
    
    IMPORTANT REQUIREMENTS:
    - Ensure deadlines are within the next 3-9 months (${getCurrentDate()} to ${getDateMonthsAhead(9)})
    - Specify realistic award amounts ($500-$25000, mostly $1000-$5000)
    - Only include website URLs if you're confident they would be real scholarship websites, otherwise set to null
    - Mark appropriate competition levels based on specificity of criteria and scope
    
    Return ONLY the JSON array with no additional text.`;

    // Prepare the messages for OpenAI
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // Make OpenAI API call with enhanced parameters
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected response format from OpenAI:', data);
      throw new Error('Invalid response format from OpenAI API');
    }
    
    const content = data.choices[0].message.content.trim();
    
    // Parse the JSON response with improved error handling
    let scholarships: AIGeneratedScholarship[];
    try {
      // Try to extract the JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        scholarships = JSON.parse(jsonMatch[0]);
      } else {
        // If no array is found, try parsing the whole content as a JSON object with scholarships property
        const jsonObj = JSON.parse(content);
        scholarships = jsonObj.scholarships || [];
      }
      
      if (!Array.isArray(scholarships) || scholarships.length === 0) {
        throw new Error('No valid scholarships found in response');
      }
    } catch (err) {
      console.error('Error parsing AI-generated scholarships:', err, content);
      throw new Error('Failed to parse AI scholarship recommendations');
    }
    
    console.log(`Successfully parsed ${scholarships.length} AI scholarship recommendations`);

    // Convert to scored scholarships format with improved scoring
    const scoredScholarships: ScoredScholarship[] = scholarships.map((scholarship, index) => {
      // Generate a consistent ID for AI recommendations
      const id = `ai-${Date.now()}-${index}`;
      
      // Calculate a more nuanced score based on multiple factors
      let baseScore = 85; // Start with a high baseline for AI recommendations
      
      // Adjust score based on how well the scholarship matches the student profile
      if (scholarship.major && scholarship.major.toLowerCase() === profile.major.toLowerCase()) {
        baseScore += 3;
      }
      
      if (scholarship.gpa_requirement && profile.gpa >= scholarship.gpa_requirement) {
        baseScore += 2;
      }
      
      if (scholarship.education_level && Array.isArray(scholarship.education_level) && 
          scholarship.education_level.includes(profile.education_level)) {
        baseScore += 3;
      }
      
      if (scholarship.provider.toLowerCase().includes(profile.location.toLowerCase())) {
        baseScore += 2; // Local scholarship bonus
      }
      
      if (scholarship.provider.toLowerCase().includes(profile.school.toLowerCase())) {
        baseScore += 3; // School-specific bonus
      }
      
      // Quality indicators
      if (scholarship.website && isValidUrl(scholarship.website)) {
        baseScore += 2; // Has valid website
      }
      
      // Cap the score at 100
      const adjustedScore = Math.min(100, baseScore);
      
      return {
        id,
        name: scholarship.name,
        provider: scholarship.provider,
        amount: scholarship.amount,
        deadline: scholarship.deadline,
        requirements: scholarship.requirements || scholarship.description,
        description: scholarship.description,
        competition_level: scholarship.competition_level,
        roi_score: 85, // High ROI score for AI recommendations
        is_local: scholarship.provider.toLowerCase().includes(profile.location.toLowerCase()),
        link: scholarship.website || null,
        gpa_requirement: scholarship.gpa_requirement,
        major: scholarship.major || profile.major,
        national: !scholarship.provider.toLowerCase().includes(profile.location.toLowerCase()),
        education_level: scholarship.education_level || [profile.education_level],
        score: adjustedScore,
        is_ai_generated: true, // Flag to identify AI-generated scholarships
        essay_required: scholarship.essay_required,
        is_need_based: scholarship.is_need_based
      };
    });

    // Save AI-generated scholarships to local storage for persistence
    try {
      const existingData = localStorage.getItem('ai-scholarships');
      let allAIScholarships = existingData ? JSON.parse(existingData) : [];
      
      // Add new scholarships
      allAIScholarships = [...scoredScholarships, ...allAIScholarships].slice(0, 20); // Keep max 20
      
      localStorage.setItem('ai-scholarships', JSON.stringify(allAIScholarships));
    } catch (err) {
      console.warn('Could not save AI scholarships to local storage:', err);
    }
    
    return scoredScholarships;
  } catch (error) {
    console.error('Error generating AI scholarship recommendations:', error);
    
    // Try to fallback to cached scholarships on error
    const cachedScholarships = getCachedAIScholarships();
    if (cachedScholarships.length > 0) {
      console.log('Falling back to cached AI scholarships due to error');
      return cachedScholarships;
    }
    
    // Return empty array if no cached scholarships available
    return [];
  }
}

/**
 * Get cached AI scholarship recommendations if available
 */
export function getCachedAIScholarships(): ScoredScholarship[] {
  try {
    const cachedData = localStorage.getItem('ai-scholarships');
    if (cachedData) {
      const scholarships = JSON.parse(cachedData);
      
      // Filter out expired scholarships
      const currentDate = new Date();
      return scholarships.filter((scholarship: ScoredScholarship) => {
        if (!scholarship.deadline) return true;
        const deadlineDate = new Date(scholarship.deadline);
        return deadlineDate > currentDate;
      });
    }
  } catch (err) {
    console.warn('Error reading cached AI scholarships:', err);
  }
  return [];
}