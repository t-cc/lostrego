import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Hono } from 'hono';

import { apiRoutes } from './routes';

admin.initializeApp();

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

// Firebase Functions adapter for Hono
export const api = functions.https.onRequest(async (req, res) => {
  try {
    // Convert Firebase request to Web API Request for Hono
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
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

    // Convert Hono response to Firebase response
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
});
