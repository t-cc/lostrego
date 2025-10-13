import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useSite } from '@/context/SiteContext';
import type { Site } from '@/types/site';
import { ChevronsUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function DefaultLogo() {
  return (
    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
      <span className="text-xs font-bold">S</span>
    </div>
  );
}

function SiteLogo({ site }: { site: Site }) {
  if (site.logo) {
    return (
      <img
        src={`data:image;base64,${site.logo}`}
        alt={`${site.name} logo`}
        className="aspect-square size-8 rounded-lg object-cover"
      />
    );
  }

  return <DefaultLogo />;
}

export function SiteSwitcher() {
  const { isMobile } = useSidebar();
  const { sites, currentSite, setCurrentSite, loading, error } = useSite();
  const navigate = useNavigate();

  const handleSiteChange = (site: Site) => {
    setCurrentSite(site);
    navigate('/dashboard');
  };

  React.useEffect(() => {
    // If no current site is selected and we have sites, select the first one
    if (!currentSite && sites.length > 0) {
      setCurrentSite(sites[0]);
    }
  }, [sites, currentSite, setCurrentSite]);

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="aspect-square size-8 animate-pulse rounded-lg bg-gray-200" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="animate-pulse rounded bg-gray-200 text-xs">
                Loading sites...
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (error || sites.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <DefaultLogo />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {error ? 'Error loading sites' : 'No sites available'}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const activeSite = currentSite || sites[0];

  if (!activeSite) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <SiteLogo site={activeSite} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeSite.name}</span>
                <span className="truncate text-xs font-mono">
                  {activeSite.appId || 'Site'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Sites
            </DropdownMenuLabel>
            {sites.map((site, index) => (
              <DropdownMenuItem
                key={site.id || index}
                onClick={() => handleSiteChange(site)}
                className="gap-2 p-2"
              >
                <SiteLogo site={site} />
                <span>{site.name}</span>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
