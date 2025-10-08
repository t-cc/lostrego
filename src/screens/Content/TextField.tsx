import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Field } from '@/types/model';

interface TextFieldProps {
  field: Field;
  value?: string;
  onChange: (value: string) => void;
}

function TextField({ field, value, onChange }: TextFieldProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={field.name}>{field.name}</Label>
      {field.description && (
        <p className="text-xs text-muted-foreground mb-1">
          {field.description}
        </p>
      )}
      <Input
        id={field.name}
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
      />
    </div>
  );
}

export { TextField };
