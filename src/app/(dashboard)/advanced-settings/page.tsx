"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/ui/card/card";
import { CompanyManagement } from "./components/CompanyManagement";
import { RoleManagement } from "./components/RoleManagement";
import { UserManagement } from "./components/UserManagement";

type Section = "companies" | "roles" | "users" | "system";

export default function AdvancedSettingsPage() {
  const router = useRouter();
  const { currentUser, isReady } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("companies");

  useEffect(() => {
    if (!isReady) return;
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    if (!currentUser.is_super_admin) {
      router.replace("/dashboard");
    }
  }, [currentUser, router, isReady]);

  if (!isReady) return <div>Cargando...</div>;
  if (!currentUser || !currentUser.is_super_admin) return null;

  const sections = [
    {
      id: "companies" as Section,
      title: "Gestión de Empresas",
      description: "Administra las empresas del sistema",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: "roles" as Section,
      title: "Gestión de Roles",
      description: "Administra roles y permisos",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.25-1.955a2.25 2.25 0 00-1.07 1.916v.75c0 .621.504 1.125 1.125 1.125H16.5a9 9 0 01-2.25-8.25 9 9 0 00-10.125 8.25H5.625c.621 0 1.125-.504 1.125-1.125v-.75a2.25 2.25 0 00-1.07-1.916" />
        </svg>
      ),
    },
    {
      id: "users" as Section,
      title: "Gestión de Usuarios",
      description: "Administra usuarios del sistema",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      id: "system" as Section,
      title: "Configuración del Sistema",
      description: "Configuraciones generales",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "companies":
        return <CompanyManagement />;
      case "roles":
        return <RoleManagement />;
      case "users":
        return <UserManagement />;
      case "system":
        return (
          <Card title="Configuración del Sistema" subtitle="Próximamente disponible">
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-foreground/60">Esta sección estará disponible próximamente</p>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Configuración Avanzada</h1>
          <p className="text-blue-100">Administra el sistema y sus configuraciones principales</p>
        </div>

        {/* Navigation Tabs */}
        <Card className="p-0 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeSection === section.id
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-foreground/70 hover:text-foreground hover:bg-gray-50"
                }`}
              >
                <span className={activeSection === section.id ? "text-blue-600" : "text-foreground/50"}>
                  {section.icon}
                </span>
                <div className="text-left">
                  <div className="font-semibold">{section.title}</div>
                  <div className="text-xs text-foreground/50">{section.description}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Content */}
        <div className="pb-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}


