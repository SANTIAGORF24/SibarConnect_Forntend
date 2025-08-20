"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button/button";
import { Card } from "@/ui/card/card";
import { ScrollArea } from "@/ui/scroll-area/scroll-area";
import { Separator } from "@/ui/separator/separator";
import { Badge } from "@/ui/badge/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar/avatar";
import { formatTime, formatLastMessage } from "@/lib/utils";

export interface ChatSidebarProps {
    chats: Array<{
        id: number;
        customer_name?: string;
        phone_number: string;
        status: 'active' | 'closed';
        priority?: 'low' | 'medium' | 'high';
        assigned_user_id?: number;
        last_message?: {
            content: string;
            timestamp?: string;
            created_at?: string;
        };
        last_message_at?: string;
    }>;
    selectedChatId?: number;
    onChatSelect: (chatId: number) => void;
    onNewChat: () => void;
    onImportChat: () => void;
    users: Array<{ id: number; first_name: string; last_name: string }>;
    loading?: boolean;
    error?: string;
    className?: string;
}

export function ChatSidebar({
    chats,
    selectedChatId,
    onChatSelect,
    onNewChat,
    onImportChat,
    users,
    loading = false,
    error,
    className,
}: ChatSidebarProps) {
    const getAssignedUserName = (assignedUserId?: number) => {
        if (!assignedUserId) return null;
        const user = users.find(u => u.id === assignedUserId);
        return user ? `${user.first_name} ${user.last_name}` : null;
    };

    const priorityIcons = {
        high: "🔴",
        medium: "🟡",
        low: "🟢",
    };

    return (
        <div className={cn("w-80 border-r border-gray-200 flex flex-col bg-white", className)}>
            {/* Header */}
            <Card variant="elevated" className="p-4 border-b border-gray-200 rounded-none">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm bg-gradient-to-br from-blue-600 to-blue-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Chats</h1>
                            <p className="text-sm text-gray-600">
                                {chats.length} conversación{chats.length !== 1 ? 'es' : ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onImportChat}
                            className="text-gray-400 hover:text-gray-600"
                            title="Importar chat"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </Button>

                        <Button
                            onClick={onNewChat}
                            variant="primary"
                            size="sm"
                            className="shadow-sm"
                            title="Nuevo chat"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Chat List */}
            <div className="flex-1">
                <ScrollArea className="h-full">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span className="ml-2 text-gray-600 text-sm">Cargando...</span>
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center">
                            <p className="text-red-600 text-sm">{error}</p>
                            <Button variant="outline" size="sm" className="mt-2">
                                Reintentar
                            </Button>
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="p-4 text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-gray-500 text-sm">No hay chats disponibles</p>
                            <p className="text-gray-400 text-xs mt-1">Los chats aparecerán cuando recibas mensajes</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-2">
                            {chats.map((chat) => {
                                const assignedUserName = getAssignedUserName(chat.assigned_user_id);
                                const isSelected = selectedChatId === chat.id;

                                return (
                                    <Card
                                        key={chat.id}
                                        variant={isSelected ? "elevated" : "default"}
                                        className={cn(
                                            "cursor-pointer transition-all duration-200 hover:shadow-md",
                                            isSelected && "ring-2 ring-blue-500 ring-offset-2",
                                            "group"
                                        )}
                                        onClick={() => onChatSelect(chat.id)}
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar */}
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src="" alt={chat.customer_name || "Cliente"} />
                                                    <AvatarFallback className="text-sm font-semibold">
                                                        {chat.customer_name ? chat.customer_name.charAt(0).toUpperCase() : "C"}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {/* Chat Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                                                            {chat.customer_name || 'Usuario desconocido'}
                                                        </h3>

                                                        <div className="flex flex-col items-end gap-1">
                                                            {/* Time */}
                                                            <span className="text-xs text-gray-500 font-medium">
                                                                {chat.last_message_at ? formatTime(chat.last_message_at) : ''}
                                                            </span>

                                                            {/* Status */}
                                                            {chat.status === 'closed' && (
                                                                <Badge variant="status" status="closed" size="sm">
                                                                    ✓
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Phone Number */}
                                                    <div className="mb-2">
                                                        <Badge variant="outline" size="sm" className="font-mono text-xs">
                                                            {chat.phone_number}
                                                        </Badge>
                                                    </div>

                                                    {/* Priority and Assignment */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {chat.priority && (
                                                            <Badge
                                                                variant="priority"
                                                                priority={chat.priority}
                                                                size="sm"
                                                                className="flex items-center gap-1"
                                                            >
                                                                {priorityIcons[chat.priority]}
                                                                {chat.priority === 'high' ? 'Alta' :
                                                                    chat.priority === 'medium' ? 'Media' : 'Baja'}
                                                            </Badge>
                                                        )}

                                                        {assignedUserName && (
                                                            <Badge variant="info" size="sm" className="flex items-center gap-1">
                                                                👤 {assignedUserName}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Last Message */}
                                                    <p className="text-xs text-gray-600 truncate leading-tight">
                                                        {chat.last_message ? formatLastMessage(chat.last_message.content) : 'Sin mensajes'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Hover Effect */}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50" />
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
