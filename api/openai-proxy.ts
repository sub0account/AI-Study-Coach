/**
 * OpenAI API Proxy
 * This endpoint proxies requests to OpenAI to avoid CORS issues
 * and keeps the API key secure on the server
 */

import type { NextRequest } from 'next';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const config = {
  runtime: 'nodejs',
};

interface RequestBody {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export default async function handler(req: NextRequest) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { prompt, maxTokens = 800, temperature = 0.7 } = body;

    // Validate inputs
    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Prompt cannot be empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured on server' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call OpenAI API
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
      return new Response(
        JSON.stringify({
          error: errorData.error?.message || `OpenAI API error: ${response.status}`,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'No response received from OpenAI' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true, text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
