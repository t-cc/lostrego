import { useRef } from 'react';

import { Upload as UploadIcon } from 'lucide-react';

interface UploadAreaProps {
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onButtonClick: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
}

export default function UploadArea({
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onButtonClick,
  onChange,
  accept = '*/*',
}: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
    onButtonClick();
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-colors ${
        dragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={handleButtonClick}
    >
      <UploadIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
      <div>
        <p className="text-base font-semibold text-gray-900">
          {dragActive
            ? 'Drop files here'
            : 'Drag and drop files or click to select'}
        </p>
        <p className="text-sm text-gray-600">
          Upload images, documents, videos, audio or other files
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onChange}
        accept={accept}
      />
    </div>
  );
}
