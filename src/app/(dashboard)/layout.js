'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/layout/Sidebar';
import AppHeader from '@/components/layout/Header';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-w-full min-h-screen">
          <AppSidebar />
          <div className="flex-1 w-full">
            <AppHeader />
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 