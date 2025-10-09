import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { menuItems } from '@/config/menu';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { Field, Model } from '@/types/model';
import { useNavigate, useParams } from 'react-router-dom';

import { ModelForm } from '../common/ModelForm';

interface EditModelProps {
  user: User;
}

export default function EditModel({ user }: EditModelProps) {
  const { id } = useParams<{ id: string }>();
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchModel(id);
    }
  }, [id]);

  const fetchModel = async (modelId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await modelService.getById(modelId);
      setModel(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (modelData: {
    name: string;
    description: string;
    fields: Field[];
  }) => {
    if (!model) return;

    try {
      setSaving(true);
      await modelService.update(model.id!, modelData);
      navigate('/models');
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
    return (
      <Layout menuItems={menuItems} user={user}>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (error || !model) {
    return (
      <Layout menuItems={menuItems} user={user}>
        <div className="text-center py-12">
          <p className="text-red-600">{error || 'Model not found'}</p>
          <Button onClick={() => navigate('/models')} className="mt-4">
            Back to Models
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout menuItems={menuItems} user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Model</h1>
            <p className="text-gray-600">Modify the selected model.</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="destructive" onClick={handleDelete}>
              Delete Model
            </Button>
            <Button variant="outline" onClick={() => navigate('/models')}>
              Cancel
            </Button>
          </div>
        </div>

        <ModelForm
          model={model}
          onSave={handleSave}
          onCancel={() => navigate('/models')}
          isSaving={saving}
        />
      </div>
    </Layout>
  );
}
