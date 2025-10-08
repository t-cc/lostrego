import { SidebarTrigger } from '@/components/ui/sidebar';

export default function TopBar() {
  return (
    <header className="flex h-16 items-center justify-start border-b bg-background px-6">
      <SidebarTrigger />
    </header>
  );
}
