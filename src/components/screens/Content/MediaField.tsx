import { useState } from 'react';

import Media from '@/components/screens/Media';
import type { MediaFile } from '@/components/screens/Media/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { User } from '@/types/auth';
import type { Field } from '@/types/model';

interface MediaFieldProps {
  field: Field;
  value?: string[];
  onChange: (value: string[]) => void;
  user: User;
}

function MediaField({ field, value, onChange, user }: MediaFieldProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const handleSelectMedia = (mediaFile: MediaFile) => {
    if (mediaFile.url) {
      // Add the selected media to the array
      const currentValue = value || [];
      onChange([...currentValue, mediaFile.url]);
      setShowMediaPicker(false);
    }
  };

  const removeMedia = (urlToRemove: string) => {
    const currentValue = value || [];
    onChange(currentValue.filter((url) => url !== urlToRemove));
  };

  return (
    <>
      <div className="mb-4">
        <Label htmlFor={field.name}>{field.name}</Label>
        {field.description && (
          <p className="text-xs text-muted-foreground mb-1">
            {field.description}
          </p>
        )}

        {/* Display selected media */}
        {value && value.length > 0 && (
          <div className="mb-2 grid grid-cols-2 gap-2">
            {value.map((url, index) => (
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
          className="w-full"
        >
          Select Media
        </Button>
      </div>

      <Media
        user={user}
        isPopup={true}
        onSelect={handleSelectMedia}
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
      />
    </>
  );
}

export { MediaField };
