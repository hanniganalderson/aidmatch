import type { Scholarship, UserProfile } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4-mini';

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
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  return apiKey;
}

export async function getScholarshipExplanation(
  scholarship: Scholarship, 
  userProfile: UserProfile
): Promise<string> {
  try {
    const apiKey = await getOpenAIKey();

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: 'You are an expert scholarship advisor helping students understand why specific scholarships are good matches for them. Be encouraging and specific about match factors.'
      },
      {
        role: 'user',
        content: `
          Analyze this scholarship match and explain why it's a good opportunity for the student.
          Focus on specific qualifications and competitive advantages.
          
          Scholarship Details:
          - Name: ${scholarship.name}
          - Amount: $${scholarship.amount}
          - GPA Requirement: ${scholarship.gpa_requirement || 'None'}
          - Major: ${scholarship.major || 'Any'}
          - Education Level: ${scholarship.education_level?.join(', ') || 'Any'}
          - Competition Level: ${scholarship.competition_level}
          - Deadline: ${scholarship.deadline || 'Rolling'}
          
          Student Profile:
          - Education Level: ${userProfile.education_level}
          - Major: ${userProfile.major}
          - GPA: ${userProfile.gpa}
          - Location: ${userProfile.location}
          
          Explain:
          1. Why this is a good match
          2. Key advantages the student has
          3. Quick tips for applying
          
          Keep the response concise and encouraging.
        `
      }
    ];

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
      throw new Error('Failed to get explanation from OpenAI');
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting scholarship explanation:', error);
    return 'Unable to generate explanation at this time. Please try again later.';
  }
}