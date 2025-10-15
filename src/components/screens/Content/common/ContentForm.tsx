import { useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import type { User } from '@/types/auth';
import type { ContentItem } from '@/types/content';
import type { Field, Model } from '@/types/model';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { BooleanField } from './BooleanField';
import { ColorField } from './ColorField';
import { DateTimeField } from './DateTimeField';
import { MarkdownField } from './MarkdownField';
import { MediaField } from './MediaField';
import { NumberField } from './NumberField';
import { TextField } from './TextField';
import { TextListField } from './TextListField';

interface ContentFormProps {
  model: Model;
  user: User;
  onSubmit: (
    data: Record<string, string | boolean | string[] | number | undefined>
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
        case 'number':
          if (field.required) {
            fieldSchema = z.number().min(0, `${field.name} is required`);
          } else {
            fieldSchema = z.number().optional();
          }
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
        case 'color':
          fieldSchema = z.string();
          break;
        case 'textList':
          if (field.required) {
            fieldSchema = z
              .array(z.string())
              .min(1, `${field.name} is required`);
          } else {
            fieldSchema = z.array(z.string());
          }
          break;
        default:
          fieldSchema = z.union([
            z.string(),
            z.boolean(),
            z.array(z.string()),
            z.number(),
          ]);
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
        Record<string, string | boolean | string[] | number | undefined>
      >,
    [sortedFields]
  );

  // Create default values for all model fields to ensure proper validation
  const createDefaultValues = (
    fields: Field[],
    existingData?: Record<
      string,
      string | boolean | string[] | number | undefined
    >
  ) => {
    const defaults: Record<
      string,
      string | boolean | string[] | number | undefined
    > = {};

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
          case 'number':
            defaults[field.id] = undefined;
            break;
          case 'media':
            defaults[field.id] = [];
            break;
          case 'color':
            defaults[field.id] = '#000000';
            break;
          case 'textList':
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
  } = useForm<Record<string, string | boolean | string[] | number | undefined>>(
    {
      // @ts-expect-error - Complex Zod type compatibility issue
      resolver: zodResolver(schema),
      defaultValues,
      mode: 'onSubmit',
    }
  );

  const onFormSubmit = (
    data: Record<string, string | boolean | string[] | number | undefined>
  ) => {
    onSubmit(data);
  };

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <div className="mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          {initialData ? 'Edit Content' : 'Create New Content'}
        </h1>
        {initialData && model.previewUrl && (
          <Button
            type="button"
            onClick={() => {
              const formValues = getValues();
              let previewUrl = model.previewUrl!;

              // Replace variables in curly braces with form values using field appId
              const variableRegex = /\{([^}]+)\}/g;
              previewUrl = previewUrl.replace(
                variableRegex,
                (match, varName) => {
                  // Find the field with this appId and get its value
                  const field = model.fields?.find(
                    (f) => f.id && f.appId === varName.trim()
                  );
                  if (field && field.id) {
                    const fieldValue = formValues[field.id];
                    return fieldValue ? String(fieldValue) : match;
                  }
                  return match; // Keep the original if no field found
                }
              );

              window.open(previewUrl, '_blank');
            }}
            variant="outline"
            size="sm"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        )}
      </div>
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
            case 'number':
              return (
                <NumberField
                  key={field.id}
                  field={field}
                  register={register}
                  error={fieldError}
                />
              );
            case 'color':
              return (
                <ColorField
                  key={field.id}
                  field={field}
                  control={control}
                  error={fieldError}
                />
              );
            case 'textList':
              return (
                <TextListField
                  key={field.id}
                  field={field}
                  control={control}
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
