import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { User } from '@/types/auth';
import type { ContentItem } from '@/types/content';
import type { Model } from '@/types/model';

import { BooleanField } from './BooleanField';
import { MarkdownField } from './MarkdownField';
import { MediaField } from './MediaField';
import { TextField } from './TextField';

interface ContentFormProps {
  model: Model;
  user: User;
  onSubmit: (
    data: Record<string, string | boolean | string[] | undefined>
  ) => void;
  onCancel: () => void;
  initialData?: ContentItem;
  onDelete?: () => void;
}

function ContentForm({
  model,
  user,
  onSubmit,
  onCancel,
  initialData,
  onDelete,
}: ContentFormProps) {
  const [formData, setFormData] = useState<
    Record<string, string | boolean | string[] | undefined>
  >(initialData?.data || {});

  useEffect(() => {
    setFormData(initialData?.data || {});
  }, [initialData]);

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

  const formElement = (
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
                user={user}
              />
            );
          default:
            return null;
        }
      })}

      <div className="flex justify-end space-x-3 mt-6">
        {onDelete && initialData && (
          <Button type="button" onClick={onDelete} variant="destructive">
            Delete
          </Button>
        )}
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit">{initialData ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );

  return (
    <div className="mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">
        {initialData ? 'Edit Content' : 'Create New Content'}
      </h1>
      {formElement}
    </div>
  );
}

export { ContentForm };
