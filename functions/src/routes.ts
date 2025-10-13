import { Hono } from 'hono';

import {
  ContentItem,
  getContentByModelId,
  getModelByAppId,
  getModels,
} from './services/contentService';

const app = new Hono();

// GET /api/:siteId/models - Get all models for a specific site
app.get('/:siteAppId/models', async (c) => {
  try {
    const siteAppId = c.req.param('siteAppId');
    if (!siteAppId) {
      return c.json({ error: 'Site appId is required' }, 400);
    }

    const models = await getModels(siteAppId);
    return c.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: error.message }, 404);
    }
    return c.json({ error: 'Failed to fetch models' }, 500);
  }
});

// GET /api/:siteAppId/content/:modelId - Get all content for a specific model in a site (paginated)
app.get('/:siteAppId/content/:modelId', async (c) => {
  try {
    const siteAppId = c.req.param('siteAppId');
    const modelAppId = c.req.param('modelId');
    const pageRaw = c.req.query('page');
    const pageSizeRaw = c.req.query('pageSize');
    const page = pageRaw ? Math.max(1, Math.floor(Number(pageRaw))) : 1;
    const pageSize = pageSizeRaw
      ? Math.max(1, Math.min(100, Math.floor(Number(pageSizeRaw))))
      : 20;

    if (!siteAppId || !modelAppId) {
      return c.json({ error: 'Site appId and Model appId are required' }, 400);
    }

    // Find model by appId and siteAppId
    const model = await getModelByAppId(modelAppId, siteAppId);
    if (!model) {
      return c.json({ error: 'Model not found in this site' }, 404);
    }

    if (!model.id) {
      return c.json({ error: 'Model document ID is missing' }, 500);
    }

    // Get paginated content by model document id
    const { items, hasNext } = await getContentByModelId(
      model.id,
      page,
      pageSize
    );

    // Transform content data: map field.id keys to field.appId keys
    const transformedContent = items.map((item: ContentItem) => {
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

    return c.json({
      items: transformedContent,
      page,
      pageSize,
      hasNext,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

export { app as apiRoutes };
