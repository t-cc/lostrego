import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import type { User } from '@/types/auth';
import type { MenuItem } from '@/types/layout';
import { Link, useLocation } from 'react-router-dom';

import { SiteSwitcher } from '../ui/site-switcher';
import { NavUser } from './NavUser';

interface MenuSidebarProps {
  menuItems: MenuItem[];
  user: User;
}

export default function MenuSidebar({ menuItems, user }: MenuSidebarProps) {
  const location = useLocation();

  const handleMenuClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SiteSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = item.href
                ? location.pathname.startsWith(item.href)
                : false;
              return (
                <SidebarMenuItem key={item.id}>
                  {item.href ? (
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleMenuClick(item)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
