"use client";
import { PropsWithChildren } from "react";
import { Sidebar } from "@/ui/navigation/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";

function DashboardContent({ children }: PropsWithChildren) {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={currentUser ? { 
        name: `${currentUser.first_name} ${currentUser.last_name}`,
        email: currentUser.email,
        company: currentUser.company?.nombre
      } : undefined} />
      <div className={`transition-all duration-300 ease-in-out ${
        isCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      }`}>
        <main className="min-h-screen">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <DashboardContent>
        {children}
      </DashboardContent>
    </SidebarProvider>
  );
}
