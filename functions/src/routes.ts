import { Hono } from 'hono';

import {
  ContentItem,
  getContentByModelId,
  getContentByModelIdCursor,
  getContentItemById,
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
    const cursor = c.req.query('cursor');

    // Validate and parse parameters
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

    // Precompute field mapping for efficient transformation
    const fieldMapping = new Map<string, string>();
    if (model.fields) {
      model.fields.forEach((field) => {
        if (field.id) {
          fieldMapping.set(field.id, field.appId);
        }
      });
    }

    let paginatedResult;

    // Use cursor-based pagination when available for better performance
    if (cursor) {
      paginatedResult = await getContentByModelIdCursor(
        model.id,
        cursor,
        pageSize
      );
    } else {
      paginatedResult = await getContentByModelId(model.id, page, pageSize);
    }

    const { items, hasNext, nextCursor, totalItems } = paginatedResult;

    // Optimized data transformation using precomputed mapping
    const transformedContent = items.map((item: ContentItem) => {
      if (fieldMapping.size === 0) {
        return item;
      }

      const transformedData: Record<
        string,
        string | boolean | string[] | undefined
      > = {};
      const originalData = item.data || {};

      // Only iterate over existing data keys, not all model fields
      Object.keys(originalData).forEach((fieldId) => {
        const appId = fieldMapping.get(fieldId);
        if (appId && originalData[fieldId] !== undefined) {
          transformedData[appId] = originalData[fieldId];
        }
      });

      return {
        ...item,
        data: transformedData,
      };
    });

    return c.json({
      items: transformedContent,
      page: cursor ? undefined : page, // Don't include page for cursor-based
      pageSize,
      hasNext,
      nextCursor: hasNext ? nextCursor : undefined,
      totalItems,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

// GET /api/:siteAppId/content/:modelId/:contentId - Get specific content item by ID
app.get('/:siteAppId/content/:modelId/:contentId', async (c) => {
  try {
    const siteAppId = c.req.param('siteAppId');
    const modelAppId = c.req.param('modelId');
    const contentId = c.req.param('contentId');

    if (!siteAppId || !modelAppId || !contentId) {
      return c.json(
        { error: 'Site appId, Model appId, and Content ID are required' },
        400
      );
    }

    // Find model by appId and siteAppId to validate the model exists in this site
    const model = await getModelByAppId(modelAppId, siteAppId);
    if (!model) {
      return c.json({ error: 'Model not found in this site' }, 404);
    }

    // Get the content item by ID
    const contentItem = await getContentItemById(contentId);
    if (!contentItem) {
      return c.json({ error: 'Content item not found' }, 404);
    }

    // Verify that the content item belongs to the correct model
    if (contentItem.modelId !== model.id) {
      return c.json(
        { error: 'Content item does not belong to this model' },
        404
      );
    }

    // Precompute field mapping for efficient transformation
    const fieldMapping = new Map<string, string>();
    if (model.fields) {
      model.fields.forEach((field) => {
        if (field.id) {
          fieldMapping.set(field.id, field.appId);
        }
      });
    }

    // Transform field IDs to appIds if field mapping exists
    let transformedData = contentItem.data;
    if (fieldMapping.size > 0) {
      transformedData = {};
      const originalData = contentItem.data || {};

      Object.keys(originalData).forEach((fieldId) => {
        const appId = fieldMapping.get(fieldId);
        if (appId && originalData[fieldId] !== undefined) {
          transformedData[appId] = originalData[fieldId];
        }
      });
    }

    return c.json({
      ...contentItem,
      data: transformedData,
    });
  } catch (error) {
    console.error('Error fetching content item:', error);
    return c.json({ error: 'Failed to fetch content item' }, 500);
  }
});

export { app as apiRoutes };
