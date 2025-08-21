"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/ui/scroll-area/scroll-area";
import { ChatMessage } from "./chat-message";
import { formatDate } from "@/lib/utils";

export interface ChatMessagesProps {
    messages: Array<{
        id: number;
        content?: string;
        message_type: string;
        direction: 'incoming' | 'outgoing';
        timestamp?: string;
        created_at?: string;
        status?: 'sent' | 'delivered' | 'read';
        attachment_url?: string;
    }>;
    customerName?: string;
    customerPhone?: string;
    loading?: boolean;
    className?: string;
}

export function ChatMessages({
    messages,
    customerName,
    customerPhone,
    loading = false,
    className,
}: ChatMessagesProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600 text-sm">Cargando mensajes...</span>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500">No hay mensajes en esta conversación</p>
                <p className="text-gray-400 text-sm mt-1">Envía el primer mensaje para comenzar</p>
            </div>
        );
    }

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message, index) => {
        const messageTime = message.timestamp || message.created_at;
        const dateKey = messageTime ? formatDate(messageTime) : 'Unknown';

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }

        groups[dateKey].push({
            ...message,
            showDate: index === 0 ||
                formatDate(messageTime) !== formatDate(messages[index - 1].timestamp || messages[index - 1].created_at)
        });

        return groups;
    }, {} as Record<string, Array<any>>);

    return (
        <ScrollArea className={cn("flex-1 p-4", className)}>
            <div className="space-y-4">
                {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
                    <div key={dateKey} className="space-y-2">
                        {dateMessages.map((message, index) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                customerName={customerName}
                                customerPhone={customerPhone}
                                showDate={message.showDate}
                                dateLabel={dateKey}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
