'use client';

import { Dumbbell } from 'lucide-react';
import { SidebarHeader } from '@/components/ui/sidebar';
import AppSidebarNav from './app-sidebar-nav';
import { useUser } from '@/firebase';

export default function AppSidebar() {
  const { user } = useUser();
  if (!user) return null;
  
  return (
    <>
      <SidebarHeader className="border-b">
        <div className="group/sidebar-item flex h-12 w-full min-w-0 items-center gap-3 rounded-md p-2 text-foreground">
          <Dumbbell className="size-6 shrink-0 text-primary" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-lg font-semibold">GymFlow</p>
          </div>
        </div>
      </SidebarHeader>
      <div className="flex-1 overflow-y-auto">
        <AppSidebarNav />
      </div>
    </>
  );
}
