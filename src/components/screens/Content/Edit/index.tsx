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
import { menuItems } from '@/config/menu';
import { useModels } from '@/hooks/useModels';
import { contentService } from '@/lib/content';
import type { User } from '@/types/auth';
import type { ContentItem } from '@/types/content';
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
  const { models, loading: modelsLoading } = useModels();
  const [contentItem, setContentItem] = useState<ContentItem | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadContent = useCallback(async () => {
    try {
      const item = await contentService.getById(contentId!);
      setContentItem(item);
    } catch (error) {
      console.error('Error loading content:', error);
      setContentItem(null);
    } finally {
      setContentLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const loading = modelsLoading || contentLoading;

  const selectedModel = models.find((m) => m.id === modelId) || null;

  const handleSubmit = async (
    data: Record<string, string | boolean | string[] | number | undefined>
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

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    if (!contentItem) return;
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
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Content</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this content item? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ContentLayout>
    </Layout>
  );
}
