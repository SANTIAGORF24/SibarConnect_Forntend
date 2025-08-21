"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar/avatar";
import { Badge } from "@/ui/badge/badge";
import { Card } from "@/ui/card/card";
import { formatTime } from "@/lib/utils";

export interface ChatMessageProps {
    message: {
        id: number;
        content?: string;
        message_type: string;
        direction: 'incoming' | 'outgoing';
        timestamp?: string;
        created_at?: string;
        status?: 'sent' | 'delivered' | 'read';
        attachment_url?: string;
    };
    customerName?: string;
    customerPhone?: string;
    isLastInGroup?: boolean;
    showDate?: boolean;
    dateLabel?: string;
}

export function ChatMessage({
    message,
    customerName,
    customerPhone,
    isLastInGroup = false,
    showDate = false,
    dateLabel
}: ChatMessageProps) {
    const messageTime = message.timestamp || message.created_at;
    const isOutgoing = message.direction === 'outgoing';

    return (
        <div className="space-y-2">
            {/* Date Separator */}
            {showDate && dateLabel && (
                <div className="flex justify-center my-4">
                    <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                        {dateLabel}
                    </Badge>
                </div>
            )}

            {/* Message */}
            <div className={cn(
                "flex gap-3",
                isOutgoing ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Avatar */}
                {!isOutgoing && (
                    <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src="" alt={customerName || "Cliente"} />
                        <AvatarFallback>
                            {customerName ? customerName.charAt(0).toUpperCase() : "C"}
                        </AvatarFallback>
                    </Avatar>
                )}

                {/* Message Content */}
                <div className={cn(
                    "flex flex-col gap-1 max-w-[80%]",
                    isOutgoing ? "items-end" : "items-start"
                )}>
                    {/* Message Bubble */}
                    <Card
                        variant="elevated"
                        className={cn(
                            "p-3 shadow-sm border-0",
                            isOutgoing
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                : "bg-white text-gray-900"
                        )}
                    >
                        {/* Text Content */}
                        {message.content && message.message_type === 'text' && (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {message.content}
                            </p>
                        )}

                        {/* Media Content will be rendered by parent component */}
                    </Card>

                    {/* Message Meta */}
                    <div className={cn(
                        "flex items-center gap-2 text-xs",
                        isOutgoing ? "text-blue-600" : "text-gray-500"
                    )}>
                        <span className="font-medium">
                            {messageTime ? formatTime(messageTime) : ''}
                        </span>

                        {/* Status Indicators for Outgoing Messages */}
                        {isOutgoing && (
                            <div className="flex items-center gap-1">
                                {message.status === 'sent' && (
                                    <div className="w-3 h-3 text-blue-500">
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                                {message.status === 'delivered' && (
                                    <div className="flex text-blue-500">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <svg className="w-3 h-3 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                                {message.status === 'read' && (
                                    <div className="flex text-blue-600">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <svg className="w-3 h-3 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Outgoing Avatar */}
                {isOutgoing && (
                    <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src="" alt="Tú" />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600">
                            T
                        </AvatarFallback>
                    </Avatar>
                )}
            </div>
        </div>
    );
}
