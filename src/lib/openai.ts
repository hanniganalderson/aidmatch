import { supabase } from './supabase';

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
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('openai_key')
      .single();

    if (error) {
      throw new Error('Failed to fetch API key');
    }

    if (!data?.openai_key) {
      throw new Error('OpenAI API key not found');
    }

    return data.openai_key;
  } catch (error) {
    console.error('Error fetching OpenAI key:', error);
    throw new Error('OpenAI integration is not configured');
  }
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
      throw new Error(errorData.error?.message || 'Failed to call OpenAI API');
    }

    const responseData: OpenAIResponse = await response.json();
    return responseData.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

export async function getScholarshipExplanation(scholarship: any, userProfile: any): Promise<string> {
  try {
    const prompt = `
      Provide a detailed analysis of this scholarship match and explain why it's an excellent opportunity for the student.
      Focus on specific qualifications, competitive advantages, and strategic insights.
      
      Scholarship Details:
      - Name: ${scholarship.name}
      - Amount: $${scholarship.amount}
      - GPA Requirement: ${scholarship.gpa_requirement || 'None'}
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
      1. Academic Alignment: How well do their academic credentials match?
      2. Competitive Edge: What unique advantages does this student have?
      3. Strategic Insights: Tips for strengthening their application
      4. Success Probability: Rate their chances (High/Medium/Low) with explanation
      
      Format: Provide a structured analysis with clear sections and actionable insights.
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
    throw new Error('Unable to generate explanation. Please try again later.');
  }
}

export async function getEssayOutline(scholarship: any): Promise<string> {
  try {
    const prompt = `
      Create a brief essay outline for this scholarship application.
      Focus on key points that would make a compelling case.
      Keep it concise and actionable.
      
      Scholarship: ${scholarship.name}
      Requirements: ${scholarship.requirements || 'Standard scholarship essay'}
      
      Format the response as:
      1. Suggested thesis statement
      2. Three main supporting points
      3. Conclusion strategy
      
      Keep each section brief but specific.
    `;

    return callOpenAI([
      {
        role: 'system',
        content: 'You are an expert essay advisor. Provide clear, structured outlines that help students write compelling scholarship essays.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
  } catch (error) {
    throw new Error('Unable to generate essay outline. Please try again later.');
  }
}