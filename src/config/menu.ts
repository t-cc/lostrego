import type { MenuItem } from '@/types/layout';
import { Box, FileText, Home, Image } from 'lucide-react';

// Menu configuration - easily modify this array to add/remove menu items
export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileText,
    href: '/content',
  },
  {
    id: 'media',
    label: 'Media',
    icon: Image,
    href: '/media',
  },
  {
    id: 'models',
    label: 'Models',
    icon: Box,
    href: '/models',
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
