import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Field } from '@/types/model';
import { Plus } from 'lucide-react';

import { getFieldTypeIcon } from './utils';

interface FieldListProps {
  fields: Field[];
  onEditField: (field: Field) => void;
  onMoveField: (fieldId: string, direction: 'up' | 'down') => void;
  onAddField: () => void;
}

export function FieldList({
  fields,
  onEditField,
  onMoveField,
  onAddField,
}: FieldListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Fields</h3>
        <Button type="button" variant="outline" onClick={onAddField} size="sm">
          <Plus className="size-4" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No fields defined</p>
          <p className="text-sm text-gray-400 mt-1">
            Add fields to define the model structure
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div
                key={field.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  {(() => {
                    const Icon = getFieldTypeIcon(field.type);
                    return <Icon className="size-4" />;
                  })()}
                  <button
                    type="button"
                    className="font-medium hover:underline text-left"
                    onClick={() => onEditField(field)}
                  >
                    {field.name}
                  </button>
                </div>
                <div className="flex-1 text-sm text-gray-600 flex items-center space-x-2">
                  <div>{field.description}</div>
                  <div className="flex space-x-1">
                    {field.required && (
                      <Badge variant="secondary" className="text-xs h-5">
                        Required
                      </Badge>
                    )}
                    {field.useAsTitle && (
                      <Badge variant="secondary" className="text-xs h-5">
                        Title
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveField(field.id!, 'up')}
                    disabled={field.order === 1}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveField(field.id!, 'down')}
                    disabled={field.order === fields.length}
                  >
                    ↓
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
