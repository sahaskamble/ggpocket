import { AppSidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminLayout({ children }) {
  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            {children}
        </SidebarInset>
    </SidebarProvider>
  );
}