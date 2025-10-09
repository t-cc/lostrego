import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { Model } from '@/types/model';
import { Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface ModelsLayoutProps {
  models: Model[];
  children: React.ReactNode;
}

export function ModelsLayout({ models, children }: ModelsLayoutProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedModel = useMemo(
    () => models.find((model) => model.id === id) || null,
    [models, id]
  );

  const sortedModels = useMemo(
    () => [...models].sort((a, b) => a.name.localeCompare(b.name)),
    [models]
  );

  const handleAddNew = () => {
    navigate('/models/add');
  };

  return (
    <div className="flex h-full">
      <div className="w-[12.5rem] bg-white border-r border-gray-200">
        <div className="p-2">
          <div className="flex justify-between items-center mb-2">
            <SidebarGroupLabel>Models</SidebarGroupLabel>
            <Button size="icon-sm" variant="outline" onClick={handleAddNew}>
              <Plus />
            </Button>
          </div>
          <SidebarMenu>
            {sortedModels.map((model) => (
              <SidebarMenuItem key={model.id}>
                <SidebarMenuButton
                  isActive={selectedModel?.id === model.id}
                  onClick={() => navigate(`/models/${model.id}`)}
                >
                  {model.name}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </div>
      <div className="flex-1 py-2 px-4">{children}</div>
    </div>
  );
}
