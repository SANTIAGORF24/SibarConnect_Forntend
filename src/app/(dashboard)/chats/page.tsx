'use client';

import { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { Card } from "@/ui/card/card";
import { api, ChatWithLastMessageDTO, MessageDTO, SendMessageRequestDTO, CompanyStickerDTO, ChatDTO } from '@/api';
import { useAuth } from '@/contexts/auth-context';
import { AudioPlayer, FileAttachment, StickerComponent } from '@/ui/media';
import { MediaPicker, AudioRecorder, StickerPanel } from '@/ui/chat';
import { useChatRealtime } from '@/hooks/useChatRealtime';
import { useCompanyRealtime } from '@/hooks/useCompanyRealtime';
import Link from 'next/link';
import { useCallback } from 'react';

// Accordion Component
interface AccordionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

function Accordion({ title, icon, isOpen, onToggle, children, className = "" }: AccordionProps) {
  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 transition-all duration-200"
        style={{ 
          background: isOpen 
            ? 'linear-gradient(135deg, #2c4687 0%, #1e3566 100%)' 
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          color: isOpen ? 'white' : '#374151'
        }}
      >
        <div className="flex items-center space-x-3">
          <div className={isOpen ? 'text-white' : 'text-blue-600'}>{icon}</div>
          <span className="font-medium">{title}</span>
        </div>
        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="p-4 bg-white border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

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
  const [selectedFiles, setSelectedFiles] = useState<Array<{file: File, type: 'image' | 'video' | 'audio' | 'document', id: string}>>([]);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [users, setUsers] = useState<import('@/api').UserOutDTO[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [lastSummary, setLastSummary] = useState<{text: string; interested: boolean} | null>(null);
  const [showSummaryBanner, setShowSummaryBanner] = useState<boolean>(false);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState<{date: string; time: string; userId: number | ''}>({date: '', time: '', userId: ''});
  const [appointments, setAppointments] = useState<Array<{id:number; assigned_user_id:number; start_at:string}>>([]);
  const [templates, setTemplates] = useState<Array<{ id: number; name: string; items: Array<{ order_index: number; item_type: string; text_content?: string; media_url?: string; caption?: string }> }>>([]);
  
  // Panel lateral acordeón states
  const [openAccordions, setOpenAccordions] = useState<{
    assignment: boolean;
    summary: boolean;
    appointments: boolean;
    templates: boolean;
  }>({
    assignment: true,
    summary: false,
    appointments: false,
    templates: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef<boolean>(true);
  const autoScrollRef = useRef<boolean>(true);
  const justOpenedChatRef = useRef<boolean>(false);
  const suppressNextAutoEffectRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSummaryInFlightRef = useRef<boolean>(false);

  const toggleAccordion = (key: keyof typeof openAccordions) => {
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSendTemplate = useCallback(async (template: { id: number; name: string; items: Array<{ order_index: number; item_type: string; text_content?: string; media_url?: string; caption?: string }>; }, chatId: number) => {
    if (!currentUser?.company_id || !currentUser?.id) return;
    const companyId = currentUser.company_id;
    const userId = currentUser.id;
    const sorted = [...template.items].sort((a, b) => a.order_index - b.order_index);
    for (const it of sorted) {
      if (it.item_type === 'text' && it.text_content) {
        const messageRequest = { chat_id: chatId, content: it.text_content, message_type: 'text' };
        await api.chats.sendMessage(messageRequest, companyId, userId);
      } else if (it.media_url && ['image','video','audio','document'].includes(it.item_type)) {
        await api.chats.sendMediaLink({ chat_id: chatId, media_url: it.media_url, message_type: it.item_type, caption: it.caption }, companyId, userId);
      }
    }
  }, [currentUser?.company_id, currentUser?.id]);

  useEffect(() => {
    const loadTemplates = async () => {
      if (!currentUser?.company_id) return;
      try {
        const list = await api.templates.list(currentUser.company_id);
        setTemplates(list);
      } catch {
        setTemplates([]);
      }
    };
    void loadTemplates();
  }, [currentUser?.company_id]);

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

  // Sort messages chronologically (oldest first) without mutating state
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const timeA = new Date(a.timestamp || a.created_at || 0).getTime();
      const timeB = new Date(b.timestamp || b.created_at || 0).getTime();
      return timeA - timeB;
    });
  }, [messages]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = (smooth: boolean = true) => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (smooth) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  };

  useLayoutEffect(() => {
    if (justOpenedChatRef.current) {
      scrollToBottom(false);
      justOpenedChatRef.current = false;
      autoScrollRef.current = false;
      suppressNextAutoEffectRef.current = true;
    }
  }, [sortedMessages]);

  useEffect(() => {
    if (suppressNextAutoEffectRef.current) {
      suppressNextAutoEffectRef.current = false;
      return;
    }
    if (autoScrollRef.current || nearBottomRef.current) {
      scrollToBottom(true);
    }
    autoScrollRef.current = false;
  }, [sortedMessages]);

  // Fetch chats on component mount (solo una vez)
  useEffect(() => {
    if (!currentUser?.company_id) return;
    
    fetchChats();
  }, [currentUser?.company_id]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const all = await api.users.list();
        const filtered = currentUser?.company_id ? all.filter(u => u.company_id === currentUser.company_id) : all;
        setUsers(filtered);
      } catch (e) {}
    };
    loadUsers();
  }, [currentUser?.company_id]);

  // Fetch messages when chat is selected (solo una vez)
  useEffect(() => {
    if (!selectedChat?.id || !currentUser?.company_id) return;
    autoScrollRef.current = true;
    justOpenedChatRef.current = true;
    fetchMessages(selectedChat.id);
    
    // Limpiar resumen anterior al cambiar de chat
    setLastSummary(null);
    setShowSummaryBanner(false);
    autoSummaryInFlightRef.current = false;
    // cargar citas del chat
    (async () => {
      try {
        const list = await api.chats.listAppointments(selectedChat.id as number, currentUser.company_id as number);
        setAppointments(list.map(a => ({ id: a.id, assigned_user_id: a.assigned_user_id, start_at: a.start_at })));
        if (list && list.length > 0) {
          setOpenAccordions(prev => ({ ...prev, appointments: true }));
        }
      } catch {}
    })();
    
    // TODO: Aquí se podría cargar el resumen existente del chat si está disponible
    // loadExistingSummary(selectedChat.id);
  }, [selectedChat?.id, currentUser?.company_id]);

  // Track if user is near the bottom to avoid scroll jumps
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const threshold = 120;
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      nearBottomRef.current = distanceFromBottom <= threshold;
    };
    handleScroll();
    el.addEventListener('scroll', handleScroll);
    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Realtime updates for selected chat
  useChatRealtime<{ company_id: number } & MessageDTO>(
    currentUser?.company_id || undefined,
    selectedChat?.id,
    {
      enabled: Boolean(selectedChat?.id && currentUser?.company_id),
      onEvent: (evt) => {
        if (evt.event === 'message.created') {
          const msg = evt.data as unknown as MessageDTO & { company_id?: number };
          if (msg.chat_id === selectedChat?.id) {
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === msg.id);
              if (exists) return prev;
              return [...prev, msg];
            });
          }
          // Refrescar lista de chats para actualizar último mensaje
          fetchChats();
        }
      },
    }
  );

  // Realtime updates at company level to reflect new chats / last message changes
  const { connected: companyWsConnected } = useCompanyRealtime<{ chat_id: number; company_id: number; last_message: MessageDTO }>(
    currentUser?.company_id || undefined,
    {
      enabled: Boolean(currentUser?.company_id),
      onEvent: (evt) => {
        if (evt.event === 'chat.updated') {
          fetchChats();
        }
      },
    }
  );

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
      autoScrollRef.current = true;
      
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
      
      // No recargamos mensajes; el evento realtime actualizará la UI

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
    const newFile = {
      file,
      type,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setSelectedFiles(prev => [...prev, newFile]);
  };

  const removeSelectedFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  const handleStickerSelect = (sticker: CompanyStickerDTO) => {
    setShowStickerPicker(false);
    sendSticker(sticker);
  };

  const handleAudioRecorded = (audioBlob: Blob) => {
    // Convert blob to file
    const audioFile = new File([audioBlob], `audio_${Date.now()}.wav`, { type: 'audio/wav' });
    const newFile = {
      file: audioFile,
      type: 'audio' as const,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setSelectedFiles(prev => [...prev, newFile]);
    setShowAudioRecorder(false);
  };

  const sendFiles = async (caption?: string) => {
    if (selectedFiles.length === 0 || !selectedChat || sending) return;

    try {
      setSending(true);
      const companyId = currentUser?.company_id;
      const userId = currentUser?.id;

      if (!companyId || !userId) {
        console.error('❌ No company ID or user ID found');
        alert('Error: Usuario no válido');
        return;
      }

      // Enviar archivos uno por uno
      for (let i = 0; i < selectedFiles.length; i++) {
        const fileData = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('chat_id', selectedChat.id.toString());
        formData.append('message_type', fileData.type);

        // Solo agregar caption al primer archivo
        if (caption && i === 0) {
          formData.append('caption', caption);
        }

        // Send file
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(`${baseUrl}/api/chats/send-file?company_id=${companyId}&user_id=${userId}`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }

      console.log('✅ Files sent successfully');

      // Clear states
      setSelectedFiles([]);
      autoScrollRef.current = true;
      // Realtime actualizará los mensajes; solo refrescamos lista de chats
      await fetchChats();

    } catch (error) {
      console.error('❌ Error sending files:', error);
      alert('Error al enviar archivos');
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
        content: sticker.url,
        message_type: 'sticker'
      };

      const result = await api.chats.sendMessage(messageRequest, companyId, userId);
      console.log('✅ Sticker sent successfully');
      autoScrollRef.current = true;
      // Realtime actualizará los mensajes; solo refrescamos lista de chats
      await fetchChats();

    } catch (error) {
      console.error('❌ Error sending sticker:', error);
      alert('Error al enviar sticker');
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async (assignedUserId: number | '', priority: 'low'|'medium'|'high') => {
    if (!selectedChat || !currentUser?.company_id || !assignedUserId) return;
    try {
      setAssignLoading(true);
      const updated: ChatDTO = await api.chats.assign({ chat_id: selectedChat.id, assigned_user_id: assignedUserId as number, priority }, currentUser.company_id);
      const merged: ChatWithLastMessageDTO = { ...selectedChat, ...updated };
      setSelectedChat(merged);
      await fetchChats();
    } catch (e) {
      alert('Error asignando chat');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleStatusChange = async (status: 'active'|'closed') => {
    if (!selectedChat || !currentUser?.company_id) return;
    try {
      setStatusLoading(true);
      const updated: ChatDTO = await api.chats.updateStatus({ chat_id: selectedChat.id, status }, currentUser.company_id);
      const merged: ChatWithLastMessageDTO = { ...selectedChat, ...updated };
      setSelectedChat(merged);
      await fetchChats();
    } catch (e) {
      alert('Error actualizando estado');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedChat || !currentUser?.company_id) return;
    try {
      setSummaryLoading(true);
      const res = await api.chats.generateSummary({ chat_id: selectedChat.id }, currentUser.company_id);
      setLastSummary({ text: res.summary, interested: res.interest === 'Interesado' });
      setShowSummaryBanner(true);
      
      // Mostrar mensaje de éxito
      console.log('✅ Resumen generado y guardado exitosamente');
    } catch (e) {
      console.error('❌ Error generando resumen:', e);
      alert('Error generando resumen. Por favor intenta nuevamente.');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Generar resumen automáticamente SOLO después de cargar mensajes
  useEffect(() => {
    if (!selectedChat?.id || !currentUser?.company_id) return;
    if (loadingMessages) return;
    if (messages.length === 0) return;
    if (autoSummaryInFlightRef.current) return;
    autoSummaryInFlightRef.current = true;
    (async () => {
      try {
        setSummaryLoading(true);
        // 1) Intentar cargar resumen existente y validar frescura (1 hora)
        let shouldGenerate = true;
        try {
          const existing = await api.chats.getSummary(selectedChat.id as number, currentUser.company_id as number);
          if (existing && existing.summary) {
            const updatedAtStr = existing.updated_at || existing.created_at;
            const updatedAt = updatedAtStr ? new Date(updatedAtStr).getTime() : 0;
            const now = Date.now();
            const ageMs = now - updatedAt;
            const oneHourMs = 60 * 60 * 1000;
            setLastSummary({ text: existing.summary, interested: existing.interest === 'Interesado' });
            if (updatedAt && ageMs < oneHourMs) {
              shouldGenerate = false;
            }
          }
        } catch {}
        // 2) Solo generar si no existe o está más viejo de 1 hora
        if (shouldGenerate) {
          setShowSummaryBanner(true);
          setLastSummary({ text: 'Generando resumen con IA…', interested: false });
          const res = await api.chats.generateSummary({ chat_id: selectedChat.id as number }, currentUser.company_id as number);
          setLastSummary({ text: res.summary, interested: res.interest === 'Interesado' });
          setShowSummaryBanner(true);
        } else {
          // No generar ni mostrar banner; el resumen está disponible en el panel
          setShowSummaryBanner(false);
        }
      } catch (err) {
        console.warn('No se pudo generar resumen automático:', err);
      } finally {
        setSummaryLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.id, loadingMessages, messages.length]);

  const handleCreateAppointment = async () => {
    if (!selectedChat || !currentUser?.company_id) return;
    if (!appointmentData.date || !appointmentData.time || !appointmentData.userId) {
      alert('Completa fecha, hora y persona asignada');
      return;
    }
    try {
      setAppointmentLoading(true);
      const iso = new Date(`${appointmentData.date}T${appointmentData.time}:00`).toISOString();
      await api.chats.createAppointment({ chat_id: selectedChat.id, assigned_user_id: appointmentData.userId as number, start_at: iso }, currentUser.company_id);
      alert('Cita creada');
      const list = await api.chats.listAppointments(selectedChat.id as number, currentUser.company_id as number);
      setAppointments(list.map(a => ({ id: a.id, assigned_user_id: a.assigned_user_id, start_at: a.start_at })));
    } catch (e) {
      try {
        const resp = (e as any)?.message ? JSON.parse((e as any).message) : null;
        if (resp && resp.detail && resp.detail.conflict && resp.detail.appointment) {
          const a = resp.detail.appointment;
          const dt = new Date(a.start_at);
          const dateStr = dt.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const timeStr = dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          if (confirm(`Este usuario ya tiene una cita el ${dateStr} a las ${timeStr}.\n¿Quieres reprogramarla a la nueva fecha/hora?`)) {
            await api.chats.updateAppointment(a.id, currentUser!.company_id as number, { start_at: new Date(`${appointmentData.date}T${appointmentData.time}:00`).toISOString() });
            const list = await api.chats.listAppointments(selectedChat!.id as number, currentUser!.company_id as number);
            setAppointments(list.map(x => ({ id: x.id, assigned_user_id: x.assigned_user_id, start_at: x.start_at })));
            alert('Cita reprogramada');
            return;
          }
        }
      } catch {}
      alert('No se pudo crear la cita. Verifica disponibilidad');
    } finally {
      setAppointmentLoading(false);
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!selectedChat || !currentUser?.company_id) return;
    try {
      await api.chats.deleteAppointment(id, currentUser.company_id);
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      alert('No se pudo cancelar la cita');
    }
  };

  const handleUpdateAppointment = async (id: number, newDate: string, newTime: string) => {
    if (!selectedChat || !currentUser?.company_id) return;
    try {
      const iso = new Date(`${newDate}T${newTime}:00`).toISOString();
      const updated = await api.chats.updateAppointment(id, currentUser.company_id, { start_at: iso });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, start_at: updated.start_at } : a));
    } catch (e) {
      alert('No se pudo reprogramar la cita (posible conflicto)');
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
    // Para stickers, usar content si attachment_url no está disponible
    const mediaUrl = message.message_type === 'sticker' && !message.attachment_url 
      ? message.content 
      : message.attachment_url;
    
    if (!mediaUrl) return null;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const fullUrl = `${baseUrl}${mediaUrl}`;

    // Debug logs
    console.log('🔍 Debug Media URL:');
    console.log('- baseUrl:', baseUrl);
    console.log('- message_type:', message.message_type);
    console.log('- attachment_url:', message.attachment_url);
    console.log('- content:', message.content);
    console.log('- mediaUrl (used):', mediaUrl);
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
        const fileName = mediaUrl?.split('/').pop() || 'archivo';
        return (
          <div className="mt-2">
            <FileAttachment
              fileName={fileName}
              fileUrl={fullUrl}
              fileType={mediaUrl?.split('.').pop()}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex bg-white w-full h-screen">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: '#2c4687' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chats</h1>
                <p className="text-sm text-gray-600">{chats.length} conversación{chats.length !== 1 ? 'es' : ''}</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowImportModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Importar chat de WhatsApp"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
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
                className={`flex items-center p-4 cursor-pointer border-b border-gray-100 transition-all duration-200 relative group ${
                  selectedChat?.id === chat.id 
                    ? 'shadow-sm' 
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: selectedChat?.id === chat.id ? '#f0f4f8' : 'transparent',
                  borderLeft: selectedChat?.id === chat.id ? '4px solid #2c4687' : '4px solid transparent'
                }}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold mr-4 shadow-lg" style={{ backgroundColor: '#2c4687' }}>
                    {chat.customer_name ? chat.customer_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate flex items-center space-x-2">
                      <span>{chat.customer_name || 'Usuario desconocido'}</span>
                      {chat.status === 'closed' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          ✓
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 font-medium">
                        {chat.last_message_at ? formatTime(chat.last_message_at) : ''}
                      </span>
                      {/* Asignación */}
                      {users.find(u => u.id === chat.assigned_user_id) && (
                        <span className="text-xs text-blue-600 font-medium mt-0.5">
                          👤 {users.find(u => u.id === chat.assigned_user_id)?.first_name}
                        </span>
                      )}
                      {chat.priority && (
                        <span className="text-xs text-gray-600 mt-0.5">
                          {chat.priority === 'high' ? '🔴 Prioridad Alta' : chat.priority === 'medium' ? '🟡 Prioridad Media' : '🟢 Prioridad Baja'}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 font-mono mb-2 bg-gray-100 px-2 py-1 rounded-md inline-block">
                    {chat.phone_number}
                  </p>
                  <p className="text-sm text-gray-600 truncate leading-tight">
                    {chat.last_message ? formatLastMessage(chat.last_message.content) : 'Sin mensajes'}
                  </p>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(44, 70, 135, 0.05) 0%, rgba(44, 70, 135, 0.1) 100%)' }}></div>
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
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-lg" style={{ backgroundColor: '#2c4687' }}>
                      {selectedChat.customer_name ? selectedChat.customer_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full" style={{ backgroundColor: '#2c4687' }}></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedChat.customer_name || 'Usuario desconocido'}
                      </h2>
                      {selectedChat.priority && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedChat.priority === 'high' ? 'bg-red-100 text-red-800' :
                          selectedChat.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {selectedChat.priority === 'high' ? '🔴 Prioridad Alta' :
                           selectedChat.priority === 'medium' ? '🟡 Prioridad Media' : '🟢 Prioridad Baja'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-md">
                        {selectedChat.phone_number}
                      </p>
                      {users.find(u => u.id === selectedChat.assigned_user_id) && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          👤 Asignado a {users.find(u => u.id === selectedChat.assigned_user_id)?.first_name} {users.find(u => u.id === selectedChat.assigned_user_id)?.last_name}
                        </span>
                      )}
                      {selectedChat.status === 'closed' && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          ✅ Cliente cerrado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700">En línea</span>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 2l1.09 4.35L12 6.5l4.91-.15L18 2l-2.5 4.5L12 8.5l-3.5-2L6 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              {showSummaryBanner && lastSummary && (
                <div className="mt-4 rounded-xl border p-4 relative" style={{ borderColor: lastSummary.interested ? '#16a34a' : '#eab308', background: lastSummary.interested ? 'rgba(16,185,129,0.06)' : 'rgba(234,179,8,0.06)' }}>
                  <button
                    onClick={() => setShowSummaryBanner(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    title="Cerrar"
                  >
                    ×
                  </button>
                  <div className="flex items-center mb-2">
                    <span className={`text-sm font-medium ${lastSummary.interested ? 'text-green-700' : 'text-yellow-700'}`}>
                      {lastSummary.interested ? 'Interesado' : 'Indeciso/No interesado'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {lastSummary.text}
                  </div>
                </div>
              )}
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
                                ? 'bg-[var(--primary)] text-white rounded-br-md'
                                : 'bg-white text-gray-900 border rounded-bl-md'
                            }`}
                          >
                            {/* Solo mostrar el contenido de texto si no es solo un indicador de media y no es un sticker */}
                            {message.content && !isMediaIndicator(message.content) && message.message_type !== 'sticker' && (
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
            <div className="border-t border-gray-200 bg-white">
              <div className="p-4">
                {showAudioRecorder ? (
                  <AudioRecorder
                    onAudioRecorded={handleAudioRecorded}
                    onCancel={() => setShowAudioRecorder(false)}
                    disabled={sending}
                  />
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-200 focus-within:border-blue-300 transition-all duration-200"
                      style={{ borderColor: '#e5e7eb' }}
                    >
                      <MediaPicker
                        onFileSelect={handleFileSelect}
                        onStickersClick={() => setShowStickerPicker(!showStickerPicker)}
                        disabled={sending}
                      />
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe tu mensaje aquí..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm"
                        disabled={sending}
                      />
                      <button 
                        onClick={() => setShowStickerPicker(!showStickerPicker)}
                        className={`text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200 ${showStickerPicker ? 'text-green-500 bg-green-100' : ''}`}
                        disabled={sending}
                        title="Stickers"
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
                        className="p-3 rounded-full text-white transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
                        style={{ 
                          background: sending 
                            ? '#9ca3af' 
                            : 'linear-gradient(135deg, #2c4687 0%, #1e3566 100%)'
                        }}
                        title="Enviar mensaje"
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
                        className="p-3 rounded-full text-white transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
                        style={{ 
                          background: sending 
                            ? '#9ca3af' 
                            : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                        }}
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
              
              {/* Sticker Panel */}
              <StickerPanel
                isOpen={showStickerPicker}
                onStickerSelect={handleStickerSelect}
                onClose={() => setShowStickerPicker(false)}
              />
              
              {/* Files Preview Area */}
              {selectedFiles.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Archivos seleccionados ({selectedFiles.length})
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={clearAllFiles}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Limpiar todo
                      </button>
                      <button
                        onClick={() => sendFiles()}
                        disabled={sending}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                      >
                        {sending ? 'Enviando...' : `Enviar ${selectedFiles.length > 1 ? 'archivos' : 'archivo'}`}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedFiles.map((fileData) => (
                      <div key={fileData.id} className="relative group">
                        <div className="border border-gray-200 rounded-lg p-2 bg-white">
                          {/* Preview del archivo */}
                          {fileData.type === 'image' ? (
                            <img
                              src={URL.createObjectURL(fileData.file)}
                              alt={fileData.file.name}
                              className="w-full h-20 object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-2xl mb-1">
                                  {fileData.type === 'video' ? '🎥' : 
                                   fileData.type === 'audio' ? '🎵' : '📄'}
                                </div>
                                <div className="text-xs text-gray-500 uppercase">
                                  {fileData.type}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Nombre del archivo */}
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {fileData.file.name}
                          </p>
                          
                          {/* Botón para eliminar */}
                          <button
                            onClick={() => removeSelectedFile(fileData.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
            <div className="text-center max-w-lg px-8">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(44, 70, 135, 0.1) 0%, rgba(44, 70, 135, 0.2) 100%)' }}>
                  <svg className="w-16 h-16" style={{ color: '#2c4687' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-4 h-4 rounded-full animate-bounce" style={{ backgroundColor: '#2c4687' }}></div>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                ¡Bienvenido a WhatsApp Business!
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Selecciona una conversación de la lista para comenzar a interactuar con tus clientes de manera profesional e inteligente.
              </p>
              
              <div className="border rounded-xl p-6 mb-6" style={{ 
                background: 'linear-gradient(135deg, rgba(44, 70, 135, 0.05) 0%, rgba(44, 70, 135, 0.1) 100%)',
                borderColor: 'rgba(44, 70, 135, 0.2)'
              }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#2c4687' }}>🚀 Funciones inteligentes disponibles:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm" style={{ color: '#1e3566' }}>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2c4687' }}></span>
                    <span>Resúmenes con IA</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2c4687' }}></span>
                    <span>Agenda de citas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2c4687' }}></span>
                    <span>Asignación de prioridades</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2c4687' }}></span>
                    <span>Plantillas de mensajes</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#2c4687' }}></div>
                  <span className="font-medium" style={{ color: '#2c4687' }}>Sistema conectado y listo</span>
                </div>
                <span className="text-gray-300">•</span>
                <span>SibarConnect v2.0</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="w-96 border-l border-gray-200 hidden xl:flex flex-col bg-gradient-to-b from-gray-50 to-white">
        {/* Header del panel */}
        <div className="p-6 border-b text-white" style={{ 
          background: 'linear-gradient(135deg, #2c4687 0%, #1e3566 100%)'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Panel de Administración</h3>
                <p className="text-sm text-white/80 mt-1">Gestiona tu chat inteligentemente</p>
              </div>
            </div>
          
          </div>
        </div>
        
        {/* Contenido del panel con acordeones */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Acordeón de Asignación */}
          <Accordion
            title="Asignación y Prioridad"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            isOpen={openAccordions.assignment}
            onToggle={() => toggleAccordion('assignment')}
            className="shadow-sm"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asignar a usuario</label>
                <select
                  className="w-full border-2 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none"
                  style={{ 
                    borderColor: '#2c4687'
                  }}
                  value={selectedChat?.assigned_user_id ?? ''}
                  onChange={e => handleAssign(e.target.value ? Number(e.target.value) : '', selectedChat?.priority || 'low')}
                  disabled={assignLoading || !selectedChat}
                >
                  <option value="">Sin asignar</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                <select
                  className="w-full border-2 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none"
                  style={{ 
                    borderColor: '#2c4687'
                  }}
                  value={selectedChat?.priority || 'low'}
                  onChange={e => handleAssign(selectedChat?.assigned_user_id ?? '', e.target.value as 'low'|'medium'|'high')}
                  disabled={assignLoading || !selectedChat}
                >
                  <option value="low">🟢 Baja</option>
                  <option value="medium">🟡 Media</option>
                  <option value="high">🔴 Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado del cliente</label>
                <select
                  className="w-full border-2 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none"
                  style={{ 
                    borderColor: '#2c4687'
                  }}
                  value={selectedChat?.status || 'active'}
                  onChange={e => handleStatusChange(e.target.value as 'active'|'closed')}
                  disabled={statusLoading || !selectedChat}
                >
                  <option value="active">💬 Cliente abierto</option>
                  <option value="closed">✅ Cliente cerrado</option>
                </select>
              </div>

              {assignLoading && (
                <div className="flex items-center justify-center p-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Actualizando...</span>
                </div>
              )}
            </div>
          </Accordion>

          {/* Acordeón de Resumen con IA */}
          <Accordion
            title="Resumen con IA"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            isOpen={openAccordions.summary}
            onToggle={() => toggleAccordion('summary')}
            className="shadow-sm"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Genera un resumen inteligente de la conversación usando IA para identificar puntos clave y el nivel de interés del cliente.
              </p>
              
              <button
                onClick={handleGenerateSummary}
                disabled={summaryLoading || !selectedChat}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ 
                  background: summaryLoading 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #2c4687 0%, #1e3566 100%)'
                }}
              >
                {summaryLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Generar resumen con IA</span>
                  </>
                )}
              </button>
              
              {lastSummary && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-2">Resumen Generado</h4>
                      <p className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">{lastSummary.text}</p>
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-900">Nivel de interés:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          lastSummary.interested 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lastSummary.interested ? '✅ Alto interés' : '⚠️ Bajo interés'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Accordion>

          {/* Acordeón de Agenda de Citas */}
          <Accordion
            title="Agenda de Citas"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            isOpen={openAccordions.appointments}
            onToggle={() => toggleAccordion('appointments')}
            className="shadow-sm"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Programa una cita con el cliente y asigna a un responsable.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input 
                    type="date" 
                    className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none" 
                    style={{ borderColor: '#2c4687' }}
                    value={appointmentData.date} 
                    onChange={e => setAppointmentData(s => ({...s, date: e.target.value}))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <input 
                    type="time" 
                    className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none" 
                    style={{ borderColor: '#2c4687' }}
                    value={appointmentData.time} 
                    onChange={e => setAppointmentData(s => ({...s, time: e.target.value}))} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asignar a</label>
                <select
                  className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ borderColor: '#2c4687' }}
                  value={appointmentData.userId}
                  onChange={e => setAppointmentData(s => ({...s, userId: e.target.value ? Number(e.target.value) : ''}))}
                >
                  <option value="">Seleccionar persona</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleCreateAppointment}
                disabled={appointmentLoading || !selectedChat}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ 
                  background: appointmentLoading 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #2c4687 0%, #1e3566 100%)'
                }}
              >
                {appointmentLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Agendando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Agendar cita</span>
                  </>
                )}
              </button>

              {appointments.length > 0 && (
                <div className="pt-4 border-t">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Citas agendadas</h5>
                  <div className="space-y-2">
                    {appointments.map((a) => {
                      const dt = new Date(a.start_at);
                      const dateStr = dt.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                      const timeStr = dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <div>
                            <div className="text-sm text-gray-800">{dateStr} · {timeStr}</div>
                            <div className="text-xs text-gray-500">ID: {a.id}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const nd = prompt('Nueva fecha (YYYY-MM-DD):', dt.toISOString().slice(0,10));
                                if (!nd) return;
                                const nt = prompt('Nueva hora (HH:MM):', dt.toTimeString().slice(0,5));
                                if (!nt) return;
                                handleUpdateAppointment(a.id, nd, nt);
                              }}
                              className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Reprogramar
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(a.id)}
                              className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Accordion>

          {/* Acordeón de Plantillas */}
          <Accordion
            title="Plantillas de Mensajes"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            isOpen={openAccordions.templates}
            onToggle={() => toggleAccordion('templates')}
            className="shadow-sm"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Gestiona y utiliza plantillas de mensajes para respuestas rápidas y consistentes.
              </p>
              
              {templates.length === 0 ? (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">📝 Plantillas disponibles: 0</span>
                    <Link 
                      href="/templates" 
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Crear plantillas
                    </Link>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    No hay plantillas configuradas. Crea plantillas para responder más rápido.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map((tpl) => (
                    <div key={tpl.id} className="p-2 border rounded flex items-center justify-between">
                      <div className="text-sm text-gray-800">{tpl.name}</div>
                      <button
                        onClick={() => selectedChat?.id && handleSendTemplate(tpl, selectedChat.id)}
                        className="px-3 py-1 text-xs rounded bg-[var(--color-primary)] text-white hover:opacity-90"
                        disabled={!selectedChat}
                      >
                        Enviar
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Link 
                href="/templates" 
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ 
                  background: 'linear-gradient(135deg, #2c4687 0%, #1e3566 100%)'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Gestionar plantillas</span>
              </Link>
            </div>
          </Accordion>
        </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-96 max-w-90vw shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #2c4687 0%, #1e3566 100%)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Importar Chat</h3>
                  <p className="text-sm text-gray-600">WhatsApp Business</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Selecciona un archivo ZIP con el chat exportado de WhatsApp. 
                El archivo debe contener los siguientes elementos:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-center space-x-2">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Archivo <code className="bg-white px-1 rounded">_chat.txt</code> con los mensajes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Archivos multimedia (fotos, audios, videos)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
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
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <div className="text-center">
                      <span className="text-blue-600 font-medium">Importando chat...</span>
                      <p className="text-xs text-blue-500 mt-1">Este proceso puede tomar unos momentos</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ background: 'linear-gradient(135deg, rgba(44, 70, 135, 0.1) 0%, rgba(44, 70, 135, 0.2) 100%)' }}>
                      <svg className="w-6 h-6" style={{ color: '#2c4687' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-700 font-medium">Seleccionar archivo ZIP</span>
                      <p className="text-xs text-gray-500 mt-1">Arrastra y suelta o haz clic para subir</p>
                    </div>
                  </>
                )}
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowImportModal(false)}
                disabled={importing}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
