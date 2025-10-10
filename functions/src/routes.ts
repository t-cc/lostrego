import { Hono } from 'hono';

import {
  getContentByModelId,
  getModelByAppId,
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

// GET /api/content/:modelId - Get all content for a specific model
app.get('/content/:modelId', async (c) => {
  try {
    const modelAppId = c.req.param('modelId'); // modelId param is now modelAppId
    if (!modelAppId) {
      return c.json({ error: 'Model appId is required' }, 400);
    }

    // Find model by appId
    const model = await getModelByAppId(modelAppId);
    if (!model) {
      return c.json({ error: 'Model not found' }, 404);
    }

    if (!model.id) {
      return c.json({ error: 'Model document ID is missing' }, 500);
    }

    // Get content by model document id
    const content = await getContentByModelId(model.id);

    // Transform content data: map field.id keys to field.appId keys
    const transformedContent = content.map((item) => {
      if (!model.fields) {
        return item;
      }

      const transformedData: Record<
        string,
        string | boolean | string[] | undefined
      > = {};
      const originalData = item.data || {};

      model.fields.forEach((field) => {
        const fieldId = field.id;
        if (fieldId && originalData[fieldId] !== undefined) {
          // Map from field.id to field.appId
          transformedData[field.appId] = originalData[fieldId];
        }
      });

      return {
        ...item,
        data: transformedData,
      };
    });

    return c.json(transformedContent);
  } catch (error) {
    console.error('Error fetching content:', error);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

export { app as apiRoutes };
