// src/lib/AIScholarshipService.ts
import type { UserAnswers, ScoredScholarship } from '../types';
import { supabase } from './supabase';
import { 
  makeAIRequest, 
  AIServiceType, 
  getScholarshipMatchingUserMessage 
} from './tiered-ai-service';
import { validateUrl } from './url-utils';

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

// Local storage key for caching AI scholarships
const AI_SCHOLARSHIPS_CACHE_KEY = 'aidmatch_ai_scholarships';

/**
 * Get AI-powered scholarship recommendations based on user profile
 */
export async function getAIScholarshipRecommendations(
  userAnswers: UserAnswers,
  count: number = 5,
  isSubscribed: boolean = false
): Promise<ScoredScholarship[]> {
  try {
    console.log('Generating AI scholarship recommendations...');
    
    // Get user message for scholarship matching
    const userMessage = getScholarshipMatchingUserMessage(userAnswers, isSubscribed);
    
    // Make AI request
    const responseText = await makeAIRequest(
      AIServiceType.SCHOLARSHIP_MATCHING,
      isSubscribed,
      userMessage
    );
    
    // Parse JSON response
    let scholarships: any[] = [];
    try {
      // Extract JSON from response (in case there's any text around it)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        scholarships = JSON.parse(jsonMatch[0]);
      } else {
        scholarships = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw response:', responseText);
      throw new Error('Failed to parse AI recommendations');
    }
    
    // Limit to requested count
    scholarships = scholarships.slice(0, count);
    
    // Convert to scored scholarships format
    const scoredScholarships: ScoredScholarship[] = scholarships.map((scholarship, index) => {
      // Generate a consistent ID for AI recommendations
      const id = `ai-${Date.now()}-${index}`;
      
      // Calculate score based on match_score if available, or use a default scoring system
      let score = scholarship.match_score;
      
      if (!score) {
        // Default scoring logic if match_score not provided
        let baseScore = 85; // Start with a high baseline for AI recommendations
        
        // Adjust score based on how well the scholarship matches the student profile
        if (scholarship.major && scholarship.major.toLowerCase() === userAnswers.major.toLowerCase()) {
          baseScore += 3;
        }
        
        if (scholarship.gpa_requirement && parseFloat(userAnswers.gpa) >= scholarship.gpa_requirement) {
          baseScore += 2;
        }
        
        if (scholarship.education_level && Array.isArray(scholarship.education_level) && 
            scholarship.education_level.includes(userAnswers.education_level)) {
          baseScore += 3;
        }
        
        if (scholarship.provider.toLowerCase().includes(userAnswers.state.toLowerCase())) {
          baseScore += 2; // Local scholarship bonus
        }
        
        if (userAnswers.school && scholarship.provider.toLowerCase().includes(userAnswers.school.toLowerCase())) {
          baseScore += 3; // School-specific bonus
        }
        
        // Quality indicators
        if (scholarship.website && isValidUrl(scholarship.website)) {
          baseScore += 2; // Has valid website
        }
        
        // Cap the score at 100
        score = Math.min(100, baseScore);
      }
      
      return {
        id,
        name: scholarship.name,
        provider: scholarship.provider,
        amount: scholarship.amount,
        deadline: scholarship.deadline,
        requirements: scholarship.requirements,
        description: scholarship.description,
        competition_level: scholarship.competition_level || 'Medium',
        major: scholarship.major || null,
        gpa_requirement: scholarship.gpa_requirement || null,
        education_level: Array.isArray(scholarship.education_level) ? scholarship.education_level : [userAnswers.education_level],
        link: validateUrl(scholarship.website),
        essay_required: scholarship.essay_required || false,
        is_need_based: scholarship.is_need_based || false,
        application_process: scholarship.application_process || null,
        score: score,
        is_ai_generated: true
      };
    });
    
    // Cache the results
    cacheAIScholarships(scoredScholarships);
    
    return scoredScholarships;
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    throw error;
  }
}

/**
 * Cache AI scholarships in local storage
 */
function cacheAIScholarships(scholarships: ScoredScholarship[]): void {
  try {
    localStorage.setItem(AI_SCHOLARSHIPS_CACHE_KEY, JSON.stringify(scholarships));
  } catch (error) {
    console.error('Error caching AI scholarships:', error);
  }
}

/**
 * Get cached AI scholarships from local storage
 */
export function getCachedAIScholarships(): ScoredScholarship[] | null {
  try {
    const cached = localStorage.getItem(AI_SCHOLARSHIPS_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error retrieving cached AI scholarships:', error);
    return null;
  }
}

// Instead of:
/*
export function isValidUrl(url: string | null | undefined): boolean {
  return !!validateUrl(url);
}
*/

// Use the existing implementation or rename this one if both are needed
export function validateScholarshipUrl(url: string | null | undefined): boolean {
  return !!validateUrl(url);
}

// Fix the userAnswers reference error
export function getStateMatchingPrompt(userAnswers: UserAnswers): string {
  const stateValue = userAnswers?.state ? String(userAnswers.state).toLowerCase() : '';
  
  // Rest of the function...
  return `State: ${stateValue || 'Not specified'}`;
}

// Fix other type errors by adding proper type guards
export function formatUserAnswersForPrompt(userAnswers: UserAnswers): string {
  const formattedAnswers = Object.entries(userAnswers).map(([key, value]) => {
    if (value === null || value === undefined) {
      return `${key}: Not specified`;
    }
    
    if (Array.isArray(value)) {
      return `${key}: ${value.join(', ')}`;
    }
    
    if (typeof value === 'boolean') {
      return `${key}: ${value ? 'Yes' : 'No'}`;
    }
    
    return `${key}: ${value}`;
  });
  
  return formattedAnswers.join('\n');
}