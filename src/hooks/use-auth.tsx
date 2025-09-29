// src/hooks/use-auth.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAuthChange = useCallback(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Create a new user object to force re-render
      const refreshedUser = { ...currentUser } as User;
      // You may need to manually copy over properties if they are not enumerable
      Object.assign(refreshedUser, currentUser);
      setUser(refreshedUser);
    } else {
        setUser(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      unsubscribe();
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [handleAuthChange]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  const { loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (loading) return;

    if (user && isAuthPage) {
      router.push('/');
    } else if (!user && !isAuthPage) {
      router.push('/login');
    }
  }, [user, loading, isAuthPage, router, pathname]);

  if (loading || (!user && !isAuthPage) || (user && isAuthPage)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};
