import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { menuItems } from '@/config/menu';
import { contentService } from '@/lib/content';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { ContentItem } from '@/types/content';
import type { Model } from '@/types/model';
import { useNavigate, useParams } from 'react-router-dom';

import { ContentForm } from '../common/ContentForm';
import { ContentLayout } from '../common/ContentLayout';

interface EditContentProps {
  user: User;
}

export function EditContent({ user }: EditContentProps) {
  const { modelId, contentId } = useParams<{
    modelId: string;
    contentId: string;
  }>();
  const navigate = useNavigate();
  const [models, setModels] = useState<Model[]>([]);
  const [contentItem, setContentItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModelsAndContent();
  }, []);

  const loadModelsAndContent = async () => {
    try {
      const [modelsData, item] = await Promise.all([
        modelService.getAll(),
        contentService.getById(contentId!),
      ]);
      setModels(modelsData);
      setContentItem(item);
    } catch (error) {
      console.error('Error loading models or content:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedModel = models.find((m) => m.id === modelId) || null;

  const handleSubmit = async (
    data: Record<string, string | boolean | string[] | undefined>
  ) => {
    if (!contentItem) return;

    try {
      await contentService.update(contentItem.id!, { data });
      navigate(`/content/${modelId}`);
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  const handleCancel = () => {
    if (modelId) navigate(`/content/${modelId}`);
  };

  const handleDelete = async () => {
    if (!contentItem) return;

    if (!confirm('Are you sure you want to delete this content item?')) return;

    try {
      await contentService.delete(contentItem.id!);
      navigate(`/content/${modelId}`);
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const breadcrumbs = [
    { label: 'Content', href: '/content' },
    ...(selectedModel
      ? [{ label: selectedModel.name, href: `/content/${selectedModel.id}` }]
      : []),
    { label: 'Edit Content' },
  ];

  return (
    <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
      <ContentLayout models={models}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : !selectedModel || !contentItem ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Content not found</p>
          </div>
        ) : (
          <ContentForm
            model={selectedModel}
            user={user}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onDelete={handleDelete}
            initialData={contentItem}
          />
        )}
      </ContentLayout>
    </Layout>
  );
}
