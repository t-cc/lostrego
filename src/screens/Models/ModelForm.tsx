import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Field, Model } from '@/types/model';

import { FieldForm } from './FieldForm';
import { FieldList } from './FieldList';

interface ModelFormData {
  name: string;
  description: string;
  fields: Field[];
}

interface ModelFormProps {
  model: Model | null;
  initialData?: ModelFormData;
  onSave: (modelData: ModelFormData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function ModelForm({
  model,
  initialData,
  onSave,
  onCancel,
  isSaving,
}: ModelFormProps) {
  const [formData, setFormData] = useState<ModelFormData>(
    initialData || {
      name: model?.name || '',
      description: model?.description || '',
      fields: model?.fields || [],
    }
  );

  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);

  const handleFieldSave = (field: Field) => {
    setFormData((prev) => ({
      ...prev,
      fields: editingField
        ? prev.fields.map((f) => (f.id === editingField.id ? field : f))
        : [...prev.fields, field],
    }));
    setShowFieldForm(false);
    setEditingField(null);
  };

  const handleFieldEdit = (field: Field) => {
    setEditingField(field);
    setShowFieldForm(true);
  };

  const handleFieldDelete = (fieldId: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== fieldId),
    }));
  };

  const handleFieldMove = (fieldId: string, direction: 'up' | 'down') => {
    const fieldIndex = formData.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return;

    const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    if (newIndex < 0 || newIndex >= formData.fields.length) return;

    const newFields = [...formData.fields];
    [newFields[fieldIndex], newFields[newIndex]] = [
      newFields[newIndex],
      newFields[fieldIndex],
    ];

    newFields.forEach((field, index) => {
      field.order = index + 1;
    });

    setFormData((prev) => ({ ...prev, fields: newFields }));
  };

  return (
    <div className="bg-white p-6 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        {model ? 'Edit Model' : 'Create New Model'}
      </h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="model-name">Name</Label>
          <Input
            id="model-name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Model name"
          />
        </div>
        <div>
          <Label htmlFor="model-description">Description</Label>
          <Textarea
            id="model-description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Model description"
            rows={3}
          />
        </div>

        <FieldList
          fields={formData.fields}
          onEditField={handleFieldEdit}
          onDeleteField={handleFieldDelete}
          onMoveField={handleFieldMove}
          onAddField={() => {
            setEditingField(null);
            setShowFieldForm(true);
          }}
        />

        {showFieldForm && (
          <div className="mt-4">
            <FieldForm
              field={editingField}
              onSave={handleFieldSave}
              onCancel={() => {
                setShowFieldForm(false);
                setEditingField(null);
              }}
            />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)} disabled={isSaving}>
            {isSaving ? 'Saving...' : model ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
}
