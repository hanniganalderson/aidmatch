import { supabase } from './supabase';
import type { Scholarship, UserProfile } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Models
export const GPT_4_MINI = 'gpt-4-mini';
export const GPT_3_5_TURBO = 'gpt-3.5-turbo';
export const GPT_4 = 'gpt-4';

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

async function getOpenAIKey(): Promise<string> {
  // Try different possible environment variable names
  const apiKey = import.meta.env.VITE_OPENAI_API || import.meta.env.OpenAI_API;
  
  if (!apiKey) {
    console.error('OpenAI API key not found in environment variables');
    throw new Error('OpenAI API key not configured');
  }
  
  return apiKey;
}

export async function callOpenAI(
  messages: OpenAIMessage[],
  model: string = GPT_4_MINI
): Promise<string> {
  try {
    const apiKey = await getOpenAIKey();

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.6,
        frequency_penalty: 0.5
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to call OpenAI API');
    }

    const responseData: OpenAIResponse = await response.json();
    return responseData.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

export async function getScholarshipExplanation(scholarship: Scholarship, userProfile: UserProfile): Promise<string> {
  try {
    const prompt = `
      Analyze this scholarship match and explain why it's a good opportunity for the student.
      Focus on specific qualifications and competitive advantages.
      
      Scholarship Details:
      - Name: ${scholarship.name}
      - Amount: $${scholarship.amount}
      - GPA Requirement: ${scholarship.min_gpa || 'None'}
      - Major: ${scholarship.major || 'Any'}
      - Education Level: ${scholarship.education_level || 'Any'}
      - Deadline: ${scholarship.deadline || 'Not specified'}
      
      Student Profile:
      - Institution: ${userProfile.school}
      - Major: ${userProfile.major}
      - GPA: ${userProfile.gpa}
      - Education Level: ${userProfile.education_level}
      - Location: ${userProfile.location}
      
      Please analyze:
      1. Academic Match: How well do their academic credentials align?
      2. Competitive Edge: What unique advantages does this student have?
      3. Strategic Tips: How can they strengthen their application?
      
      Format the response in clear, concise paragraphs.
    `;

    return callOpenAI([
      {
        role: 'system',
        content: 'You are a helpful scholarship advisor. Be encouraging and specific about why this is a good match.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
  } catch (error) {
    console.error('Error generating explanation:', error);
    throw new Error('Unable to generate explanation. Please try again later.');
  }
}

export async function getEssayOutline(scholarship: Scholarship): Promise<string> {
  try {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful writing assistant that creates essay outlines for scholarship applications.'
      },
      {
        role: 'user',
        content: `Create a detailed essay outline for the following scholarship: ${scholarship.name} by ${scholarship.provider}. Consider any specific requirements or themes mentioned in the description: ${scholarship.description}`
      }
    ];

    return callOpenAI(messages, GPT_4);
  } catch (error) {
    console.error('Error generating essay outline:', error);
    throw new Error('Unable to generate essay outline. Please try again later.');
  }
}