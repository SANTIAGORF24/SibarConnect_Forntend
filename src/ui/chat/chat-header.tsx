"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar/avatar";
import { Badge } from "@/ui/badge/badge";
import { Button } from "@/ui/button/button";
import { Card } from "@/ui/card/card";

export interface ChatHeaderProps {
    customerName?: string;
    customerPhone?: string;
    status: 'active' | 'closed';
    priority?: 'low' | 'medium' | 'high';
    assignedUserName?: string;
    lastSeen?: string;
    onStatusChange?: (status: 'active' | 'closed') => void;
    onPriorityChange?: (priority: 'low' | 'medium' | 'high') => void;
    onAssignUser?: (userId: number) => void;
    className?: string;
}

export function ChatHeader({
    customerName,
    customerPhone,
    status,
    priority,
    assignedUserName,
    lastSeen,
    onStatusChange,
    onPriorityChange,
    onAssignUser,
    className,
}: ChatHeaderProps) {
    const priorityIcons = {
        high: "🔴",
        medium: "🟡",
        low: "🟢",
    };

    const priorityLabels = {
        high: "Alta",
        medium: "Media",
        low: "Baja",
    };

    return (
        <Card variant="elevated" className={cn("p-6 border-b border-gray-200", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {/* Customer Avatar */}
                    <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={customerName || "Cliente"} />
                        <AvatarFallback className="text-lg font-semibold">
                            {customerName ? customerName.charAt(0).toUpperCase() : "C"}
                        </AvatarFallback>
                    </Avatar>

                    {/* Customer Info */}
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h2 className="text-xl font-bold text-gray-900">
                                {customerName || 'Usuario desconocido'}
                            </h2>

                            {/* Status Badge */}
                            <Badge
                                variant="status"
                                status={status}
                                className="flex items-center gap-1"
                            >
                                {status === 'active' ? '💬 Activo' : '✅ Cerrado'}
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Phone Number */}
                            <Badge variant="outline" size="sm" className="font-mono">
                                {customerPhone}
                            </Badge>

                            {/* Priority */}
                            {priority && (
                                <Badge
                                    variant="priority"
                                    priority={priority}
                                    size="sm"
                                    className="flex items-center gap-1"
                                >
                                    {priorityIcons[priority]} {priorityLabels[priority]}
                                </Badge>
                            )}

                            {/* Assigned User */}
                            {assignedUserName && (
                                <Badge variant="info" size="sm" className="flex items-center gap-1">
                                    👤 {assignedUserName}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                    {/* Online Status */}
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-green-700">En línea</span>
                    </div>

                    {/* Settings Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-gray-600"
                        title="Configuración del chat"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
