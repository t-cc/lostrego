import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { menuItems } from '@/config/menu';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { Field, Model } from '@/types/model';
import { Plus } from 'lucide-react';

import { ModelForm } from './ModelForm';
import { ModelList } from './ModelList';

interface ModelsProps {
  user: User;
}

export default function Models({ user }: ModelsProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [saving, setSaving] = useState(false);

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
    setEditingModel(null);
    setShowForm(true);
  };

  const handleEdit = (model: Model) => {
    setEditingModel(model);
    setShowForm(true);
  };

  const handleSave = async (modelData: {
    name: string;
    description: string;
    fields: Field[];
  }) => {
    try {
      setSaving(true);

      if (editingModel) {
        await modelService.update(editingModel.id!, modelData);
      } else {
        await modelService.create(modelData);
      }

      setShowForm(false);
      setEditingModel(null);
      fetchModels();
    } catch (err) {
      console.error('Error saving model:', err);
      setError('Error saving model');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the model "${name}"?`)) {
      try {
        await modelService.delete(id);
        fetchModels();
      } catch (err) {
        console.error('Error deleting model:', err);
        setError('Error deleting model');
      }
    }
  };

  return (
    <Layout menuItems={menuItems} user={user}>
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

        {showForm && (
          <ModelForm
            model={editingModel}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingModel(null);
            }}
            isSaving={saving}
          />
        )}

        <ModelList
          models={models}
          loading={loading}
          error={error}
          onEditModel={handleEdit}
          onDeleteModel={handleDelete}
          onRetry={fetchModels}
        />
      </div>
    </Layout>
  );
}
