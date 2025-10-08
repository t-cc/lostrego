import { useEffect, useRef, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { menuItems } from '@/config/menu';
import { storage } from '@/lib/firebase';
import type { User } from '@/types/auth';
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Upload as UploadIcon,
} from 'lucide-react';

interface MediaFile {
  name: string;
  url?: string;
  path: string;
}

interface MediaProps {
  user: User;
}

export default function Media({ user }: MediaProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        const storageRef = ref(storage);
        const result = await listAll(storageRef);
        const mediaFiles: MediaFile[] = await Promise.all(
          result.items.map(async (item) => {
            const url = await getDownloadURL(item);
            return {
              name: item.name,
              url,
              path: item.fullPath,
            };
          })
        );
        setFiles(mediaFiles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const totalPages = Math.ceil(files.length / pageSize);
  const displayedFiles = files.slice(page * pageSize, (page + 1) * pageSize);

  const goToPrevPage = () => setPage((p) => Math.max(0, p - 1));
  const goToNextPage = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (fileList: FileList) => {
    const filesArray = Array.from(fileList);
    setUploading(true);
    setUploadProgress({});

    try {
      const uploadPromises = filesArray.map(async (file) => {
        const storageRef = ref(storage, file.name);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: progress,
              }));
            },
            reject,
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then(resolve);
            }
          );
        });
      });

      await Promise.all(uploadPromises);
      // Refetch files
      const storageRef = ref(storage);
      const result = await listAll(storageRef);
      const mediaFiles: MediaFile[] = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return {
            name: item.name,
            url,
            path: item.fullPath,
          };
        })
      );
      setFiles(mediaFiles);
      setPage(0); // Reset to first page
    } catch (err) {
      console.error('Upload error:', err);
      setError('Error uploading files');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const deleteFile = async (filePath: string, fileName: string) => {
    if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
        // Remove from local state
        setFiles((prev) => prev.filter((f) => f.path !== filePath));
      } catch (err) {
        console.error('Delete error:', err);
        alert('Error deleting file');
      }
    }
  };

  return (
    <Layout menuItems={menuItems} user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media</h1>
          <p className="text-gray-600">Firebase bucket multimedia content.</p>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-lg font-semibold text-gray-900">
              {dragActive
                ? 'Drop files here'
                : 'Drag and drop files or click to select'}
            </p>
            <p className="text-sm text-gray-600">
              Upload images, videos or other multimedia files
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleChange}
            accept="image/*,video/*,*/*"
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div
                key={fileName}
                className="w-full bg-gray-200 rounded-full h-2"
              >
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
                <span className="text-sm text-gray-700">
                  {fileName}: {Math.round(progress)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {displayedFiles.map((file) => (
                <div
                  key={file.path}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer relative"
                >
                  {file.url && (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  )}
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.path, file.name);
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={`Delete ${file.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-2 bg-black bg-opacity-50 text-white text-xs truncate bottom-0 left-0 right-0 absolute opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                <div className="flex items-center">
                  <button
                    onClick={goToPrevPage}
                    disabled={page === 0}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Page {page + 1} of {totalPages}
                  </span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={goToNextPage}
                    disabled={page === totalPages - 1}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
