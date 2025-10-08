import { SidebarProvider } from '@/components/ui/sidebar';
import type { User } from '@/types/auth';
import type { LayoutProps, MenuItem } from '@/types/layout';

import MenuSidebar from './MenuSidebar';
import TopBar from './TopBar';

interface AppLayoutProps extends LayoutProps {
  menuItems: MenuItem[];
  user: User;
}

export default function Layout({ children, menuItems, user }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MenuSidebar menuItems={menuItems} user={user} />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 p-6 bg-gray-50/50">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
