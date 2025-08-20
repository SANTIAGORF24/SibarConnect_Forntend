"use client";

import { cn } from "@/lib/utils";
import { ChatSidebar } from "./chat-sidebar";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { MessageInput } from "./message-input";
import { ChatPanel } from "./chat-panel";
import { useState } from "react";

export interface ChatContainerProps {
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
    selectedChat?: {
        id: number;
        customer_name?: string;
        phone_number: string;
        status: 'active' | 'closed';
        priority?: 'low' | 'medium' | 'high';
        assigned_user_id?: number;
    };
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
    users: Array<{ id: number; first_name: string; last_name: string }>;
    appointments: Array<{ id: number; assigned_user_id: number; start_at: string }>;
    templates: Array<{ id: number; name: string; items: Array<any> }>;
    onChatSelect: (chatId: number) => void;
    onNewChat: () => void;
    onImportChat: () => void;
    onSendMessage: (message: string) => void;
    onFileSelect?: (file: File, type: 'image' | 'video' | 'audio' | 'document') => void;
    onStickersClick?: () => void;
    onAudioRecord?: () => void;
    onAssignUser: (userId: number | '', priority: 'low' | 'medium' | 'high') => void;
    onStatusChange: (status: 'active' | 'closed') => void;
    onGenerateSummary: () => void;
    onCreateAppointment: (data: { date: string; time: string; userId: number }) => void;
    onSendTemplate: (template: any) => void;
    loading?: boolean;
    error?: string;
    summaryLoading?: boolean;
    lastSummary?: { text: string; interested: boolean };
    className?: string;
}

export function ChatContainer({
    chats,
    selectedChat,
    messages,
    users,
    appointments,
    templates,
    onChatSelect,
    onNewChat,
    onImportChat,
    onSendMessage,
    onFileSelect,
    onStickersClick,
    onAudioRecord,
    onAssignUser,
    onStatusChange,
    onGenerateSummary,
    onCreateAppointment,
    onSendTemplate,
    loading = false,
    error,
    summaryLoading = false,
    lastSummary,
    className,
}: ChatContainerProps) {
    const [messageInput, setMessageInput] = useState("");

    const handleSendMessage = () => {
        if (messageInput.trim()) {
            onSendMessage(messageInput.trim());
            setMessageInput("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={cn("flex h-screen bg-gray-50", className)}>
            {/* Sidebar */}
            <ChatSidebar
                chats={chats}
                selectedChatId={selectedChat?.id}
                onChatSelect={onChatSelect}
                onNewChat={onNewChat}
                onImportChat={onImportChat}
                users={users}
                loading={loading}
                error={error}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <ChatHeader
                            customerName={selectedChat.customer_name}
                            customerPhone={selectedChat.phone_number}
                            status={selectedChat.status}
                            priority={selectedChat.priority}
                            assignedUserName={selectedChat.assigned_user_id ?
                                users.find(u => u.id === selectedChat.assigned_user_id)?.first_name + ' ' +
                                users.find(u => u.id === selectedChat.assigned_user_id)?.last_name : undefined
                            }
                        />

                        {/* Chat Messages */}
                        <div className="flex-1 flex">
                            <ChatMessages
                                messages={messages}
                                customerName={selectedChat.customer_name}
                                customerPhone={selectedChat.phone_number}
                                loading={loading}
                                className="flex-1"
                            />

                            {/* Admin Panel */}
                            <ChatPanel
                                chat={selectedChat}
                                users={users}
                                appointments={appointments}
                                templates={templates}
                                onAssignUser={onAssignUser}
                                onStatusChange={onStatusChange}
                                onGenerateSummary={onGenerateSummary}
                                onCreateAppointment={onCreateAppointment}
                                onSendTemplate={onSendTemplate}
                                summaryLoading={summaryLoading}
                                lastSummary={lastSummary}
                            />
                        </div>

                        {/* Message Input */}
                        <MessageInput
                            value={messageInput}
                            onChange={setMessageInput}
                            onSend={handleSendMessage}
                            onFileSelect={onFileSelect}
                            onStickersClick={onStickersClick}
                            onAudioRecord={onAudioRecord}
                            disabled={loading}
                        />
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido al Chat</h3>
                            <p className="text-gray-600 mb-6">
                                Selecciona una conversación del panel izquierdo para comenzar a chatear
                            </p>
                            <button
                                onClick={onNewChat}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Iniciar nueva conversación
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
