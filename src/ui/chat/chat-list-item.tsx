"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar/avatar";
import { Badge } from "@/ui/badge/badge";
import { Card } from "@/ui/card/card";
import { formatTime, formatLastMessage } from "@/lib/utils";

export interface ChatListItemProps {
    chat: {
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
    };
    assignedUserName?: string;
    isSelected?: boolean;
    onClick?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
}

export function ChatListItem({
    chat,
    assignedUserName,
    isSelected = false,
    onClick,
    onContextMenu
}: ChatListItemProps) {
    const priorityColors = {
        high: "bg-red-100 text-red-800 border-red-200",
        medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
        low: "bg-green-100 text-green-800 border-green-200",
    };

    const priorityIcons = {
        high: "🔴",
        medium: "🟡",
        low: "🟢",
    };

    return (
        <Card
            variant={isSelected ? "elevated" : "default"}
            className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "ring-2 ring-blue-500 ring-offset-2",
                "group"
            )}
            onClick={onClick}
            onContextMenu={onContextMenu}
        >
            <div className="flex items-center gap-4 p-4">
                {/* Avatar */}
                <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={chat.customer_name || "Cliente"} />
                    <AvatarFallback className="text-lg font-semibold">
                        {chat.customer_name ? chat.customer_name.charAt(0).toUpperCase() : "C"}
                    </AvatarFallback>
                </Avatar>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
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
                                    ✓ Cerrado
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
                    <p className="text-sm text-gray-600 truncate leading-tight">
                        {chat.last_message ? formatLastMessage(chat.last_message.content) : 'Sin mensajes'}
                    </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50" />
            </div>
        </Card>
    );
}
