import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { menuItems } from '@/config/menu';
import { contentService } from '@/lib/content';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { ContentItem } from '@/types/content';
import type { Model } from '@/types/model';

import { ContentForm } from './ContentForm';
import { ContentList } from './ContentList';
import { ModelsSidebar } from './ModelsSidebar';

interface ContentProps {
  user: User;
}

function Content({ user }: ContentProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      loadContentItems(selectedModel.id!);
    } else {
      setContentItems([]);
    }
  }, [selectedModel]);

  const loadModels = async () => {
    try {
      const modelsData = await modelService.getAll();
      setModels(modelsData);
      if (modelsData.length > 0 && !selectedModel) {
        setSelectedModel(modelsData[0]);
      }
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContentItems = async (modelId: string) => {
    try {
      const items = await contentService.getByModelId(modelId);
      setContentItems(items);
    } catch (error) {
      console.error('Error loading content items:', error);
    }
  };

  const handleCreate = async (
    data: Record<string, string | boolean | string[] | undefined>
  ) => {
    if (!selectedModel) return;

    try {
      await contentService.create({
        modelId: selectedModel.id!,
        data,
      });
      setShowForm(false);
      await loadContentItems(selectedModel.id!);
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  const handleUpdate = async (
    data: Record<string, string | boolean | string[] | undefined>
  ) => {
    if (!editingItem) return;

    try {
      await contentService.update(editingItem.id!, { data });
      setShowForm(false);
      setEditingItem(null);
      if (selectedModel) {
        await loadContentItems(selectedModel.id!);
      }
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) return;

    try {
      await contentService.delete(itemId);
      if (selectedModel) {
        await loadContentItems(selectedModel.id!);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSubmit = (
    data: Record<string, string | boolean | string[] | undefined>
  ) => {
    if (editingItem) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  const handleDeleteFromList = (itemId: string) => {
    handleDelete(itemId);
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

  return (
    <>
      {selectedModel && (
        <ContentForm
          model={selectedModel}
          user={user}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingItem || undefined}
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditingItem(null);
          }}
        />
      )}
      <Layout menuItems={menuItems} user={user}>
        <div className="flex h-full">
          <ModelsSidebar
            models={models}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
          <div className="flex-1 p-6">
            <ContentList
              selectedModel={selectedModel}
              contentItems={contentItems}
              onAddNew={handleAddNew}
              onEdit={handleEdit}
              onDelete={handleDeleteFromList}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}

export default Content;
