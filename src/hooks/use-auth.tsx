
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
  
  const isAuthPage = pathname === '/login';
  const isSignUpPage = pathname === '/signup';
  const isMarketingPage = pathname === '/';
  const isPublicPage = isAuthPage || isSignUpPage || isMarketingPage;


  useEffect(() => {
    // Wait until Firebase has finished loading the user's authentication state.
    if (isUserLoading) {
      return; // Do nothing until we know if the user is logged in or not.
    }

    if (user && isPublicPage) {
        // User is logged in but on a public page, redirect to the dashboard.
        router.push('/dashboard');
    } else if (!user && !isPublicPage) {
        // User is not logged in and is on a protected page, redirect to the landing page.
        router.push('/');
    }
  }, [user, isUserLoading, isPublicPage, router, pathname]);

  // While loading, or if a redirect is imminent, show a loader.
  // This prevents rendering a page flash before the redirect happens.
  if (isUserLoading || (user && isPublicPage) || (!user && !isPublicPage)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is logged in and on a protected page, show the app layout
  if (user) {
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
  }
  
  // For non-logged-in users on a public page, show the page content.
  return <>{children}</>;
};
