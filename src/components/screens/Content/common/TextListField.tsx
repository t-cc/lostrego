import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Field } from '@/types/model';
import { Plus, Trash2 } from 'lucide-react';
import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';

interface TextListFieldProps {
  field: Field;
  control: Control<
    Record<string, string | boolean | string[] | number | undefined>
  >;
  error?: {
    message?: string;
  };
}

function TextListField({ field, control, error }: TextListFieldProps) {
  if (!field.id) return null;

  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: { onChange, value } }) => {
        // Ensure value is an array of strings for textList
        const textItems: string[] = Array.isArray(value) ? value : [];

        const addItem = () => {
          onChange([...textItems, '']);
        };

        const removeItem = (index: number) => {
          onChange(textItems.filter((_, i) => i !== index));
        };

        const updateItem = (index: number, newValue: string) => {
          const newItems = [...textItems];
          newItems[index] = newValue;
          onChange(newItems);
        };

        return (
          <div className="mb-4">
            <Label>
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-xs text-muted-foreground mb-1">
                {field.description}
              </p>
            )}

            <div className="space-y-2">
              {textItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    placeholder={`Item ${index + 1}`}
                    className={error ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={field.required && textItems.length === 1} // Prevent removing last item if required
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {error && (
              <p className="text-xs text-red-500 mt-1">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}

export { TextListField };
