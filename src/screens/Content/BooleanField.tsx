import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Field } from '@/types/model';

interface BooleanFieldProps {
  field: Field;
  value?: boolean;
  onChange: (value: boolean) => void;
}

function BooleanField({ field, value, onChange }: BooleanFieldProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={field.name}
          checked={value || false}
          onCheckedChange={(checked) => onChange(!!checked)}
        />
        <Label htmlFor={field.name}>{field.name}</Label>
      </div>
      {field.description && (
        <p className="text-xs text-muted-foreground mt-1">
          {field.description}
        </p>
      )}
    </div>
  );
}

export { BooleanField };
