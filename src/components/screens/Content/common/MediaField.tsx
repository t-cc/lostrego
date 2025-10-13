import { useState } from 'react';

import { Media } from '@/components/screens/Media';
import { Button } from '@/components/ui/button';
import { ContentImage } from '@/components/ui/content-image';
import { Label } from '@/components/ui/label';
import type { User } from '@/types/auth';
import type { Field } from '@/types/model';
import {
  File,
  FileAudio,
  FileCode,
  FileText,
  FileVideo,
  FolderOpen,
  Image,
} from 'lucide-react';
import { Controller } from 'react-hook-form';

interface MediaFieldProps {
  field: Field;
  control: import('react-hook-form').Control<
    Record<string, string | boolean | string[] | number | undefined>
  >;
  user: User;
  setValue: (
    name: keyof Record<
      string,
      string | boolean | string[] | number | undefined
    >,
    value: string | boolean | string[] | number | undefined,
    options?: Partial<{
      shouldValidate?: boolean;
      shouldDirty?: boolean;
      shouldTouch?: boolean;
    }>
  ) => void;
  getValues: (
    name: keyof Record<string, string | boolean | string[] | number | undefined>
  ) => string | boolean | string[] | number | undefined;
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

  // Function to determine file type from URL
  const getFileType = (url: string) => {
    // Extract filename from Firebase URL
    const fileName = url.split('/').pop()?.split('?')[0] || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm'];
    const textExtensions = ['txt', 'md', 'rtf'];
    const codeExtensions = [
      'js',
      'jsx',
      'ts',
      'tsx',
      'html',
      'css',
      'scss',
      'json',
      'xml',
      'py',
      'java',
      'cpp',
      'c',
      'php',
      'rb',
      'go',
      'rs',
    ];

    if (imageExtensions.includes(extension)) {
      return 'image';
    } else if (audioExtensions.includes(extension)) {
      return 'audio';
    } else if (videoExtensions.includes(extension)) {
      return 'video';
    } else if (textExtensions.includes(extension)) {
      return 'text';
    } else if (codeExtensions.includes(extension)) {
      return 'code';
    } else {
      return 'file';
    }
  };

  // Function to get file icon based on type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-12 h-12 text-blue-500 mx-auto" />;
      case 'audio':
        return <FileAudio className="w-12 h-12 text-green-500 mx-auto" />;
      case 'video':
        return <FileVideo className="w-12 h-12 text-red-500 mx-auto" />;
      case 'text':
        return <FileText className="w-12 h-12 text-yellow-500 mx-auto" />;
      case 'code':
        return <FileCode className="w-12 h-12 text-purple-500 mx-auto" />;
      default:
        return <File className="w-12 h-12 text-gray-500 mx-auto" />;
    }
  };

  const getFileName = (url: string) => {
    // Extract filename from Firebase URL
    return (
      url.split('/').pop()?.split('%2F').pop()?.split('?')[0] || 'Unknown file'
    );
  };

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
                <div className="mb-2 flex flex-col gap-2">
                  {mediaUrls.map((url: string, index: number) => {
                    const fileType = getFileType(url);
                    const isImage = fileType === 'image';
                    const fileName = getFileName(url);

                    return (
                      <div
                        key={`${url}-${index}`}
                        className="relative max-w-[200px] rounded-lg shadow-md bg-gray-100 p-2"
                      >
                        {isImage ? (
                          <ContentImage src={url} alt={fileName} height={80} />
                        ) : (
                          <div className="w-full h-[80px] flex flex-col items-center justify-center">
                            {getFileIcon(fileType)}
                            <div className="text-xs text-center text-gray-700 truncate mt-2 w-full max-w-[180px]">
                              {fileName}
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(url)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          title="Remove media"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMediaPicker(true)}
                className={` ${error ? 'border-red-500' : ''}`}
              >
                <FolderOpen />
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
