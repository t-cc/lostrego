import { Trash2 } from 'lucide-react';

import type { MediaFile } from './types';

interface FileItemProps {
  file: MediaFile;
  onDelete: (filePath: string, fileName: string) => void;
  onSelect?: (file: MediaFile) => void;
  isSelectable?: boolean;
}

export default function FileItem({
  file,
  onDelete,
  onSelect,
  isSelectable = false,
}: FileItemProps) {
  const handleClick = () => {
    if (isSelectable && onSelect) {
      onSelect(file);
    }
  };

  return (
    <div
      className={`aspect-video shadow-md bg-gray-100 p-2 rounded-lg overflow-hidden group ${isSelectable ? 'cursor-pointer' : ''} relative`}
      onClick={handleClick}
    >
      {file.url && (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
          loading="lazy"
        />
      )}
      {/* Delete button */}
      {!isSelectable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file.path, file.name);
          }}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          title={`Delete ${file.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <div className="p-2 bg-black bg-opacity-50 text-white text-xs truncate bottom-0 left-0 right-0 absolute opacity-0 group-hover:opacity-100 transition-opacity">
        {file.name}
      </div>
    </div>
  );
}
