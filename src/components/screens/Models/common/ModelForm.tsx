import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { Field, Model } from '@/types/model';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FieldForm } from './FieldForm';
import { FieldList } from './FieldList';
import { toCamelCase } from './utils';

const modelFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  appId: z.string().min(1, 'API Field Name is required'),
});

type ModelFormData = z.infer<typeof modelFormSchema>;

interface ModelFormProps {
  model: Model | null;
  initialData?: ModelFormData;
  onSave: (modelData: ModelFormData & { fields: Field[] }) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  isSaving: boolean;
}

export function ModelForm({
  model,
  initialData,
  onSave,
  onCancel,
  onDelete,
  isSaving,
}: ModelFormProps) {
  const [fields, setFields] = useState<Field[]>(model?.fields || []);

  const isEditMode = !!model;

  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);

  const form = useForm<ModelFormData>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      name: initialData?.name || model?.name || '',
      description: initialData?.description || model?.description || '',
      appId:
        initialData?.appId || model?.appId || toCamelCase(model?.name || ''),
    },
  });

  // Auto-generate appId from name for new models
  useEffect(() => {
    const name = form.watch('name');
    if (name && !model && form.watch('appId') === '') {
      form.setValue('appId', toCamelCase(name));
    }
  }, [form.watch('name'), form, model]);

  const handleRegenerateAppId = () => {
    const name = form.getValues('name');
    form.setValue('appId', toCamelCase(name));
  };

  const onSubmit = async (data: ModelFormData) => {
    await onSave({
      ...data,
      fields: isEditMode ? fields : [], // For new models, fields can be empty
    });
  };

  const handleFieldSave = async (field: Field) => {
    // Update local fields
    let updatedFields;
    if (editingField) {
      updatedFields = fields.map((f) => (f.id === editingField.id ? field : f));
    } else {
      updatedFields = [...fields, field];
    }

    // If useAsTitle is true for this field, disable it for all other fields
    if (field.useAsTitle) {
      updatedFields = updatedFields.map((f) =>
        f.id === field.id ? f : { ...f, useAsTitle: false }
      );
    }

    setFields(updatedFields);
    setShowFieldForm(false);
    setEditingField(null);

    // Auto-save the entire model when a field is added/edited
    await onSave({
      ...form.getValues(),
      fields: updatedFields,
    });
  };

  const handleFieldDeleteWithClose = async (fieldId: string) => {
    // Update local fields first
    const updatedFields = fields.filter((f) => f.id !== fieldId);
    setFields(updatedFields);
    setShowFieldForm(false);
    setEditingField(null);

    // Auto-save the entire model when a field is deleted
    await onSave({
      ...form.getValues(),
      fields: updatedFields,
    });
  };

  const handleFieldEdit = (field: Field) => {
    setEditingField(field);
    setShowFieldForm(true);
  };

  const handleFieldMove = async (fieldId: string, direction: 'up' | 'down') => {
    const fieldIndex = fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return;

    const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[fieldIndex], newFields[newIndex]] = [
      newFields[newIndex],
      newFields[fieldIndex],
    ];

    // Update the order property for ALL fields to match their new positions
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      order: index + 1,
    }));

    // Update local fields
    setFields(updatedFields);

    // Auto-save after reordering
    await onSave({
      ...form.getValues(),
      fields: updatedFields,
    });
  };

  return (
    <Form {...form}>
      {isEditMode ? (
        <Tabs defaultValue="fields">
          <TabsList>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Model name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Field Name *</FormLabel>
                  <FormControl>
                    <div className="flex space-x-2">
                      <Input placeholder="camelCase field name" {...field} />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleRegenerateAppId}
                        title="Regenerate from name"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Model description"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center pt-4">
              <div>
                {onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={onDelete}
                    disabled={isSaving}
                  >
                    Delete Model
                  </Button>
                )}
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4">
            <FieldList
              fields={fields}
              onEditField={handleFieldEdit}
              onMoveField={handleFieldMove}
              onAddField={() => {
                setEditingField(null);
                setShowFieldForm(true);
              }}
            />

            <Dialog open={showFieldForm} onOpenChange={setShowFieldForm}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingField ? 'Edit Field' : 'Add New Field'}
                  </DialogTitle>
                </DialogHeader>
                <FieldForm
                  field={editingField}
                  onSave={handleFieldSave}
                  onCancel={() => {
                    setShowFieldForm(false);
                    setEditingField(null);
                  }}
                  onDelete={
                    editingField
                      ? (field) => handleFieldDeleteWithClose(field.id!)
                      : undefined
                  }
                />
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Model name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="appId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Field Name *</FormLabel>
                <FormControl>
                  <div className="flex space-x-2">
                    <Input placeholder="camelCase field name" {...field} />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleRegenerateAppId}
                      title="Regenerate from name"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Model description"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      )}
    </Form>
  );
}
