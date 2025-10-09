import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Model } from '@/types/model';
import { useNavigate } from 'react-router-dom';

interface ModelListProps {
  models: Model[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function ModelList({ models, loading, error, onRetry }: ModelListProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Button onClick={onRetry} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No models registered.</p>
        <p className="text-sm text-gray-400 mt-1">
          Create your first model using the "New Model" button.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models.map((model) => (
          <TableRow key={model.id}>
            <TableCell>
              <button
                className="text-blue-600 hover:text-blue-800 hover:underline"
                onClick={() => navigate(`/models/${model.id}`)}
              >
                {model.name}
              </button>
            </TableCell>
            <TableCell>
              {model.createdAt ? model.createdAt.toLocaleDateString() : ''}
            </TableCell>
            <TableCell>
              {model.updatedAt ? model.updatedAt.toLocaleDateString() : ''}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
