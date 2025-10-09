import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ContentItem } from '@/types/content';
import type { Model } from '@/types/model';

interface ContentListProps {
  selectedModel: Model | null;
  contentItems: ContentItem[];
  onAddNew: () => void;
  onEdit: (item: ContentItem) => void;
}

export function ContentTable({
  selectedModel,
  contentItems,
  onAddNew,
  onEdit,
}: ContentListProps) {
  if (!selectedModel) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Select a model to manage content</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-8">
        <div className=" mr-auto ">
          <h2 className="text-2xl font-bold mb-4">{selectedModel.name}</h2>
          {selectedModel.description ? (
            <p className="text-gray-600 mb-6">{selectedModel.description}</p>
          ) : null}
        </div>
        <Button onClick={onAddNew}>Add New</Button>
      </div>
      {/* Content Items List */}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Fields Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contentItems.length > 0 ? (
            contentItems.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => onEdit(item)}
                className="cursor-pointer"
              >
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.createdAt?.toLocaleDateString()}</TableCell>
                <TableCell>{Object.keys(item.data).length}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                No content items found for this model.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
