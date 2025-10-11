import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

import FileGrid from './FileGrid';
import Pagination from './Pagination';
import UploadArea from './UploadArea';
import UploadProgress from './UploadProgress';
import type { MediaFile } from './types';

interface MediaProps {
  user: User;
  isPopup?: boolean;
  onSelect?: (file: MediaFile) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Media({
  user,
  isPopup = false,
  onSelect,
  open,
  onOpenChange,
}: MediaProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 12;
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [dragActive, setDragActive] = useState(false);

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

  const content = (
    <div className="space-y-6 py-2 px-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Media</h1>
        <p className="text-gray-600">Firebase bucket multimedia content.</p>
      </div>

      {/* Upload Area */}
      <UploadArea
        dragActive={dragActive}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onButtonClick={() => {}}
        onChange={handleChange}
      />

      {/* Upload Progress */}
      {uploading && <UploadProgress progress={uploadProgress} />}

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
          <FileGrid
            files={displayedFiles}
            onDelete={deleteFile}
            onSelect={onSelect}
            isSelectable={isPopup}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPrevPage={goToPrevPage}
            onNextPage={goToNextPage}
          />
        </>
      )}
    </div>
  );

  if (isPopup) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Media</DialogTitle>
            <DialogDescription>
              Choose an image or media file to use as an asset.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  const breadcrumbs = [{ label: 'Media' }];
  return (
    <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
      {content}
    </Layout>
  );
}
