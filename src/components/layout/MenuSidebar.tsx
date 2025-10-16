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
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { MenuItem } from '@/types/layout';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { SiteSwitcher } from '../ui/site-switcher';
import { NavUser } from './NavUser';

interface MenuSidebarProps {
  menuItems: MenuItem[];
  user: User;
}

export default function MenuSidebar({ menuItems, user }: MenuSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuClick = async (item: MenuItem) => {
    if (item.id === 'content') {
      // Special handling for Content link - fetch models and navigate directly
      try {
        const models = await modelService.getAll();
        if (models.length > 0) {
          const sorted = [...models].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          navigate(`/content/${sorted[0].id}`);
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error(error);
        navigate('/dashboard');
      }
    } else if (item.onClick) {
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
                  {item.href && item.id !== 'content' ? (
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
