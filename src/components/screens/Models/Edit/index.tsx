import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { menuItems } from '@/config/menu';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { Field, Model } from '@/types/model';
import { useNavigate, useParams } from 'react-router-dom';

import { ModelForm } from '../common/ModelForm';
import { ModelsLayout } from '../common/ModelsLayout';

interface EditModelProps {
  user: User;
}

export function EditModel({ user }: EditModelProps) {
  const { id } = useParams<{ id: string }>();
  const [model, setModel] = useState<Model | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [modelsData, modelData] = await Promise.all([
        modelService.getAll(),
        id ? modelService.getById(id) : Promise.resolve(null),
      ]);
      setModels(modelsData);
      setModel(modelData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (modelData: {
    name: string;
    description: string;
    appId: string;
    fields: Field[];
  }) => {
    if (!model) return;

    try {
      setSaving(true);
      await modelService.update(model.id!, modelData);
      // Stay on the same page instead of navigating away
    } catch (err) {
      console.error('Error updating model:', err);
      alert('Error updating model');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!model) return;

    if (
      confirm(
        `Are you sure you want to delete the model "${model.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await modelService.delete(model.id!);
        navigate('/models');
      } catch (err) {
        console.error('Error deleting model:', err);
        alert('Error deleting model');
      }
    }
  };

  if (loading) {
    const breadcrumbs = [
      { label: 'Models', href: '/models' },
      { label: 'Edit Model' },
    ];
    return (
      <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (error || !model) {
    const breadcrumbs = [
      { label: 'Models', href: '/models' },
      { label: 'Edit Model' },
    ];
    return (
      <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <p className="text-red-600">{error || 'Model not found'}</p>
          <Button onClick={() => navigate('/models')} className="mt-4">
            Back to Models
          </Button>
        </div>
      </Layout>
    );
  }

  const breadcrumbs = [
    { label: 'Models', href: '/models' },
    { label: model.name },
  ];

  return (
    <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
      <ModelsLayout models={models}>
        <div className="space-y-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit {model?.name}
            </h1>
            <p className="text-gray-600">Modify the selected model.</p>
          </div>

          <ModelForm
            model={model}
            onSave={handleSave}
            onCancel={() => navigate('/models')}
            onDelete={handleDelete}
            isSaving={saving}
          />
        </div>
      </ModelsLayout>
    </Layout>
  );
}
