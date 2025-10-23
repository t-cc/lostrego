import { useCallback, useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { menuItems } from '@/config/menu';
import { useModels as useModelsHook } from '@/hooks/useModels';
import { contentService } from '@/lib/content';
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
  const { models: allModels, loading: modelsLoading } = useModelsHook();
  const [model, setModel] = useState<Model | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingModel, setDeletingModel] = useState(false);
  const [hasContents, setHasContents] = useState<boolean | null>(null);

  const navigate = useNavigate();

  const loadModel = useCallback(async () => {
    if (!id) {
      setModel(null);
      setModelLoading(false);
      return;
    }

    try {
      setModelLoading(true);
      setError(null);
      const modelData = await modelService.getById(id);
      setModel(modelData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model');
    } finally {
      setModelLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  const loading = modelsLoading || modelLoading;

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

    setDeleteDialogOpen(true);

    try {
      setDeletingModel(true);
      const contents = await contentService.getByModelId(model.id!);
      setHasContents(contents.length > 0);
    } catch (err) {
      console.error('Error checking contents for deletion:', err);
      setHasContents(false); // Default to allowing deletion if check fails
    } finally {
      setDeletingModel(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    if (!model) return;
    try {
      await modelService.delete(model.id!);
      navigate('/models');
    } catch (err) {
      console.error('Error deleting model:', err);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setHasContents(null); // Reset state when dialog closes
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
      <ModelsLayout models={allModels}>
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
            isDeleting={deletingModel}
          />
        </div>

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={handleDialogOpenChange}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Model</AlertDialogTitle>
              <AlertDialogDescription>
                {hasContents === null
                  ? 'Checking for associated content...'
                  : hasContents
                    ? `Cannot delete model "${model?.name}" because it contains content. Please delete all content first.`
                    : `Are you sure you want to delete the model "${model?.name}"? This action cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={hasContents || deletingModel}
              >
                {hasContents ? 'Delete Content First' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ModelsLayout>
    </Layout>
  );
}
