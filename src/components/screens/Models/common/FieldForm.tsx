import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Field } from '@/types/model';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { isValidCamelCase, toCamelCase } from './utils';

const fieldFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['text', 'boolean', 'markdown', 'media']),
  required: z.boolean(),
  appId: z
    .string()
    .min(1, 'API Field Name is required')
    .refine(isValidCamelCase, {
      message: 'Must be in camelCase format (e.g., fieldName, anotherField)',
    }),
  useAsTitle: z.boolean(),
});

type FieldFormData = z.infer<typeof fieldFormSchema>;

interface FieldFormProps {
  field: Field | null;
  onSave: (field: Field) => void;
  onCancel: () => void;
  onDelete?: (field: Field) => void;
}

export function FieldForm({
  field,
  onSave,
  onCancel,
  onDelete,
}: FieldFormProps) {
  const form = useForm<FieldFormData>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      name: field?.name || '',
      description: field?.description || '',
      type: field?.type || 'text',
      required: field?.required || false,
      appId: field?.appId || '',
      useAsTitle: field?.useAsTitle || false,
    },
  });

  // Auto-generate appId from name for new fields
  useEffect(() => {
    const name = form.watch('name');
    const appId = form.watch('appId');

    if (name && !field && !appId) {
      form.setValue('appId', toCamelCase(name));
    }
  }, [form, field]);

  const handleRegenerateAppId = () => {
    const name = form.getValues('name');
    form.setValue('appId', toCamelCase(name));
  };

  const onSubmit = (data: FieldFormData) => {
    const newField: Field = {
      id: field?.id || `field_${Date.now()}`,
      name: data.name,
      description: data.description || '',
      type: data.type,
      required: data.required,
      appId: data.appId,
      useAsTitle: data.useAsTitle,
      order: field?.order || 1,
    };

    onSave(newField);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h4 className="font-semibold mb-3">
          {field ? 'Edit Field' : 'New Field'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field: fieldProps }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Field name" {...fieldProps} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field: fieldProps }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select
                  onValueChange={fieldProps.onChange}
                  value={fieldProps.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field: fieldProps }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Optional field description"
                      {...fieldProps}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="appId"
              render={({ field: fieldProps }) => (
                <FormItem>
                  <FormLabel>API Field Name *</FormLabel>
                  <FormControl>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="camelCase field name"
                        {...fieldProps}
                      />
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
          </div>
          <FormField
            control={form.control}
            name="required"
            render={({ field: fieldProps }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={fieldProps.value}
                    onCheckedChange={fieldProps.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">Required</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="useAsTitle"
            render={({ field: fieldProps }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={fieldProps.value}
                    onCheckedChange={fieldProps.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">Use as title</FormLabel>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between items-center mt-4">
          {field && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(field)}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Field</span>
            </Button>
          )}
          <div className="flex space-x-2 ml-auto">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{field ? 'Update' : 'Add'} Field</Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
