import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Field } from '@/types/model';
import type { Control, FieldError } from 'react-hook-form';
import { useController } from 'react-hook-form';

interface ColorFieldProps {
  field: Field;
  control: Control<
    Record<string, string | boolean | string[] | number | undefined>
  >;
  error?: FieldError;
}

export function ColorField({ field, control, error }: ColorFieldProps) {
  const {
    field: inputField,
    fieldState: { error: fieldError },
  } = useController({
    name: field.id!,
    control,
    defaultValue: '#000000',
  });

  return (
    <div className="mb-4">
      <Label htmlFor={field.id}>{field.name}</Label>
      <Input
        id={field.id}
        type="color"
        {...inputField}
        className={`mt-1 w-32 ${fieldError ? 'border-red-500' : ''}`}
      />
      {fieldError && (
        <p className="text-red-500 text-sm">{fieldError.message}</p>
      )}
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
}
