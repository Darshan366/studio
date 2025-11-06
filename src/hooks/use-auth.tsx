'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import AppHeader from '@/components/app-header';


export const AuthLayout = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isMarketingPage = pathname === '/';

  useEffect(() => {
    if (isUserLoading) return;

    // If user is logged in, and they are on a marketing/auth page, redirect to dashboard
    if (user && (isAuthPage || isMarketingPage)) {
      router.push('/dashboard');
    } 
    // If user is not logged in and not on a public page, redirect to landing
    else if (!user && !isAuthPage && !isMarketingPage) {
      router.push('/');
    }
  }, [user, isUserLoading, isAuthPage, isMarketingPage, router, pathname]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Render auth pages or landing page without the main app layout
  if (!user || isAuthPage || isMarketingPage) {
    // If we're on a protected route but the user is null (e.g., during logout), show a loader.
    if (!isAuthPage && !isMarketingPage) {
       return (
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }
    return <>{children}</>;
  }


  // Render the main app layout for authenticated users
  return (
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon" variant="sidebar" side="left">
          <AppSidebar />
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
  );
};
