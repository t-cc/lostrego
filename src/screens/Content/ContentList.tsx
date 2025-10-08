import { Button } from '@/components/ui/button';
import type { ContentItem } from '@/types/content';
import type { Model } from '@/types/model';

interface ContentListProps {
  selectedModel: Model | null;
  contentItems: ContentItem[];
  onAddNew: () => void;
  onEdit: (item: ContentItem) => void;
  onDelete: (itemId: string, item: ContentItem) => void;
}

function ContentList({
  selectedModel,
  contentItems,
  onAddNew,
  onEdit,
  onDelete,
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
      <h2 className="text-2xl font-bold mb-4">{selectedModel.name}</h2>
      <p className="text-gray-600 mb-6">{selectedModel.description}</p>

      {/* Content Items List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Content Items</h3>
            <Button onClick={onAddNew}>Add New</Button>
          </div>
        </div>
        <div className="p-4">
          {contentItems.length > 0 ? (
            <div className="space-y-2">
              {contentItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded p-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">
                        Content Item {item.id?.slice(0, 6)}...
                      </h4>
                      <p className="text-sm text-gray-500">
                        Fields: {Object.keys(item.data).length}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {item.createdAt?.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id!, item)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No content items found for this model.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export { ContentList };
