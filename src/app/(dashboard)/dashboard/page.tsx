"use client";

import { useEffect, useState } from "react";
import { Card } from "@/ui/card/card";
import { api, ChatWithLastMessageDTO } from "@/api";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chatsActive, setChatsActive] = useState(0);
  const [templatesCount, setTemplatesCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [recentChats, setRecentChats] = useState<ChatWithLastMessageDTO[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!currentUser?.company_id) {
        setCompanyCount(0);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setCompanyCount(1);
        const [activeChats, allChats, templates] = await Promise.all([
          api.chats.list(currentUser.company_id, { status: "active" }),
          api.chats.list(currentUser.company_id, { last_days: 30 }),
          api.templates.list(currentUser.company_id),
        ]);
        setChatsActive(activeChats.length);
        setTemplatesCount(Array.isArray(templates) ? templates.length : 0);
        const sorted = [...allChats]
          .sort((a, b) => new Date(b.last_message_time || b.last_message_at || "").getTime() - new Date(a.last_message_time || a.last_message_at || "").getTime())
          .slice(0, 3);
        setRecentChats(sorted);
      } catch {
        setChatsActive(0);
        setTemplatesCount(0);
        setRecentChats([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser?.company_id]);

  const formatRelative = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const diff = Date.now() - d.getTime();
      const m = Math.round(diff / 60000);
      if (m < 1) return "Hace un momento";
      if (m < 60) return `Hace ${m} min`;
      const h = Math.round(m / 60);
      if (h < 24) return `Hace ${h} h`;
      const dts = Math.round(h / 24);
      return `Hace ${dts} d`;
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bienvenido a tu panel de control de SibarConnect</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : chatsActive}</p>
              <p className="text-sm text-gray-600">Chats Activos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : templatesCount}</p>
              <p className="text-sm text-gray-600">Templates</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : recentChats.length}</p>
              <p className="text-sm text-gray-600">Eventos Recientes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : companyCount}</p>
              <p className="text-sm text-gray-600">Empresa</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Actividad Reciente" className="h-fit">
          <div className="space-y-4">
            {recentChats.length === 0 ? (
              <div className="text-sm text-gray-500">Sin actividad reciente</div>
            ) : recentChats.map((c) => (
              <div key={c.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{c.customer_name || c.phone_number}</p>
                  <p className="text-xs text-gray-500">{formatRelative(c.last_message_time || c.last_message_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Accesos Rápidos" className="h-fit">
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-200 group">
              <div className="text-center space-y-2">
                <svg className="w-8 h-8 mx-auto text-gray-400 group-hover:text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm font-medium text-gray-600 group-hover:text-[var(--color-primary)]">Nuevo Chat</p>
              </div>
            </button>

            <button className="p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-200 group">
              <div className="text-center space-y-2">
                <svg className="w-8 h-8 mx-auto text-gray-400 group-hover:text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-600 group-hover:text-[var(--color-primary)]">Crear Template</p>
              </div>
            </button>

            <button className="p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-200 group">
              <div className="text-center space-y-2">
                <svg className="w-8 h-8 mx-auto text-gray-400 group-hover:text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-sm font-medium text-gray-600 group-hover:text-[var(--color-primary)]">Consultar IA</p>
              </div>
            </button>

            <button className="p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-200 group">
              <div className="text-center space-y-2">
                <svg className="w-8 h-8 mx-auto text-gray-400 group-hover:text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-600 group-hover:text-[var(--color-primary)]">Configurar</p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}


