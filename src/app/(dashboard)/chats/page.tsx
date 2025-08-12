'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from "@/ui/card/card";
import { api, ChatWithLastMessageDTO, MessageDTO, SendMessageRequestDTO, CompanyStickerDTO } from '@/api';
import { useAuth } from '@/contexts/auth-context';
import { AudioPlayer, FileAttachment, StickerComponent } from '@/ui/media';
import { MediaPicker, AudioRecorder, FilePreviewModal, StickerPicker } from '@/ui/chat';

export default function ChatsPage() {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<ChatWithLastMessageDTO[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatWithLastMessageDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    chatId: number;
  } | null>(null);
  
  // Multimedia states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<'image' | 'video' | 'audio' | 'document'>('image');
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para detectar si el contenido es solo un indicador de media
  const isMediaIndicator = (content: string) => {
    const indicators = [
      '[Imagen]', '[Audio]', '[Video]', '[Documento]', '[Sticker]', '[Archivo]',
      'imagen', 'audio', 'video', 'documento', 'sticker', 'archivo',
      'Image', 'Audio', 'Video', 'Document', 'Sticker', 'File'
    ];
    const trimmedContent = content.trim().toLowerCase();
    return indicators.some(indicator => 
      trimmedContent === indicator.toLowerCase() || 
      trimmedContent === `[${indicator.toLowerCase()}]`
    );
  };

  // Sort messages chronologically (oldest first)
  const sortedMessages = messages.sort((a, b) => {
    const timeA = new Date(a.timestamp || a.created_at || 0).getTime();
    const timeB = new Date(b.timestamp || b.created_at || 0).getTime();
    return timeA - timeB; // Ascending order: oldest first
  });

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [sortedMessages]);

  // Fetch chats on component mount (solo una vez)
  useEffect(() => {
    if (!currentUser?.company_id) return;
    
    fetchChats();
  }, [currentUser?.company_id]);

  // Fetch messages when chat is selected (solo una vez)
  useEffect(() => {
    if (!selectedChat?.id || !currentUser?.company_id) return;
    
    fetchMessages(selectedChat.id);
  }, [selectedChat?.id, currentUser?.company_id]);

  const fetchChats = async () => {
    try {
      if (!loading) setLoading(true);
      
      // Get company ID from current user
      const companyId = currentUser?.company_id;
      if (!companyId) {
        console.error('❌ No company ID found for user');
        setError('Usuario no tiene empresa asignada');
        return;
      }
      
      const chatsData = await api.chats.list(companyId);
      setChats(chatsData);
      
      // If a chat is selected, update it with new data
      if (selectedChat) {
        const updatedSelectedChat = chatsData.find(chat => chat.id === selectedChat.id);
        if (updatedSelectedChat) {
          setSelectedChat(updatedSelectedChat);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching chats:', err);
      setError('Error al cargar los chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      setLoadingMessages(true);
      
      // Get company ID from current user
      const companyId = currentUser?.company_id;
      if (!companyId) {
        console.error('❌ No company ID found for user');
        return;
      }
      
      const messagesData = await api.chats.getMessages(chatId, companyId, 100);
      
      // Messages should now come in correct chronological order from backend
      setMessages(messagesData);
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      // Get company ID and user ID from current user
      const companyId = currentUser?.company_id;
      const userId = currentUser?.id;
      
      if (!companyId || !userId) {
        console.error('❌ No company ID or user ID found');
        alert('Error: Usuario no válido');
        return;
      }

      const messageRequest: SendMessageRequestDTO = {
        chat_id: selectedChat.id,
        content: newMessage.trim(),
        message_type: 'text'
      };

      const result = await api.chats.sendMessage(messageRequest, companyId, userId);
      console.log('✅ Message sent successfully');
      
      setNewMessage('');
      
      // Refresh messages to show the sent message
      await fetchMessages(selectedChat.id);
      
      // Also refresh the chat list to update last message
      await fetchChats();
      
    } catch (err) {
      console.error('❌ Error sending message:', err);
      alert('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return '';
    try {
      // Handle both timestamp and created_at fields
      const dateStr = timestamp;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true // Show AM/PM
      });
    } catch (error) {
      console.error('Error formatting time:', timestamp, error);
      return '';
    }
  };

  const formatDate = (timestamp: string | undefined) => {
    if (!timestamp) return '';
    try {
      const dateStr = timestamp;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
      } else {
        return date.toLocaleDateString('es-ES', { 
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', timestamp, error);
      return '';
    }
  };

  const formatLastMessage = (content: string) => {
    if (!content) return 'Sin mensajes';
    return content.length > 40 ? content.substring(0, 40) + '...' : content;
  };

  // Función para manejar la importación de chat
  const handleImportChat = async (file: File) => {
    if (!currentUser?.company_id) {
      alert('Error: No se encontró información de la empresa');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('company_id', currentUser.company_id.toString());

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
      const response = await fetch(`${baseUrl}/chats/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      alert(`Chat importado exitosamente: ${result.messages_imported} mensajes`);
      
      // Recargar los chats
      await fetchChats();
      setShowImportModal(false);
      
    } catch (error) {
      console.error('Error importando chat:', error);
      alert(`Error al importar el chat: ${error}`);
    } finally {
      setImporting(false);
    }
  };

  // Función para manejar la selección de archivo ZIP para importar
  const handleZipFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
        handleImportChat(file);
      } else {
        alert('Por favor selecciona un archivo ZIP con el chat exportado');
      }
    }
  };

  // Función para manejar clic derecho en chat
  const handleChatRightClick = (event: React.MouseEvent, chatId: number) => {
    event.preventDefault();
    setContextMenu({
      show: true,
      x: event.clientX,
      y: event.clientY,
      chatId: chatId
    });
  };

  // Función para eliminar chat
  const handleDeleteChat = async (chatId: number) => {
    if (!currentUser?.company_id) return;

    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este chat? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;

    try {
      await api.chats.delete(chatId, currentUser.company_id);
      
      // Actualizar la lista de chats
      setChats(chats.filter(chat => chat.id !== chatId));
      
      // Si el chat eliminado estaba seleccionado, deseleccionarlo
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
      
      alert('Chat eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando chat:', error);
      alert('Error al eliminar el chat');
    } finally {
      setContextMenu(null);
    }
  };

  // Multimedia functions
  const handleFileSelect = (file: File, type: 'image' | 'video' | 'audio' | 'document') => {
    setSelectedFile(file);
    setSelectedFileType(type);
    setShowFilePreview(true);
  };

  const handleStickerSelect = (sticker: CompanyStickerDTO) => {
    setShowStickerPicker(false);
    sendSticker(sticker);
  };

  const handleAudioRecorded = (audioBlob: Blob) => {
    // Convert blob to file
    const audioFile = new File([audioBlob], `audio_${Date.now()}.wav`, { type: 'audio/wav' });
    setSelectedFile(audioFile);
    setSelectedFileType('audio');
    setShowAudioRecorder(false);
    setShowFilePreview(true);
  };

  const sendFile = async (caption?: string) => {
    if (!selectedFile || !selectedChat || sending) return;

    try {
      setSending(true);
      const companyId = currentUser?.company_id;
      const userId = currentUser?.id;

      if (!companyId || !userId) {
        console.error('❌ No company ID or user ID found');
        alert('Error: Usuario no válido');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('chat_id', selectedChat.id.toString());
      formData.append('message_type', selectedFileType);

      if (caption) {
        formData.append('caption', caption);
      }

      // Send file
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
      const response = await fetch(`${baseUrl}/chats/send-file?company_id=${companyId}&user_id=${userId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('✅ File sent successfully');

      // Clear states
      setSelectedFile(null);
      setSelectedFileType('image');
      setShowFilePreview(false);

      // Refresh messages
      await fetchMessages(selectedChat.id);
      await fetchChats();

    } catch (error) {
      console.error('❌ Error sending file:', error);
      alert('Error al enviar archivo');
    } finally {
      setSending(false);
    }
  };

  const sendSticker = async (sticker: CompanyStickerDTO) => {
    if (!selectedChat || sending) return;

    try {
      setSending(true);
      const companyId = currentUser?.company_id;
      const userId = currentUser?.id;

      if (!companyId || !userId) {
        console.error('❌ No company ID or user ID found');
        alert('Error: Usuario no válido');
        return;
      }

      const messageRequest: SendMessageRequestDTO = {
        chat_id: selectedChat.id,
        content: sticker.name,
        message_type: 'sticker'
      };

      const result = await api.chats.sendMessage(messageRequest, companyId, userId);
      console.log('✅ Sticker sent successfully');

      // Refresh messages
      await fetchMessages(selectedChat.id);
      await fetchChats();

    } catch (error) {
      console.error('❌ Error sending sticker:', error);
      alert('Error al enviar sticker');
    } finally {
      setSending(false);
    }
  };

  // Cerrar menú contextual al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    if (contextMenu?.show) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Función para renderizar archivos multimedia
  const renderMediaAttachment = (message: MessageDTO) => {
    if (!message.attachment_url) return null;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const fullUrl = `${baseUrl}${message.attachment_url}`;

    // Debug logs
    console.log('🔍 Debug Media URL:');
    console.log('- baseUrl:', baseUrl);
    console.log('- attachment_url:', message.attachment_url);
    console.log('- fullUrl:', fullUrl);

    switch (message.message_type) {
      case 'image':
        return (
          <div className="mt-2">
            <img 
              src={fullUrl} 
              alt="Imagen" 
              className="max-w-xs rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => window.open(fullUrl, '_blank')}
            />
          </div>
        );
      case 'sticker':
        return (
          <div className="mt-2">
            <StickerComponent
              src={fullUrl}
              alt="Sticker"
              onClick={() => window.open(fullUrl, '_blank')}
              onStickerSaved={() => {
                // No hacemos nada específico aquí por ahora
                console.log('Sticker guardado exitosamente');
              }}
            />
          </div>
        );
      case 'video':
        return (
          <div className="mt-2">
            <video 
              controls 
              className="max-w-xs rounded-lg shadow-sm"
              style={{ maxHeight: '300px' }}
            >
              <source src={fullUrl} type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        );
      case 'audio':
        return (
          <div className="mt-2">
            <AudioPlayer src={fullUrl} />
          </div>
        );
      case 'document':
      case 'file':
        // Extraer el nombre del archivo de la URL
        const fileName = message.attachment_url.split('/').pop() || 'archivo';
        return (
          <div className="mt-2">
            <FileAttachment
              fileName={fileName}
              fileUrl={fullUrl}
              fileType={message.attachment_url.split('.').pop()}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 top-0 bottom-0 flex bg-white" style={{ 
      marginLeft: '288px', // Ancho del sidebar (72 * 4 = 288px)
      height: '100vh',
      width: 'calc(100vw - 288px)'
    }}>
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold text-gray-900">Chats de WhatsApp</h1>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
              title="Importar chat de WhatsApp"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Importar</span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {chats.length} conversación{chats.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              <span className="ml-2 text-gray-600 text-sm">Cargando...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={fetchChats} 
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Reintentar
              </button>
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
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                onContextMenu={(e) => handleChatRightClick(e, chat.id)}
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-green-50 border-green-200' : ''
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  {chat.customer_name ? chat.customer_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {chat.customer_name || 'Usuario desconocido'}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {chat.last_message_at ? formatTime(chat.last_message_at) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-mono mb-1">
                    {chat.phone_number}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.last_message ? formatLastMessage(chat.last_message.content) : 'Sin mensajes'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  {selectedChat.customer_name ? selectedChat.customer_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedChat.customer_name || 'Usuario desconocido'}
                  </h2>
                  <p className="text-sm text-gray-600 font-mono">
                    {selectedChat.phone_number}
                  </p>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">En línea</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cg opacity="0.05"%3E%3Cpath d="M20 20m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" fill="currentColor"/%3E%3C/g%3E%3C/svg%3E")' }}
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  <span className="ml-2 text-gray-600 text-sm">Cargando mensajes...</span>
                </div>
              ) : sortedMessages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay mensajes en esta conversación</p>
                </div>
              ) : (
                <>
                  {sortedMessages.map((message, index) => {
                    const messageTime = message.timestamp || message.created_at;
                    const showDate = index === 0 || 
                      formatDate(messageTime) !== formatDate(sortedMessages[index - 1].timestamp || sortedMessages[index - 1].created_at);
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-600 shadow-sm border">
                              {formatDate(messageTime)}
                            </span>
                          </div>
                        )}
                        <div className={`flex mb-2 ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${
                              message.direction === 'outgoing'
                                ? 'bg-green-500 text-white rounded-br-md'
                                : 'bg-white text-gray-900 border rounded-bl-md'
                            }`}
                          >
                            {/* Solo mostrar el contenido de texto si no es solo un indicador de media */}
                            {message.content && !isMediaIndicator(message.content) && (
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            )}
                            {renderMediaAttachment(message)}
                            <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                              message.direction === 'outgoing' ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              <span>{formatTime(messageTime)}</span>
                              {message.direction === 'outgoing' && (
                                <div className="flex">
                                  {message.status === 'sent' && (
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  {message.status === 'delivered' && (
                                    <div className="flex">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <svg className="w-3 h-3 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                  {message.status === 'read' && (
                                    <div className="flex text-blue-200">
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
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {showAudioRecorder ? (
                <AudioRecorder
                  onAudioRecorded={handleAudioRecorded}
                  onCancel={() => setShowAudioRecorder(false)}
                  disabled={sending}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                    <MediaPicker
                      onFileSelect={handleFileSelect}
                      onStickersClick={() => setShowStickerPicker(true)}
                      disabled={sending}
                    />
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                      disabled={sending}
                    />
                    <button 
                      onClick={() => setShowStickerPicker(true)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      disabled={sending}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Send button or Audio recorder button */}
                  {newMessage.trim() ? (
                    <button
                      onClick={sendMessage}
                      disabled={sending}
                      className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowAudioRecorder(true)}
                      disabled={sending}
                      className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
                      title="Grabar audio"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">WhatsApp Business</h2>
              <p className="text-gray-500 mb-4">Selecciona un chat para comenzar a conversar</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Conectado y listo para recibir mensajes</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Importación */}
      {/* Menú contextual */}
      {contextMenu?.show && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <button
            onClick={() => handleDeleteChat(contextMenu.chatId)}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
          >
            🗑️ Eliminar chat
          </button>
        </div>
      )}

      {/* Modal de importación */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Importar Chat de WhatsApp</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Selecciona un archivo ZIP con el chat exportado de WhatsApp. 
                El archivo debe contener:
              </p>
              <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                <li>Archivo <code>_chat.txt</code> con los mensajes</li>
                <li>Archivos multimedia (fotos, audios, videos)</li>
              </ul>
            </div>

            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleZipFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-blue-600">Importando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="text-center">
                      <span className="text-gray-600">Seleccionar archivo ZIP</span>
                      <p className="text-xs text-gray-500">Arrastra o haz clic para subir</p>
                    </div>
                  </>
                )}
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowImportModal(false)}
                disabled={importing}
                className="flex-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showFilePreview && selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          fileType={selectedFileType}
          onSend={sendFile}
          onCancel={() => {
            setShowFilePreview(false);
            setSelectedFile(null);
          }}
        />
      )}

      {/* Sticker Picker Modal */}
      {showStickerPicker && (
        <StickerPicker
          onStickerSelect={handleStickerSelect}
          onClose={() => setShowStickerPicker(false)}
        />
      )}
    </div>
  );
}
