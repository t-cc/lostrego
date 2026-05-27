import {
  File,
  FileAudio,
  FileCode,
  FileText,
  FileVideo,
  Image,
  Trash2,
} from 'lucide-react';

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

  // Determine file type based on extension
  const getFileType = () => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
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

  const fileType = getFileType();
  const isImage = fileType === 'image';

  const getFileIcon = () => {
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

  return (
    <div
      className={`aspect-video shadow-md bg-gray-100 p-2 rounded-lg overflow-hidden group ${isSelectable ? 'cursor-pointer' : ''} relative`}
      onClick={handleClick}
    >
      {isImage && file.url ? (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-2">
          {getFileIcon()}
          <div className="text-xs text-center text-gray-700 truncate mt-2 w-full">
            {file.name}
          </div>
        </div>
      )}
      {/* Delete button */}
      {!isSelectable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file.path, file.name);
          }}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          title={`Delete ${file.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      {isImage && (
        <div className="p-2 bg-black bg-opacity-50 text-white text-xs truncate bottom-0 left-0 right-0 absolute opacity-0 group-hover:opacity-100 transition-opacity">
          {file.name}
        </div>
      )}
    </div>
  );
}
