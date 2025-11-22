import { Handler } from '@netlify/functions';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../server/routers';
import { createContext } from '../../server/_core/context';

export const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req: new Request(event.rawUrl, {
        method: event.httpMethod,
        headers: event.headers as HeadersInit,
        body: event.body || undefined,
      }),
      router: appRouter,
      createContext: async () => {
        // Create request/response objects for context
        const req = {
          headers: event.headers || {},
          cookies: event.headers?.cookie || '',
        } as any;
        
        const res = {
          setHeader: () => {},
          cookie: () => {},
          clearCookie: () => {},
        } as any;

        return createContext({ req, res });
      },
    });

    const responseBody = await response.text();

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
      body: responseBody,
    };
  } catch (error) {
    console.error('tRPC handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
