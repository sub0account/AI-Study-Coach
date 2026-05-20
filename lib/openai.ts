/**
 * OpenAI Integration Utility
 * Handles all AI generation requests using OpenAI API
 */

export interface AIGenerationOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIGenerationResult {
  success: boolean;
  text?: string;
  error?: string;
  source: 'api' | 'error';
}

// Read the API key from environment variables
// For Expo, use EXPO_PUBLIC_ prefix to expose to client
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generate text using OpenAI API
 */
export async function generateTextWithOpenAI(
  options: AIGenerationOptions
): Promise<AIGenerationResult> {
  const { prompt, maxTokens = 800, temperature = 0.7 } = options;

  console.log('🚀 AI Generation Request (OpenAI)');
  console.log('Prompt length:', prompt.length);

  try {
    // Validate environment variables
    if (!OPENAI_API_KEY) {
      throw new Error(
        'OpenAI API key is missing. Please set the EXPO_PUBLIC_OPENAI_API_KEY environment variable in your .env.local file.'
      );
    }

    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    if (prompt.length > 5000) {
      throw new Error('Prompt is too long (max 5000 characters)');
    }

    console.log('📝 Calling OpenAI API...');

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI study coach designed to help high school students understand topics and learn effectively.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || `OpenAI API error: ${response.status}`
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error('No response received from OpenAI API');
    }

    console.log('✅ Successfully generated response');

    return {
      success: true,
      text,
      source: 'api',
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    console.error('❌ Error:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      source: 'error',
    };
  }
}

/**
 * Extract meaningful error message from various error formats
 */
function extractErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error?.message) {
    return String(error.message);
  }

  return 'Unable to process request. Please try again.';
}
