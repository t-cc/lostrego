import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { menuItems } from '@/config/menu';
import { contentService } from '@/lib/content';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { ContentItem } from '@/types/content';
import type { Field, Model } from '@/types/model';

interface ContentProps {
  user: User;
}

// Content field input components
function TextField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{field.name}</label>
      {field.description && (
        <p className="text-xs text-gray-500 mb-1">{field.description}</p>
      )}
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function BooleanField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="mb-4">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="text-sm font-medium">{field.name}</span>
      </label>
      {field.description && (
        <p className="text-xs text-gray-500 mt-1">{field.description}</p>
      )}
    </div>
  );
}

function MarkdownField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{field.name}</label>
      {field.description && (
        <p className="text-xs text-gray-500 mb-1">{field.description}</p>
      )}
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter markdown content..."
      />
    </div>
  );
}

function MediaField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value?: string[];
  onChange: (value: string[]) => void;
}) {
  // TODO: Implement media picker - for now just a simple text input for URLs
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{field.name}</label>
      {field.description && (
        <p className="text-xs text-gray-500 mb-1">{field.description}</p>
      )}
      <input
        type="url"
        placeholder="Media URL"
        value={(value && value[0]) || ''}
        onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
        required={field.required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function ContentForm({
  model,
  onSubmit,
  onCancel,
  initialData,
}: {
  model: Model;
  onSubmit: (
    data: Record<string, string | boolean | string[] | undefined>
  ) => void;
  onCancel: () => void;
  initialData?: ContentItem;
}) {
  const [formData, setFormData] = useState<
    Record<string, string | boolean | string[] | undefined>
  >(initialData?.data || {});

  const handleFieldChange = (
    fieldName: string,
    value: string | boolean | string[] | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const sortedFields = model.fields?.sort((a, b) => a.order - b.order) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {initialData ? 'Edit Content' : 'Create New Content'}
        </h3>

        <form onSubmit={handleSubmit}>
          {sortedFields.map((field) => {
            switch (field.type) {
              case 'text':
                return (
                  <TextField
                    key={field.id}
                    field={field}
                    value={formData[field.name] as string}
                    onChange={(value) => handleFieldChange(field.name, value)}
                  />
                );
              case 'boolean':
                return (
                  <BooleanField
                    key={field.id}
                    field={field}
                    value={formData[field.name] as boolean}
                    onChange={(value) => handleFieldChange(field.name, value)}
                  />
                );
              case 'markdown':
                return (
                  <MarkdownField
                    key={field.id}
                    field={field}
                    value={formData[field.name] as string}
                    onChange={(value) => handleFieldChange(field.name, value)}
                  />
                );
              case 'media':
                return (
                  <MediaField
                    key={field.id}
                    field={field}
                    value={formData[field.name] as string[]}
                    onChange={(value) => handleFieldChange(field.name, value)}
                  />
                );
              default:
                return null;
            }
          })}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Content({ user }: ContentProps) {
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
      {showForm && selectedModel && (
        <ContentForm
          model={selectedModel}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingItem || undefined}
        />
      )}
      <Layout menuItems={menuItems} user={user}>
        <div className="flex h-full">
          {/* Models Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-4">Modelos</h3>
            <div className="space-y-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 ${
                    selectedModel?.id === model.id
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'text-gray-700'
                  }`}
                >
                  {model.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6">
            {selectedModel ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {selectedModel.name}
                </h2>
                <p className="text-gray-600 mb-6">
                  {selectedModel.description}
                </p>

                {/* Content Items List */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Content Items</h3>
                      <button
                        onClick={handleAddNew}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Add New
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    {contentItems.length > 0 ? (
                      <div className="space-y-2">
                        {contentItems.map((item) => (
                          <div
                            key={item.id}
                            className="border border-gray-200 rounded p-3"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">
                                  Content Item {item.id?.slice(0, 6)}...
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Fields: {Object.keys(item.data).length}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Created:{' '}
                                  {item.createdAt?.toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id!)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No content items found for this model.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">
                  Select a model to manage content
                </p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
