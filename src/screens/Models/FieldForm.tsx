import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Field } from '@/types/model';

interface FieldFormData {
  name: string;
  description: string;
  type: 'text' | 'boolean' | 'markdown' | 'media';
  required: boolean;
}

interface FieldFormProps {
  field: Field | null;
  onSave: (field: Field) => void;
  onCancel: () => void;
}

export function FieldForm({ field, onSave, onCancel }: FieldFormProps) {
  const [formData, setFormData] = useState<FieldFormData>({
    name: field?.name || '',
    description: field?.description || '',
    type: field?.type || 'text',
    required: field?.required || false,
  });

  const handleSave = () => {
    const newField: Field = {
      id: field?.id || `field_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      required: formData.required,
      order: field?.order || 1,
    };

    onSave(newField);
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h4 className="font-semibold mb-3">
        {field ? 'Edit Field' : 'New Field'}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="field-name">Name *</Label>
          <Input
            id="field-name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Field name"
          />
        </div>
        <div>
          <Label htmlFor="field-type">Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, type: value as Field['type'] }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="media">Media</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="field-description">Description</Label>
          <Input
            id="field-description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Optional field description"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="field-required"
            checked={formData.required}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, required: !!checked }))
            }
          />
          <Label htmlFor="field-required">Required</Label>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave}>
          {field ? 'Update' : 'Add'} Field
        </Button>
      </div>
    </div>
  );
}
