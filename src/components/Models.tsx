import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { menuItems } from '@/config/menu';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { Field, Model } from '@/types/model';
import {
  CheckSquare,
  Edit,
  FileText,
  Hash,
  Image,
  Plus,
  Trash2,
} from 'lucide-react';

interface ModelsProps {
  user: User;
}

interface ModelFormData {
  name: string;
  description: string;
  fields: Field[];
}

interface FieldFormData {
  name: string;
  description: string;
  type: 'text' | 'boolean' | 'markdown' | 'media';
  required: boolean;
}

export default function Models({ user }: ModelsProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [formData, setFormData] = useState<ModelFormData>({
    name: '',
    description: '',
    fields: [],
  });
  const [saving, setSaving] = useState(false);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [fieldFormData, setFieldFormData] = useState<FieldFormData>({
    name: '',
    description: '',
    type: 'text',
    required: false,
  });

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
    setFormData({ name: '', description: '', fields: [] });
    setShowForm(true);
  };

  const handleEdit = (model: Model) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      description: model.description,
      fields: model.fields || [],
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (editingModel) {
        await modelService.update(editingModel.id!, formData);
      } else {
        await modelService.create(formData);
      }

      setShowForm(false);
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

  const resetForm = () => {
    setFormData({ name: '', description: '', fields: [] });
    setEditingModel(null);
    setShowForm(false);
  };

  const handleAddField = () => {
    setEditingField(null);
    setFieldFormData({
      name: '',
      description: '',
      type: 'text',
      required: false,
    });
    setShowFieldForm(true);
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
    setFieldFormData({
      name: field.name,
      description: field.description,
      type: field.type,
      required: field.required,
    });
    setShowFieldForm(true);
  };

  const handleSaveField = () => {
    const fieldData: Field = {
      id: editingField?.id || `field_${Date.now()}`,
      name: fieldFormData.name,
      description: fieldFormData.description,
      type: fieldFormData.type,
      required: fieldFormData.required,
      order: editingField?.order || formData.fields.length + 1,
    };

    if (editingField) {
      // Update existing field
      setFormData({
        ...formData,
        fields: formData.fields.map((f) =>
          f.id === editingField.id ? fieldData : f
        ),
      });
    } else {
      // Add new field
      setFormData({
        ...formData,
        fields: [...formData.fields, fieldData],
      });
    }

    setShowFieldForm(false);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      setFormData({
        ...formData,
        fields: formData.fields.filter((f) => f.id !== fieldId),
      });
    }
  };

  const resetFieldForm = () => {
    setFieldFormData({
      name: '',
      description: '',
      type: 'text',
      required: false,
    });
    setEditingField(null);
    setShowFieldForm(false);
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'boolean':
        return <CheckSquare className="w-4 h-4" />;
      case 'markdown':
        return <Hash className="w-4 h-4" />;
      case 'media':
        return <Image className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const fieldIndex = formData.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return;

    const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    if (newIndex < 0 || newIndex >= formData.fields.length) return;

    const newFields = [...formData.fields];
    [newFields[fieldIndex], newFields[newIndex]] = [
      newFields[newIndex],
      newFields[fieldIndex],
    ];

    // Update order values
    newFields.forEach((field, index) => {
      field.order = index + 1;
    });

    setFormData({ ...formData, fields: newFields });
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
          <div className="bg-white p-6 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              {editingModel ? 'Edit Model' : 'Create New Model'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Model name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Model description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fields Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Fields</h3>
                  <Button type="button" onClick={handleAddField} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                </div>

                {formData.fields.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No fields defined</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add fields to define the model structure
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.fields
                      .sort((a, b) => a.order - b.order)
                      .map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            {getFieldTypeIcon(field.type)}
                            <span className="font-medium">{field.name}</span>
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </div>
                          <div className="flex-1 text-sm text-gray-600">
                            {field.description}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => moveField(field.id!, 'up')}
                              disabled={field.order === 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveField(field.id!, 'down')}
                              disabled={field.order === formData.fields.length}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ↓
                            </button>
                            <Button
                              type="button"
                              onClick={() => handleEditField(field)}
                              size="sm"
                              variant="outline"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => handleDeleteField(field.id!)}
                              size="sm"
                              variant="outline"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {showFieldForm && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold mb-3">
                      {editingField ? 'Edit Field' : 'New Field'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Name *
                        </label>
                        <Input
                          value={fieldFormData.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldFormData({
                              ...fieldFormData,
                              name: e.target.value,
                            })
                          }
                          placeholder="Field name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Type *
                        </label>
                        <select
                          value={fieldFormData.type}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setFieldFormData({
                              ...fieldFormData,
                              type: e.target.value as Field['type'],
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="text">Text</option>
                          <option value="boolean">Boolean</option>
                          <option value="markdown">Markdown</option>
                          <option value="media">Media</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">
                          Description
                        </label>
                        <Input
                          value={fieldFormData.description}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldFormData({
                              ...fieldFormData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Optional field description"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="required"
                          checked={fieldFormData.required}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldFormData({
                              ...fieldFormData,
                              required: e.target.checked,
                            })
                          }
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="required" className="text-sm">
                          Required
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetFieldForm}
                      >
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleSaveField}>
                        {editingField ? 'Update' : 'Add'} Field
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : editingModel ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchModels} className="mt-4">
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {models.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No models registered.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create your first model using the "New Model" button.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="p-6 bg-white border rounded-lg shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {model.name}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {model.description}
                        </p>
                        <div className="text-xs text-gray-400 mt-2">
                          {model.createdAt && (
                            <span>
                              Created: {model.createdAt.toLocaleDateString()}
                            </span>
                          )}
                          {model.updatedAt &&
                            model.updatedAt.getTime() !==
                              model.createdAt?.getTime() && (
                              <span className="ml-4">
                                Updated: {model.updatedAt.toLocaleDateString()}
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(model)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(model.id!, model.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
