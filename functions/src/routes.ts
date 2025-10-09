import { Hono } from 'hono';

import {
  getContentByModelId,
  getModelById,
  getModels,
} from './services/contentService';

const app = new Hono();

// GET /api/models - Get all models
app.get('/models', async (c) => {
  try {
    const models = await getModels();
    return c.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    return c.json({ error: 'Failed to fetch models' }, 500);
  }
});

// GET /api/models/:modelId - Get specific model by ID
app.get('/models/:modelId', async (c) => {
  try {
    const modelId = c.req.param('modelId');
    const model = await getModelById(modelId);

    if (!model) {
      return c.json({ error: 'Model not found' }, 404);
    }

    return c.json(model);
  } catch (error) {
    console.error('Error fetching model:', error);
    return c.json({ error: 'Failed to fetch model' }, 500);
  }
});

// GET /api/content/:modelId - Get all content for a specific model
app.get('/content/:modelId', async (c) => {
  try {
    const modelId = c.req.param('modelId');
    const content = await getContentByModelId(modelId);
    return c.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

export { app as apiRoutes };
