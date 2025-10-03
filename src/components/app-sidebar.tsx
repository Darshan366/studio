'use client';

import { Dumbbell, LogOut, Settings, User } from 'lucide-react';
import { SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import AppSidebarNav from './app-sidebar-nav';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

function UserMenu() {
    const { user } = useUser();
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
                <SidebarMenuButton className="w-full justify-start h-auto p-2" size="lg">
                     <Avatar className="h-8 w-8">
                        {user?.photoURL ? (
                        <AvatarImage
                            src={user.photoURL}
                            alt={user.displayName || 'User avatar'}
                        />
                        ) : (
                        <AvatarImage
                            src="https://picsum.photos/seed/user-avatar/200/200"
                            alt="User avatar"
                            data-ai-hint="person portrait"
                        />
                        )}
                        <AvatarFallback>{user?.displayName?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start min-w-0 overflow-hidden">
                        <p className="truncate font-medium">{user.displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/settings">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

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
       <div className="p-2 border-t">
          <UserMenu />
      </div>
    </>
  );
}
