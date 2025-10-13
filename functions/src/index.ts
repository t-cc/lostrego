import { onRequest } from 'firebase-functions/v2/https';
import { Hono } from 'hono';

import { apiRoutes } from './routes';

// #

// Initialize Hono app
const app = new Hono();

// Health check
app.get('/', (c) => {
  return c.json({ message: 'API is working!' });
});

// Routes
app.route('/api', apiRoutes);

// Error handling
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: 'Internal server error' }, 500);
});

// Firebase Functions v2 configuration for public access
export const api = onRequest(
  {
    region: 'us-central1',
    cors: true,
    invoker: 'public',
    memory: '256MiB',
    timeoutSeconds: 60,
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      // Convert Firebase Functions v2 request to Web API Request for Hono
      const url = `${req.protocol}://${req.hostname}${req.originalUrl}`;
      const method = req.method;
      const headers = new Headers();

      // Convert Firebase headers to Web API Headers
      Object.keys(req.headers).forEach((key) => {
        const value = req.headers[key];
        if (typeof value === 'string') {
          headers.set(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        }
      });

      // Create Web API Request
      let body: string | undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        if (req.rawBody) {
          body = req.rawBody.toString();
        } else if (req.body) {
          body = JSON.stringify(req.body);
        }
      }

      const request = new Request(url, {
        method,
        headers,
        ...(body && { body }),
      });

      // Process with Hono
      const response = await app.fetch(request);

      // Convert Hono response to Firebase Functions v2 response
      res.status(response.status);

      // Set headers
      response.headers.forEach((value, key) => {
        res.set(key, value);
      });

      // Send body
      const responseBody = await response.text();
      res.send(responseBody);
    } catch (error) {
      console.error('Function adapter error:', error);
      res.status(500).send('Internal server error');
    }
  }
);
