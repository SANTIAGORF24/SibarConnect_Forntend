"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button/button";
import { TextInput } from "@/ui/form/input";
import { useState } from "react";

export interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    onFileSelect?: (file: File, type: 'image' | 'video' | 'audio' | 'document') => void;
    onStickersClick?: () => void;
    onAudioRecord?: () => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

export function MessageInput({
    value,
    onChange,
    onSend,
    onFileSelect,
    onStickersClick,
    onAudioRecord,
    disabled = false,
    placeholder = "Escribe tu mensaje aquí...",
    className,
}: MessageInputProps) {
    const [isRecording, setIsRecording] = useState(false);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onFileSelect) {
            const type = file.type.startsWith('image/') ? 'image' as const :
                file.type.startsWith('video/') ? 'video' as const :
                    file.type.startsWith('audio/') ? 'audio' as const : 'document' as const;
            onFileSelect(file, type);
        }
        // Reset input
        e.target.value = '';
    };

    return (
        <div className={cn("border-t border-gray-200 bg-white p-4", className)}>
            <div className="flex items-center space-x-3">
                {/* File Upload Button */}
                {onFileSelect && (
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={disabled}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-gray-600"
                            disabled={disabled}
                            title="Adjuntar archivo"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </Button>
                    </div>
                )}

                {/* Message Input */}
                <div className="flex-1">
                    <TextInput
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        disabled={disabled}
                        variant="filled"
                        size="lg"
                        className="rounded-2xl"
                    />
                </div>

                {/* Stickers Button */}
                {onStickersClick && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onStickersClick}
                        disabled={disabled}
                        className="text-gray-400 hover:text-gray-600"
                        title="Stickers"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </Button>
                )}

                {/* Audio Record Button */}
                {onAudioRecord && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onAudioRecord}
                        disabled={disabled}
                        className={cn(
                            "text-gray-400 hover:text-gray-600",
                            isRecording && "text-red-500 animate-pulse"
                        )}
                        title={isRecording ? "Grabando..." : "Grabar audio"}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </Button>
                )}

                {/* Send Button */}
                <Button
                    onClick={onSend}
                    disabled={disabled || !value.trim()}
                    variant="primary"
                    size="icon"
                    className="rounded-full shadow-lg hover:shadow-xl transform hover:scale-105"
                    title="Enviar mensaje"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </Button>
            </div>
        </div>
    );
}
