import { useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import type { User } from '@/types/auth';
import type { ContentItem } from '@/types/content';
import type { Field, Model } from '@/types/model';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { BooleanField } from './BooleanField';
import { DateTimeField } from './DateTimeField';
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

export function ContentForm({
  model,
  user,
  onSubmit,
  onCancel,
  initialData,
  onDelete,
}: ContentFormProps) {
  // Create dynamic Zod schema based on model fields
  const createSchema = (fields: Field[]) => {
    const shape: Record<string, z.ZodTypeAny> = {};

    fields.forEach((field) => {
      if (!field.id) return; // Skip fields without id

      let fieldSchema: z.ZodTypeAny;
      switch (field.type) {
        case 'text':
        case 'markdown':
        case 'datetime':
          if (field.required) {
            fieldSchema = z.string().min(1, `${field.name} is required`);
          } else {
            fieldSchema = z.string();
          }
          break;
        case 'boolean':
          fieldSchema = z.boolean();
          break;
        case 'media':
          if (field.required) {
            fieldSchema = z
              .array(z.string())
              .min(1, `${field.name} is required`);
          } else {
            fieldSchema = z.array(z.string());
          }
          break;
        default:
          fieldSchema = z.union([z.string(), z.boolean(), z.array(z.string())]);
      }

      shape[field.id] = fieldSchema;
    });

    return z.object(shape);
  };

  const sortedFields = useMemo(
    () => model.fields?.sort((a, b) => a.order - b.order) || [],
    [model.fields]
  );

  const schema = useMemo(
    () =>
      createSchema(sortedFields) as z.ZodSchema<
        Record<string, string | boolean | string[] | undefined>
      >,
    [sortedFields]
  );

  // Create default values for all model fields to ensure proper validation
  const createDefaultValues = (
    fields: Field[],
    existingData?: Record<string, string | boolean | string[] | undefined>
  ) => {
    const defaults: Record<string, string | boolean | string[] | undefined> =
      {};

    fields.forEach((field) => {
      if (!field.id) return; // Skip fields without id

      // Use existing data if available, otherwise set appropriate defaults
      if (existingData && existingData[field.id] !== undefined) {
        defaults[field.id] = existingData[field.id];
      } else {
        switch (field.type) {
          case 'text':
          case 'markdown':
          case 'datetime':
            defaults[field.id] = '';
            break;
          case 'boolean':
            defaults[field.id] = false;
            break;
          case 'media':
            defaults[field.id] = [];
            break;
          default:
            defaults[field.id] = undefined;
        }
      }
    });

    return defaults;
  };

  const defaultValues = useMemo(
    () => createDefaultValues(sortedFields, initialData?.data),
    [sortedFields, initialData?.data]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
    getValues,
  } = useForm<Record<string, string | boolean | string[] | undefined>>({
    // @ts-expect-error - Complex Zod type compatibility issue
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onSubmit',
  });

  const onFormSubmit = (
    data: Record<string, string | boolean | string[] | undefined>
  ) => {
    onSubmit(data);
  };

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <div className="mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">
        {initialData ? 'Edit Content' : 'Create New Content'}
      </h1>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        {sortedFields.map((field) => {
          const fieldError = field.id ? errors[field.id] : undefined;
          switch (field.type) {
            case 'text':
              return (
                <TextField
                  key={field.id}
                  field={field}
                  register={register}
                  error={fieldError}
                />
              );
            case 'boolean':
              return (
                <BooleanField
                  key={field.id}
                  field={field}
                  control={control}
                  error={fieldError}
                />
              );
            case 'markdown':
              return (
                <MarkdownField
                  key={field.id}
                  field={field}
                  register={register}
                  error={fieldError}
                />
              );
            case 'media':
              return (
                <MediaField
                  key={field.id}
                  field={field}
                  control={control}
                  user={user}
                  setValue={setValue}
                  getValues={getValues}
                  error={fieldError}
                />
              );
            case 'datetime':
              return (
                <DateTimeField
                  key={field.id}
                  field={field}
                  register={register}
                  error={fieldError}
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
    </div>
  );
}
