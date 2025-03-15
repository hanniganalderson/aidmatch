import { OpenAI } from 'openai';
import { UserAnswers, ScoredScholarship } from '../types';
import { getOpenAIKey } from './api-keys';

// Define the AI models for different tiers
export enum AIModel {
  FREE = 'gpt-3.5-turbo',
  PLUS = 'gpt-4'
}

// Define the AI service types
export enum AIServiceType {
  SCHOLARSHIP_MATCHING = 'scholarship_matching',
  ESSAY_ASSISTANCE = 'essay_assistance',
  APPLICATION_TIPS = 'application_tips',
  FINANCIAL_ADVICE = 'financial_advice'
}

// Initialize OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai) {
    const apiKey = getOpenAIKey();
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

/**
 * Get the appropriate AI model based on subscription status
 */
export function getAIModel(isSubscribed: boolean): string {
  return isSubscribed ? AIModel.PLUS : AIModel.FREE;
}

/**
 * Get system prompt for scholarship matching based on tier
 */
export function getScholarshipMatchingPrompt(isSubscribed: boolean): string {
  if (isSubscribed) {
    return `You are an expert scholarship advisor with extensive knowledge of scholarships, grants, and financial aid opportunities for students. Your goal is to help students find the most relevant scholarships based on their profile.
    
    Provide detailed, personalized scholarship recommendations with clear explanations of why each scholarship is a good match. Include information about eligibility requirements, application deadlines, and award amounts.
    
    Format your response in JSON array format with the following structure for each scholarship:
    [
      {
        "name": "Scholarship Name",
        "provider": "Organization Name",
        "amount": 5000,
        "deadline": "2023-12-31",
        "requirements": "Detailed eligibility requirements",
        "description": "Brief description of the scholarship",
        "competition_level": "Low/Medium/High",
        "major": "Relevant field of study or 'Any'",
        "gpa_requirement": 3.5,
        "education_level": ["Undergraduate", "Graduate"],
        "essay_required": true/false,
        "is_need_based": true/false,
        "is_merit_based": true/false
      },
      ...
    ]`;
  } else {
    return `You are a scholarship advisor helping students find relevant scholarships. Provide scholarship recommendations based on the student's profile.
    
    Format your response in JSON array format with the following structure for each scholarship:
    [
      {
        "name": "Scholarship Name",
        "provider": "Organization Name",
        "amount": 5000,
        "deadline": "2023-12-31",
        "requirements": "Eligibility requirements",
        "description": "Brief description",
        "competition_level": "Low/Medium/High",
        "major": "Field of study or 'Any'",
        "education_level": ["Undergraduate"]
      },
      ...
    ]`;
  }
}

/**
 * Get system prompt for essay assistance based on tier
 */
export function getEssayAssistancePrompt(isSubscribed: boolean, scholarship?: Partial<ScoredScholarship>): string {
  if (isSubscribed) {
    return `You are an expert essay coach with experience helping students craft compelling scholarship essays. Your goal is to provide detailed, personalized guidance to help students write essays that stand out.
    
    Format your response in markdown with clear sections and helpful formatting.`;
  } else {
    return `You are an essay coach helping students with scholarship essays. Provide guidance on how to approach the essay.
    
    Format your response in markdown with clear sections.`;
  }
}

/**
 * Get user message for scholarship matching
 */
export function getScholarshipMatchingUserMessage(userAnswers: UserAnswers, isSubscribed: boolean): string {
  if (isSubscribed) {
    return `I'm looking for scholarships that match my profile:
    
    Education Level: ${userAnswers.education_level || 'Not specified'}
    Major: ${userAnswers.major || 'Not specified'}
    GPA: ${userAnswers.gpa || 'Not specified'}
    School: ${userAnswers.school || 'Not specified'}
    Location: ${userAnswers.location || 'Not specified'}
    Pell Grant Eligible: ${userAnswers.is_pell_eligible === 'true' ? 'Yes' : 'No'}
    
    ${userAnswers.extracurricular_activities?.length ? 
      `My extracurricular activities include: ${Array.isArray(userAnswers.extracurricular_activities) ? userAnswers.extracurricular_activities.join(', ') : userAnswers.extracurricular_activities}.` : ''}
    
    Please provide detailed scholarship recommendations that match my profile, including eligibility requirements, deadlines, and why each is a good match for me.`;
  } else {
    return `Find scholarships for a student in ${userAnswers.state || 'any state'} 
    studying ${userAnswers.major || 'any field'} 
    with a GPA of ${userAnswers.gpa || '3.5'}.
    ${userAnswers.school ? `They attend ${userAnswers.school}.` : ''}
    ${Array.isArray(userAnswers.extracurricular_activities) && userAnswers.extracurricular_activities.length ? 
      `Their extracurricular activities include: ${userAnswers.extracurricular_activities.join(', ')}.` : ''}`;
  }
}

/**
 * Get user message for essay assistance
 */
export function getEssayAssistanceUserMessage(
  essayRequirements: string,
  prompt: string,
  scholarship?: Partial<ScoredScholarship>,
  isSubscribed: boolean = false
): string {
  const requirements = essayRequirements || 'No specific requirements provided';
  
  if (isSubscribed && scholarship) {
    return `Scholarship: ${scholarship.name}
    Organization: ${scholarship.provider || 'Unknown organization'}
    Essay Requirements: ${requirements}
    What I need help with: ${prompt}`;
  } else {
    return `Essay Requirements: ${requirements}
    What I need help with: ${prompt}`;
  }
}

/**
 * Make an AI request with the appropriate tier
 */
export async function makeAIRequest(
  serviceType: AIServiceType,
  isSubscribed: boolean,
  userMessage: string
): Promise<string> {
  try {
    const client = getOpenAIClient();
    const model = isSubscribed ? AIModel.PLUS : AIModel.FREE;
    
    console.log(`Making ${serviceType} request with model: ${model}`);
    
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(serviceType, isSubscribed)
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: isSubscribed ? 2000 : 1000
    });
    
    return response.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('Error making AI request:', error);
    throw new Error('Failed to get AI response');
  }
}

/**
 * Get the system prompt for the AI based on service type and subscription
 */
function getSystemPrompt(serviceType: AIServiceType, isSubscribed: boolean): string {
  if (serviceType === AIServiceType.SCHOLARSHIP_MATCHING) {
    return getScholarshipMatchingPrompt(isSubscribed);
  } else if (serviceType === AIServiceType.ESSAY_ASSISTANCE) {
    return getEssayAssistancePrompt(isSubscribed);
  } else {
    return isSubscribed
      ? `You are an expert advisor on scholarship applications and financial aid. Provide detailed, personalized advice based on the student's situation.`
      : `You are an advisor on scholarship applications. Provide general advice to help the student.`;
  }
}

// Fix the type issues with formatUserAnswersForPrompt
export function formatUserAnswersForPrompt(userAnswers: UserAnswers): string {
  const formattedAnswers = Object.entries(userAnswers).map(([key, value]) => {
    if (value === null || value === undefined) {
      return `${key}: Not specified`;
    }
    
    if (Array.isArray(value)) {
      return `${key}: ${value.join(', ')}`;
    }
    
    if (typeof value === 'string') {
      return `${key}: ${value}`;
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
      return `${key}: ${String(value)}`;
    }
    
    return `${key}: ${String(value)}`;
  });
  
  return formattedAnswers.join('\n');
} 