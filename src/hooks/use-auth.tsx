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


  useEffect(() => {
    if (isUserLoading) return;

    if (user) {
        // If user is logged in, and they are on a marketing/auth page, redirect to dashboard
        if (isAuthPage || isMarketingPage || isSignUpPage) {
            router.push('/dashboard');
        }
    } else {
        // If user is not logged in and not on a public/auth page, redirect to landing
        if (!isAuthPage && !isMarketingPage && !isSignUpPage) {
            router.push('/');
        }
    }
  }, [user, isUserLoading, isAuthPage, isMarketingPage, isSignUpPage, router, pathname]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Render pages that don't need the main app layout
  if (!user && (isAuthPage || isMarketingPage || isSignUpPage)) {
    return <>{children}</>;
  }

  // If user is logged in, show the main app layout
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
  
  // Fallback for edge cases, e.g. non-logged-in user on a protected route momentarily
  return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
  );
};
