import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import AppHeader from '@/components/app-header';

export const metadata: Metadata = {
  title: 'GymFlow',
  description: 'Your modern gym and fitness companion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
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
        <Toaster />
      </body>
    </html>
  );
}
