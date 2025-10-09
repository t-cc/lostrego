import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { menuItems } from '@/config/menu';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { Model } from '@/types/model';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ModelList } from './ModelList';

interface ModelsProps {
  user: User;
}

export function ListModels({ user }: ModelsProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await modelService.getAll();
      setModels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/models/add');
  };

  const breadcrumbs = [{ label: 'Models' }];

  return (
    <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Models</h1>
            <p className="text-gray-600">Manage system models.</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Model
          </Button>
        </div>

        <ModelList
          models={models}
          loading={loading}
          error={error}
          onRetry={fetchModels}
        />
      </div>
    </Layout>
  );
}
