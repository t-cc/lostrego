import FileItem from './FileItem';
import type { MediaFile } from './types';

interface FileGridProps {
  files: MediaFile[];
  onDelete: (filePath: string, fileName: string) => void;
  onSelect?: (file: MediaFile) => void;
  isSelectable?: boolean;
}

export default function FileGrid({
  files,
  onDelete,
  onSelect,
  isSelectable,
}: FileGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {files.map((file) => (
        <FileItem
          key={file.path}
          file={file}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelectable={isSelectable}
        />
      ))}
    </div>
  );
}
