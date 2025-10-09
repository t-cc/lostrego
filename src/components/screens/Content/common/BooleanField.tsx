import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Field } from '@/types/model';
import { Controller } from 'react-hook-form';

interface BooleanFieldProps {
  field: Field;
  control: import('react-hook-form').Control<
    Record<string, string | boolean | string[] | undefined>
  >;
  error?: {
    message?: string;
  };
}

function BooleanField({ field, control, error }: BooleanFieldProps) {
  if (!field.id) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2">
        <Controller
          name={field.id}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Switch
              id={field.id}
              checked={!!value}
              onCheckedChange={onChange}
            />
          )}
        />
        <Label htmlFor={field.id}>
          {field.name}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      {field.description && (
        <p className="text-xs text-muted-foreground mt-1">
          {field.description}
        </p>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}

export { BooleanField };
