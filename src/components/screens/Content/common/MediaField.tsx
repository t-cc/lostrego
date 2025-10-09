import { useState } from 'react';

import { Media } from '@/components/screens/Media';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { User } from '@/types/auth';
import type { Field } from '@/types/model';
import { Controller } from 'react-hook-form';

interface MediaFieldProps {
  field: Field;
  control: import('react-hook-form').Control<
    Record<string, string | boolean | string[] | undefined>
  >;
  user: User;
  setValue: (
    name: keyof Record<string, string | boolean | string[] | undefined>,
    value: string | boolean | string[] | undefined,
    options?: Partial<{
      shouldValidate?: boolean;
      shouldDirty?: boolean;
      shouldTouch?: boolean;
    }>
  ) => void;
  getValues: (
    name: keyof Record<string, string | boolean | string[] | undefined>
  ) => string | boolean | string[] | undefined;
  error?: {
    message?: string;
  };
}

function MediaField({
  field,
  control,
  user,
  setValue,
  getValues,
  error,
}: MediaFieldProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  if (!field.id) return null;

  return (
    <>
      <Controller
        name={field.id}
        control={control}
        render={({ field: { onChange, value } }) => {
          // Ensure value is an array of strings for media
          const mediaUrls: string[] = Array.isArray(value) ? value : [];

          const removeMedia = (urlToRemove: string) => {
            onChange(mediaUrls.filter((url: string) => url !== urlToRemove));
          };

          return (
            <div className="mb-4">
              <Label htmlFor={field.id}>
                {field.name}
                {field.required && <span className="text-red-50 ml-1">*</span>}
              </Label>
              {field.description && (
                <p className="text-xs text-muted-foreground mb-1">
                  {field.description}
                </p>
              )}

              {/* Display selected media */}
              {mediaUrls.length > 0 && (
                <div className="mb-2 grid grid-cols-2 gap-2">
                  {mediaUrls.map((url: string, index: number) => (
                    <div key={`${url}-${index}`} className="relative">
                      <img
                        src={url}
                        alt={`Selected media ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeMedia(url)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        title="Remove media"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMediaPicker(true)}
                className={`w-full ${error ? 'border-red-500' : ''}`}
              >
                Select Media
              </Button>
              {error && (
                <p className="text-xs text-red-500 mt-1">{error.message}</p>
              )}
            </div>
          );
        }}
      />

      <Media
        user={user}
        isPopup={true}
        onSelect={(mediaFile) => {
          // This will be handled by the controller's render function
          if (field.id && mediaFile.url) {
            const currentValue = getValues(field.id);
            const currentMediaUrls: string[] = Array.isArray(currentValue)
              ? currentValue
              : [];
            setValue(field.id, [...currentMediaUrls, mediaFile.url]);
            setShowMediaPicker(false);
          }
        }}
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
      />
    </>
  );
}

export { MediaField };
