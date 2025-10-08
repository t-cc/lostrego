import type { MenuItem } from '@/types/layout';
import { BarChart3, FileText, Home, Settings, Users } from 'lucide-react';

// Menu configuration - easily modify this array to add/remove menu items
export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    onClick: () => {
      console.log('Navigate to dashboard');
    },
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileText,
    onClick: () => {
      console.log('Navigate to content management');
    },
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    onClick: () => {
      console.log('Navigate to user management');
    },
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    onClick: () => {
      console.log('Navigate to analytics');
    },
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    onClick: () => {
      console.log('Navigate to settings');
    },
  },
];

// You can easily add more menu items by adding objects to this array
// You can find more Lucide icons at: https://lucide.dev/icons/
// Example:
// {
//   id: 'new-feature',
//   label: 'New Feature',
//   icon: Star, // imported from lucide-react
//   onClick: () => console.log('Navigate to new feature'),
// },
