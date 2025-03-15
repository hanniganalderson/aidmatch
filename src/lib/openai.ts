// src/lib/openai.ts
import type { Scholarship, UserProfile, ScoredScholarship } from '../types';
import { supabase } from './supabase';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini'; // Make sure to use the correct model name

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Cache for OpenAI explanations
class ExplanationCache {
  private cache = new Map<string, string>();

  // Create a cache key from scholarship and user profile
  private createCacheKey(scholarshipId: string, userProfileId: string): string {
    return `${scholarshipId}|${userProfileId}`;
  }

  // Get cached explanation if available
  get(scholarshipId: string, userProfileId: string): string | null {
    const key = this.createCacheKey(scholarshipId, userProfileId);
    return this.cache.get(key) || null;
  }

  // Store explanation in cache
  set(scholarshipId: string, userProfileId: string, explanation: string): void {
    const key = this.createCacheKey(scholarshipId, userProfileId);
    this.cache.set(key, explanation);
  }
}

// Create cache instance
const explanationCache = new ExplanationCache();

/**
 * Get the OpenAI API key from environment or database
 */
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

/**
 * Generate an explanation for why a scholarship is a good match for a user
 */
export async function getScholarshipExplanation(
  scholarship: ScoredScholarship, 
  userProfile: UserProfile
): Promise<string> {
  try {
    console.log('Getting explanation for scholarship:', scholarship.id);
    
    // Check cache first
    const userId = userProfile.user_id || 'anonymous';
    const cachedExplanation = explanationCache.get(scholarship.id, userId);
    
    if (cachedExplanation) {
      console.log('Using cached explanation for scholarship:', scholarship.id);
      return cachedExplanation;
    }
    
    // Get API key
    const apiKey = await getOpenAIKey();

    // Construct educational level category
    let educationCategory = "college";
    if (userProfile.education_level.toLowerCase().includes('high school')) {
      educationCategory = "high school";
    } else if (userProfile.education_level.toLowerCase().includes('graduate') || 
               userProfile.education_level.toLowerCase().includes('phd')) {
      educationCategory = "graduate";
    }

    // Format scholarship's education levels for display
    const scholarshipEducationLevels = Array.isArray(scholarship.education_level) 
      ? scholarship.education_level.join(', ') 
      : (scholarship.education_level || 'Any');

    // Fix the scholarship.amount null check
    const amountText = scholarship.amount != null 
      ? `$${scholarship.amount.toLocaleString()}` 
      : 'Amount not specified';

    // Fix other null checks similarly
    const formattedAmount = scholarship.amount != null 
      ? `$${scholarship.amount.toLocaleString()}` 
      : 'Amount not specified';

    // Create prompt with detailed information
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are an expert scholarship advisor helping students understand why specific scholarships are good matches for them. 
        Be encouraging, specific, and concise. Focus on how the student's qualifications match the scholarship requirements and what makes them competitive.
        Format your response in 2-3 short paragraphs with a friendly, supportive tone.`
      },
      {
        role: 'user',
        content: `
          Scholarship Match Analysis (Match Score: ${scholarship.score}%)
          
          Scholarship Details:
          - Name: ${scholarship.name}
          - Provider: ${scholarship.provider}
          - Amount: ${amountText}
          - GPA Requirement: ${scholarship.gpa_requirement || 'None specified'}
          - Major Field: ${scholarship.major || 'Open to all majors'}
          - Education Level: ${scholarshipEducationLevels}
          - Competition Level: ${scholarship.competition_level}
          - Deadline: ${scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'Rolling/Not specified'}
          - Requirements: ${scholarship.requirements || 'No specific requirements listed'}
          
          Student Profile:
          - Education Level: ${userProfile.education_level} (${educationCategory} student)
          - Major: ${userProfile.major}
          - GPA: ${userProfile.gpa}
          - Location: ${userProfile.location}
          
          Explain in 2-3 concise paragraphs:
          1. Why this scholarship is a strong match for this student
          2. What specific advantages/qualifications make the student competitive
          3. A brief tip for applying successfully
          
          Be encouraging but realistic about their chances. Keep the explanation under 200 words.
        `
      }
    ];

    console.log('Making OpenAI API call...');
    // Make API call
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
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    console.log('OpenAI API response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected response format from OpenAI:', data);
      throw new Error('Invalid response format from OpenAI API');
    }
    
    const explanation = data.choices[0].message.content.trim();
    console.log('Generated explanation length:', explanation.length);
    
    // Cache the result
    explanationCache.set(scholarship.id, userId, explanation);
    
    return explanation;
  } catch (error) {
    console.error('Error getting scholarship explanation:', error);
    // Provide a fallback explanation instead of failing
    return `This ${scholarship.name} scholarship looks like a strong match for your profile! The ${formattedAmount} award aligns well with your academic background in ${userProfile.major} and your current education level (${userProfile.education_level}). With your GPA of ${userProfile.gpa}, you meet or exceed their requirements, and your location in ${userProfile.location} may give you an additional advantage.`;
  }
}