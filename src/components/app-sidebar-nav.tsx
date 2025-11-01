'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Utensils,
  Calendar,
  BarChart3,
  Bot,
  Settings,
  Users,
  MessageSquare,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/meal-planner', label: 'Meal Planner', icon: Utensils },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/matching', label: 'Matching', icon: Users },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/ai-suggestions', label: 'AI Suggestions', icon: Bot },
];

const settingsNav = {
  href: '/settings',
  label: 'Settings',
  icon: Settings,
};

export default function AppSidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="flex h-full flex-col justify-between">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive(item.href)}
              tooltip={{ children: item.label, side: 'right', align: 'center' }}
            >
              <Link href={item.href}>
                <item.icon className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive(settingsNav.href)}
            tooltip={{
              children: settingsNav.label,
              side: 'right',
              align: 'center',
            }}
          >
            <Link href={settingsNav.href}>
              <settingsNav.icon className="shrink-0" />
              <span className="truncate">{settingsNav.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
