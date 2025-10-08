import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { menuItems } from '@/config/menu';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { Model } from '@/types/model';
import { Edit, Plus, Trash2 } from 'lucide-react';

interface ModelsProps {
  user: User;
}

interface ModelFormData {
  name: string;
  description: string;
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
  });
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
    setFormData({ name: '', description: '' });
    setShowForm(true);
  };

  const handleEdit = (model: Model) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      description: model.description,
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
      setError('Error al guardar el modelo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el modelo "${name}"?`)) {
      try {
        await modelService.delete(id);
        fetchModels();
      } catch (err) {
        console.error('Error deleting model:', err);
        setError('Error al eliminar el modelo');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingModel(null);
    setShowForm(false);
  };

  return (
    <Layout menuItems={menuItems} user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modelos</h1>
            <p className="text-gray-600">Gestiona los modelos del sistema.</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Modelo
          </Button>
        </div>

        {showForm && (
          <div className="bg-white p-6 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              {editingModel ? 'Editar Modelo' : 'Crear Nuevo Modelo'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nombre del modelo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descripción del modelo"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving
                    ? 'Guardando...'
                    : editingModel
                      ? 'Actualizar'
                      : 'Crear'}
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
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {models.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay modelos registrados.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Crea tu primer modelo usando el botón "Nuevo Modelo".
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
                              Creado: {model.createdAt.toLocaleDateString()}
                            </span>
                          )}
                          {model.updatedAt &&
                            model.updatedAt.getTime() !==
                              model.createdAt?.getTime() && (
                              <span className="ml-4">
                                Actualizado:{' '}
                                {model.updatedAt.toLocaleDateString()}
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
