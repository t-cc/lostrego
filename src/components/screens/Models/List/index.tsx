import { useCallback, useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { menuItems } from '@/config/menu';
import { useSite } from '@/context/SiteContext';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { Model } from '@/types/model';

import { ModelsLayout } from '../common/ModelsLayout';

interface ModelsProps {
  user: User;
}

export function ListModels({ user }: ModelsProps) {
  const { currentSite } = useSite();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModels = useCallback(async () => {
    if (!currentSite?.id) {
      setModels([]);
      setLoading(false);
      return;
    }

    try {
      const data = await modelService.getBySite(currentSite.id);
      setModels(data);
    } catch (err) {
      console.error('Error loading models:', err);
    } finally {
      setLoading(false);
    }
  }, [currentSite?.id]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const breadcrumbs = [{ label: 'Models' }];

  if (loading) {
    return (
      <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
      <ModelsLayout models={models}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Models</h2>
            <p className="text-gray-600">
              Select a model from the sidebar to edit
            </p>
          </div>
        </div>
      </ModelsLayout>
    </Layout>
  );
}
