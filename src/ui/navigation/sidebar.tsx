"use client";
import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarLogo } from "@/ui/brand/sidebar-logo";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAuth } from "@/contexts/auth-context";

// Iconos SVG
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ChatPersonalIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12h2m-2 0h-2m2 0v2" />
  </svg>
);

const TemplatesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AIIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const CompanyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    company?: string;
  };
}

type NavItem = { name: string; href: string; icon: () => ReactElement; requiresSuper?: boolean };

const navigationItems: ReadonlyArray<NavItem> = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { name: "Chats Generales", href: "/chats", icon: ChatIcon },
  { name: "Mis Chats", href: "/my-chats", icon: ChatPersonalIcon },
  { name: "Templates", href: "/templates", icon: TemplatesIcon },
  { name: "IA", href: "/ai", icon: AIIcon },
  { name: "Empresa", href: "/company", icon: CompanyIcon },
  { name: "Configuración", href: "/settings", icon: SettingsIcon },
  { name: "Configuración avanzada", href: "/advanced-settings", icon: SettingsIcon, requiresSuper: true },
];

export function Sidebar({ user }: SidebarProps) {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white shadow-lg border border-gray-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 shadow-xl
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
        w-72
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center p-4 border-b border-gray-100 ${
            isCollapsed ? 'lg:flex-col lg:space-y-2 lg:justify-center' : 'justify-between'
          }`}>
            <div className={`flex items-center space-x-3 transition-all duration-300 ${isCollapsed ? 'lg:justify-center' : ''}`}>
              <SidebarLogo />
              {!isCollapsed && (
                <span className="text-lg font-bold text-[var(--color-primary)] hidden lg:block transition-opacity duration-300">
                  SibarConnect
                </span>
              )}
              {/* Mobile - always show brand name */}
              <span className="text-lg font-bold text-[var(--color-primary)] lg:hidden">
                SibarConnect
              </span>
            </div>
            
            {/* Collapse button - Desktop only */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
              title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>

            {/* Close button - Mobile only */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className={`p-4 border-b border-gray-100 transition-all duration-300 ${isCollapsed ? 'lg:px-2' : ''}`}>
              <div className={`flex items-center space-x-3 transition-all duration-300 ${isCollapsed ? 'lg:justify-center lg:flex-col lg:space-x-0 lg:space-y-2' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserIcon />
                  )}
                </div>
                {(!isCollapsed) && (
                  <div className="flex-1 min-w-0 hidden lg:block">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    {user.company && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{user.company}</p>
                    )}
                  </div>
                )}
                {/* Mobile - always show user info */}
                <div className="flex-1 min-w-0 lg:hidden">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  {user.company && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user.company}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems
              .filter((item) => {
                if (item.requiresSuper) return !!currentUser?.is_super_admin;
                const allowed = currentUser?.role?.is_admin || currentUser?.is_super_admin
                  ? true
                  : (currentUser?.role?.allowed_paths || []).includes(item.href);
                return allowed;
              })
              .map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-[var(--color-primary)] text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                      ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                    `}
                    onClick={() => setIsMobileOpen(false)}
                    title={isCollapsed ? item.name : ''}
                  >
                    <Icon />
                    {(!isCollapsed) && (
                      <span className="hidden lg:block">{item.name}</span>
                    )}
                    {/* Mobile - always show text */}
                    <span className="lg:hidden">{item.name}</span>
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full top-2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 hidden lg:block">
                      {item.name}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <div className="relative group">
              <button
                onClick={handleLogout}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 w-full
                  ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                `}
                title={isCollapsed ? 'Cerrar Sesión' : ''}
              >
                <LogoutIcon />
                {(!isCollapsed) && (
                  <span className="hidden lg:block">Cerrar Sesión</span>
                )}
                {/* Mobile - always show text */}
                <span className="lg:hidden">Cerrar Sesión</span>
              </button>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full bottom-2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 hidden lg:block">
                  Cerrar Sesión
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
