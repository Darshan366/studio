'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';


export const AuthLayout = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (isUserLoading) return;

    if (user && isAuthPage) {
      router.push('/');
    } else if (!user && !isAuthPage) {
      router.push('/login');
    }
  }, [user, isUserLoading, isAuthPage, router, pathname]);

  if (isUserLoading || (!user && !isAuthPage) || (user && isAuthPage)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};
