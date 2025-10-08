import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ContentForm({
  model,
  user,
  onSubmit,
  onCancel,
  initialData,
  open,
  onOpenChange,
}: ContentFormProps) {
  const [formData, setFormData] = useState<
    Record<string, string | boolean | string[] | undefined>
  >(initialData?.data || {});

  useEffect(() => {
    if (open) {
      setFormData(initialData?.data || {});
    }
  }, [open, initialData]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Content' : 'Create New Content'}
          </DialogTitle>
          <DialogDescription>
            Fill out the form to {initialData ? 'update' : 'create'} content.
          </DialogDescription>
        </DialogHeader>

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
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <Button type="submit">{initialData ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ContentForm };
