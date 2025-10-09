import { useMemo } from 'react';

import {
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { Model } from '@/types/model';
import { useNavigate, useParams } from 'react-router-dom';

interface ContentLayoutProps {
  models: Model[];
  children: React.ReactNode;
}

export function ContentLayout({ models, children }: ContentLayoutProps) {
  const { modelId } = useParams();
  const navigate = useNavigate();

  const selectedModel = useMemo(
    () => models.find((model) => model.id === modelId) || null,
    [models, modelId]
  );

  const sortedModels = useMemo(
    () => [...models].sort((a, b) => a.name.localeCompare(b.name)),
    [models]
  );

  return (
    <div className="flex h-full">
      <div className="w-[12.5rem] bg-white border-r border-gray-200">
        <div className="p-2">
          <SidebarGroupLabel>Models</SidebarGroupLabel>
          <SidebarMenu>
            {sortedModels.map((model) => (
              <SidebarMenuItem key={model.id}>
                <SidebarMenuButton
                  isActive={selectedModel?.id === model.id}
                  onClick={() => navigate(`/content/${model.id}`)}
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
