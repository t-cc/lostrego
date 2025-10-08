import { Button } from '@/components/ui/button';
import type { Model } from '@/types/model';
import { Edit, Trash2 } from 'lucide-react';

interface ModelListProps {
  models: Model[];
  loading: boolean;
  error: string | null;
  onEditModel: (model: Model) => void;
  onDeleteModel: (id: string, name: string) => void;
  onRetry: () => void;
}

export function ModelList({
  models,
  loading,
  error,
  onEditModel,
  onDeleteModel,
  onRetry,
}: ModelListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Button onClick={onRetry} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No models registered.</p>
        <p className="text-sm text-gray-400 mt-1">
          Create your first model using the "New Model" button.
        </p>
      </div>
    );
  }

  return (
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
              <p className="text-gray-600 mt-1">{model.description}</p>
              <div className="text-xs text-gray-400 mt-2">
                {model.createdAt && (
                  <span>Created: {model.createdAt.toLocaleDateString()}</span>
                )}
                {model.updatedAt &&
                  model.updatedAt.getTime() !== model.createdAt?.getTime() && (
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
                onClick={() => onEditModel(model)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteModel(model.id!, model.name)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
