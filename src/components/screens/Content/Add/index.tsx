import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { menuItems } from '@/config/menu';
import { contentService } from '@/lib/content';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { Model } from '@/types/model';
import { useNavigate, useParams } from 'react-router-dom';

import { ContentForm } from '../common/ContentForm';
import { ContentLayout } from '../common/ContentLayout';

interface AddContentProps {
  user: User;
}

export function AddContent({ user }: AddContentProps) {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const loadModels = async () => {
    try {
      const modelsData = await modelService.getAll();
      setModels(modelsData);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const selectedModel = models.find((m) => m.id === modelId) || null;

  const handleSubmit = async (
    data: Record<string, string | boolean | string[] | number | undefined>
  ) => {
    if (!selectedModel) return;

    try {
      await contentService.create({ modelId: selectedModel.id!, data });
      navigate(`/content/${selectedModel.id}`);
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  const handleCancel = () => {
    if (selectedModel) navigate(`/content/${selectedModel.id}`);
  };

  const breadcrumbs = [
    { label: 'Content' },
    ...(selectedModel ? [selectedModel] : []).map((m) => ({
      label: m.name,
      href: `/content/${m.id}`,
    })),
    { label: 'New Content' },
  ];

  return (
    <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
      <ContentLayout models={models}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : !selectedModel ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Model not found</p>
          </div>
        ) : (
          <ContentForm
            model={selectedModel}
            user={user}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </ContentLayout>
    </Layout>
  );
}
