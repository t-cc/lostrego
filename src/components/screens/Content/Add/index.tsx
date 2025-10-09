import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { menuItems } from '@/config/menu';
import { contentService } from '@/lib/content';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { Model } from '@/types/model';
import { useNavigate, useParams } from 'react-router-dom';

import { ContentForm } from '../common/ContentForm';

interface AddContentProps {
  user: User;
}

export function AddContent({ user }: AddContentProps) {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);

  const loadModel = async () => {
    try {
      const models = await modelService.getAll();
      const m = models.find((m) => m.id === modelId);
      setModel(m || null);
    } catch (error) {
      console.error('Error loading model:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modelId) {
      loadModel();
    }
  }, [modelId]);

  const handleSubmit = async (
    data: Record<string, string | boolean | string[] | undefined>
  ) => {
    if (!model) return;

    try {
      await contentService.create({ modelId: model.id!, data });
      navigate(`/content/${model.id}`);
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  const handleCancel = () => {
    if (model) navigate(`/content/${model.id}`);
  };

  if (loading) {
    return (
      <Layout menuItems={menuItems} user={user}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (!model) {
    return (
      <Layout menuItems={menuItems} user={user}>
        <div className="text-center py-8">
          <p className="text-gray-500">Model not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout menuItems={menuItems} user={user}>
      <ContentForm
        model={model}
        user={user}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        noDialog={true}
      />
    </Layout>
  );
}
