'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/app/context/SessionContext';
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Calendar,
  Wallet,
  Settings,
  LogOut,
  MenuSquare,
  ChevronDown,
} from "lucide-react";
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState } from 'react';

const adminMenuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/staff', label: 'Staff Management', icon: Users },
  { path: '/admin/inventory', label: 'Inventory', icon: Package },
  {
    label: 'Reports',
    icon: BarChart3,
    isDropdown: true,
    items: [
      { path: '/admin/reports/expenses', label: 'Expenses Report' },
      { path: '/admin/reports/staff', label: 'Staff Report' },
      { path: '/admin/reports/cashlog', label: 'Cash Log Report' },
      { path: '/admin/reports/customers', label: 'Customer Report' },
    ]
  }
];

const staffMenuItems = [
  { path: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/staff/booking', label: 'Bookings', icon: Calendar },
  { path: '/staff/cashlog', label: 'Cash Log', icon: Wallet },
  { path: '/staff/inventory', label: 'Inventory', icon: Package }
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useSession();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';
  const items = isAdmin ? adminMenuItems : staffMenuItems;
  const { theme } = useTheme();
  const [openDropdown, setOpenDropdown] = useState('');

  console.log(user)
  console.log(isAdmin)

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-3">
        <div className="flex items-center gap-2">
          <Image
            src={theme === 'light' ? '/dark-logo.png' : '/light-logo.png'}
            width={30}
            height={50}
            alt='Game Ground'
          />
          <span className="font-semibold">Game Ground</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8.5rem)]">
          <div className="space-y-4 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-6">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const Icon = item.icon;

                    if (item.isDropdown) {
                      const isActive = pathname.includes('/admin/reports');
                      const isOpen = openDropdown === 'reports';

                      return (
                        <div key={item.label}>
                          <SidebarMenuItem>
                            <button
                              onClick={() => setOpenDropdown(isOpen ? '' : 'reports')}
                              className={cn(
                                "flex w-full items-center justify-between gap-3 rounded-lg px-6 py-2 text-sm font-medium",
                                isActive
                                  ? "bg-secondary text-secondary-foreground"
                                  : "hover:bg-secondary/50"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isOpen && "rotate-180"
                                )}
                              />
                            </button>
                          </SidebarMenuItem>

                          {isOpen && (
                            <SidebarMenuSub>
                              {item.items.map((subItem) => {
                                const isSubActive = pathname === subItem.path;
                                return (
                                  <SidebarMenuSubItem key={subItem.path}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isSubActive}
                                    >
                                      <Link href={subItem.path}>
                                        {subItem.label}
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          )}
                        </div>
                      );
                    }

                    const isActive = pathname === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <Link
                          href={item.path}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-6 py-2 text-sm font-medium",
                            isActive
                              ? "bg-secondary text-secondary-foreground"
                              : "hover:bg-secondary/50"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="mx-6" />

            <SidebarGroup>
              <SidebarGroupLabel className="px-6">Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-3 rounded-lg px-6 py-2 text-sm font-medium hover:bg-secondary/50"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-lg px-6 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t p-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium leading-none">{user?.username}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

