import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Field } from '@/types/model';
import type { UseFormRegister } from 'react-hook-form';

interface TextFieldProps {
  field: Field;
  register: UseFormRegister<
    Record<string, string | boolean | string[] | undefined>
  >;
  error?: {
    message?: string;
  };
}

function TextField({ field, register, error }: TextFieldProps) {
  if (!field.id) return null;

  return (
    <div className="mb-4">
      <Label htmlFor={field.id}>
        {field.name}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-xs text-muted-foreground mb-1">
          {field.description}
        </p>
      )}
      <Input
        id={field.id}
        type="text"
        {...register(field.id)}
        required={field.required}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}

export { TextField };
