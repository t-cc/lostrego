import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { menuItems } from '@/config/menu';
import { contentService } from '@/lib/content';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { ContentItem } from '@/types/content';
import type { Model } from '@/types/model';
import { useNavigate, useParams } from 'react-router-dom';

import { ContentLayout } from '../common/ContentLayout';
import { ContentTable } from './ContentTable';

interface ContentProps {
  user: User;
}

export function ContentList({ user }: ContentProps) {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const [models, setModels] = useState<Model[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (models.length > 0 && modelId) {
      const selected = models.find((m) => m.id === modelId);
      if (!selected) {
        // sort models and go to first
        const sorted = [...models].sort((a, b) => a.name.localeCompare(b.name));
        navigate(`/content/${sorted[0].id}`, { replace: true });
      } else {
        loadContent(selected.id!);
      }
    } else if (models.length > 0 && !modelId) {
      const sorted = [...models].sort((a, b) => a.name.localeCompare(b.name));
      navigate(`/content/${sorted[0].id}`, { replace: true });
    }
  }, [models, modelId, navigate]);

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

  const loadContent = async (modelId: string) => {
    try {
      const items = await contentService.getByModelId(modelId);
      setContentItems(items);
    } catch (error) {
      console.error('Error loading content items:', error);
    }
  };

  const handleAddNew = () => {
    if (modelId) navigate(`/content/${modelId}/add`);
  };

  const handleEdit = (item: ContentItem) => {
    if (modelId) navigate(`/content/${modelId}/${item.id}`);
  };

  const selectedModel = models.find((m) => m.id === modelId) || null;

  if (loading) {
    const breadcrumbs = [{ label: 'Content' }, { label: '...' }];
    return (
      <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  const breadcrumbs = selectedModel
    ? [{ label: 'Content', href: '/content' }, { label: selectedModel.name }]
    : [{ label: 'Content' }];

  return (
    <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
      <ContentLayout models={models}>
        <ContentTable
          selectedModel={selectedModel}
          contentItems={contentItems}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
        />
      </ContentLayout>
    </Layout>
  );
}
