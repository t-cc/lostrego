import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Field } from '@/types/model';

interface MarkdownFieldProps {
  field: Field;
  value?: string;
  onChange: (value: string) => void;
}

function MarkdownField({ field, value, onChange }: MarkdownFieldProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={field.name}>{field.name}</Label>
      {field.description && (
        <p className="text-xs text-muted-foreground mb-1">
          {field.description}
        </p>
      )}
      <Textarea
        id={field.name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        rows={4}
        placeholder="Enter markdown content..."
      />
    </div>
  );
}

export { MarkdownField };
