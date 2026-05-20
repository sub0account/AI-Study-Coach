/**
 * OpenAI Integration Utility
 * Uses a backend proxy to avoid CORS issues and keep API key secure
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

/**
 * Get the API endpoint
 * Uses relative path for client-side, or environment variable for server
 */
function getApiEndpoint(): string {
  // In browser: use relative path (Next.js will route to /api/openai-proxy)
  if (typeof window !== 'undefined') {
    return '/api/openai-proxy';
  }
  // On server: use full URL if needed
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/openai-proxy`;
}

/**
 * Generate text using OpenAI API via secure backend proxy
 */
export async function generateTextWithOpenAI(
  options: AIGenerationOptions
): Promise<AIGenerationResult> {
  const { prompt, maxTokens = 800, temperature = 0.7 } = options;

  console.log('🚀 AI Generation Request (OpenAI)');
  console.log('Prompt length:', prompt.length);

  try {
    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    if (prompt.length > 5000) {
      throw new Error('Prompt is too long (max 5000 characters)');
    }

    console.log('📝 Calling OpenAI API via proxy...');

    const endpoint = getApiEndpoint();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.text) {
      throw new Error(data.error || 'No response received from OpenAI API');
    }

    console.log('✅ Successfully generated response');

    return {
      success: true,
      text: data.text,
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
