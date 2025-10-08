import { Button } from '@/components/ui/button';
import type { Model } from '@/types/model';

interface ModelsSidebarProps {
  models: Model[];
  selectedModel: Model | null;
  onSelectModel: (model: Model) => void;
}

function ModelsSidebar({
  models,
  selectedModel,
  onSelectModel,
}: ModelsSidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4">Models</h3>
      <div className="space-y-2">
        {models.map((model) => (
          <Button
            key={model.id}
            variant="ghost"
            onClick={() => onSelectModel(model)}
            className={`w-full justify-start px-3 py-2 hover:bg-gray-50 ${
              selectedModel?.id === model.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700'
            }`}
          >
            {model.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

export { ModelsSidebar };
