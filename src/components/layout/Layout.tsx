import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import type { User } from '@/types/auth';
import type { LayoutProps, MenuItem } from '@/types/layout';
import { Link } from 'react-router-dom';

import MenuSidebar from './MenuSidebar';

interface AppLayoutProps extends LayoutProps {
  menuItems: MenuItem[];
  user: User;
  actions?: React.ReactNode;
}

export default function Layout({
  children,
  menuItems,
  user,
  breadcrumbs,
  actions,
}: AppLayoutProps) {
  return (
    <SidebarProvider>
      <MenuSidebar menuItems={menuItems} user={user} />
      <SidebarInset>
        <header className="bg-background sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs ? (
                  breadcrumbs.map((item, index) => (
                    <>
                      <BreadcrumbItem key={index}>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage className="line-clamp-1">
                            {item.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={item.href!}>{item.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator key={'separator-' + index} />
                      )}
                    </>
                  ))
                ) : (
                  <BreadcrumbItem key={'home'}>
                    <BreadcrumbPage className="line-clamp-1">
                      Home
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {actions && (
            <div className="flex items-center gap-2 px-3">{actions}</div>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
