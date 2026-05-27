import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  children?: MenuItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface LayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}
