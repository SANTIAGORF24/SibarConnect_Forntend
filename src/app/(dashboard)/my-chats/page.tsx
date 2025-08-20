"use client";
 
import { useEffect, useMemo, useState } from "react";
import { api, ChatWithLastMessageDTO, MessageDTO, CompanyStickerDTO, SendMessageRequestDTO } from "@/api";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/ui/card/card";
import Link from "next/link";
import { MediaPicker, AudioRecorder, StickerPanel } from "@/ui/chat";
import { AudioPlayer, FileAttachment, StickerComponent } from "@/ui/media";
import { useChatRealtime } from "@/hooks/useChatRealtime";
import { useCompanyRealtime } from "@/hooks/useCompanyRealtime";

export default function MyChatsPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatWithLastMessageDTO[]>([]);
  const [appointmentByChat, setAppointmentByChat] = useState<Record<number, boolean>>({});
  const [summaryStateByChat, setSummaryStateByChat] = useState<Record<number, { loading: boolean; interested?: boolean; summary?: string }>>({});
  const [selectedChat, setSelectedChat] = useState<ChatWithLastMessageDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Array<{ file: File; type: "image" | "video" | "audio" | "document"; id: string }>>([]);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterPriority, setFilterPriority] = useState<string | undefined>(undefined);
  const [filterHasAppointment, setFilterHasAppointment] = useState<boolean | undefined>(undefined);
  const [filterHasResponse, setFilterHasResponse] = useState<boolean | undefined>(undefined);
  const [filterLastDays, setFilterLastDays] = useState<number | undefined>(7);
  const [filterQ, setFilterQ] = useState("");
  const [companyTags, setCompanyTags] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [excludeSnoozed, setExcludeSnoozed] = useState<boolean>(false);
  const [selectedChatIds, setSelectedChatIds] = useState<Set<number>>(new Set());
  const [users, setUsers] = useState<Array<{ id: number; first_name: string; last_name: string; company_id?: number | null }>>([]);
  const [notes, setNotes] = useState<Array<{ id: number; chat_id: number; user_id: number; content: string; created_at: string }>>([]);
  const [newNote, setNewNote] = useState("");
  const [templates, setTemplates] = useState<Array<{ id: number; name: string; items: Array<{ order_index: number; item_type: string; text_content?: string; media_url?: string; caption?: string }> }>>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [insights, setInsights] = useState<{
    chatSentiment: { label: 'positive'|'neutral'|'negative'; score: number } | null;
    intents: string[];
    entities: Array<{ type: string; value: string }>;
    suggestedActions: Array<{ action: string; reason?: string }>;
    suggestedReply?: string | null;
    toneWarnings: string[];
    interestProbability?: number | null;
    churnRisk?: number | null;
    candidateReplies?: string[];
  }>({ chatSentiment: null, intents: [], entities: [], suggestedActions: [], suggestedReply: null, toneWarnings: [], interestProbability: null, churnRisk: null, candidateReplies: [] });
  const [myAppointments, setMyAppointments] = useState<Array<{ id: number; chat_id: number; assigned_user_id: number; start_at: string }>>([]);
  const [calendarView, setCalendarView] = useState<'week'|'month'>('week');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const chatById = useMemo(() => {
    const map = new Map<number, ChatWithLastMessageDTO>();
    chats.forEach(c => map.set(c.id, c));
    return map;
  }, [chats]);

  useEffect(() => {
    const load = async () => {
      if (!currentUser?.company_id || !currentUser?.id) return;
      try {
        setLoading(true);
        const all = await api.chats.list(currentUser.company_id, {
          status: filterStatus,
          priority: filterPriority,
          has_appointment: filterHasAppointment,
          has_response: filterHasResponse,
          last_days: filterLastDays,
          q: filterQ || undefined,
          tag_ids: selectedTagIds.length ? selectedTagIds : undefined,
          pinned_by_user_id: currentUser.id,
          exclude_snoozed_for_user_id: excludeSnoozed ? currentUser.id : undefined,
        });
        setChats(all);
      } catch (e) {
        setError("Error al cargar los chats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser?.company_id, currentUser?.id, filterStatus, filterPriority, filterHasAppointment, filterHasResponse, filterLastDays, filterQ, selectedTagIds, excludeSnoozed]);

  const myChats = useMemo(() => {
    if (!currentUser?.id) return [] as ChatWithLastMessageDTO[];
    return chats.filter((c) => c.assigned_user_id === currentUser.id);
  }, [chats, currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.company_id) return;
    const missing = myChats.filter((c) => appointmentByChat[c.id] === undefined);
    if (missing.length === 0) return;
    (async () => {
      const updates: Record<number, boolean> = {};
      for (const c of missing) {
        try {
          const appts = await api.chats.listAppointments(c.id, currentUser.company_id as number);
          updates[c.id] = appts.length > 0;
        } catch {
          updates[c.id] = false;
        }
      }
      setAppointmentByChat((prev) => ({ ...prev, ...updates }));
    })();
  }, [myChats, currentUser?.company_id, appointmentByChat]);

  useEffect(() => {
    const loadAppts = async () => {
      if (!currentUser?.company_id) return;
      const results: Array<{ id: number; chat_id: number; assigned_user_id: number; start_at: string }> = [];
      for (const c of myChats) {
        try {
          const list = await api.chats.listAppointments(c.id, currentUser.company_id);
          list.forEach(a => results.push({ id: a.id, chat_id: c.id, assigned_user_id: a.assigned_user_id, start_at: a.start_at }));
        } catch {}
      }
      setMyAppointments(results.sort((a,b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()));
    };
    loadAppts();
  }, [myChats, currentUser?.company_id]);

  const goPrev = () => {
    const d = new Date(calendarDate);
    if (calendarView === 'week') d.setDate(d.getDate() - 7); else d.setMonth(d.getMonth() - 1);
    setCalendarDate(d);
  };
  const goNext = () => {
    const d = new Date(calendarDate);
    if (calendarView === 'week') d.setDate(d.getDate() + 7); else d.setMonth(d.getMonth() + 1);
    setCalendarDate(d);
  };
  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // ISO week (Mon=1)
    d.setDate(d.getDate() + diff);
    d.setHours(0,0,0,0);
    return d;
  };
  const daysInMonth = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    return new Date(y, m+1, 0).getDate();
  };
  const sameDay = (a: Date, b: Date) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  const fmtDate = (d: Date) => d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  const fmtTime = (iso: string) => formatTime(iso);

  const suggestSlotsLocal = (date: Date) => {
    const slots: string[] = [];
    const workStart = 9, workEnd = 18, step = 30;
    const appts = myAppointments.filter(a => sameDay(new Date(a.start_at), date));
    const busy = appts.map(a => ({
      start: new Date(a.start_at).getTime(),
      end: new Date(new Date(a.start_at).getTime() + step*60000).getTime()
    }));
    const start = new Date(date); start.setHours(workStart,0,0,0);
    const end = new Date(date); end.setHours(workEnd,0,0,0);
    let cur = new Date(start);
    while (cur < end && slots.length < 8) {
      const curEnd = new Date(cur.getTime() + step*60000);
      const overlaps = busy.some(b => !(curEnd.getTime() <= b.start || cur.getTime() >= b.end));
      if (!overlaps) slots.push(cur.toISOString());
      cur = new Date(cur.getTime() + step*60000);
    }
    return slots;
  };

  const sendAppointmentText = async (appt: {chat_id:number; start_at:string}, kind: 'reminder'|'confirm') => {
    if (!currentUser?.company_id || !currentUser?.id) return;
    const date = new Date(appt.start_at);
    const dateStr = date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    const content = kind==='reminder' ? `Recordatorio: tienes una cita el ${dateStr}` : `Confirmación: tu cita está agendada para el ${dateStr}`;
    const payload: SendMessageRequestDTO = { chat_id: appt.chat_id, content, message_type: 'text' };
    await api.chats.sendMessage(payload, currentUser.company_id, currentUser.id);
  };

  const reprogramAppointment = async (apptId: number, chatId: number, newIso: string) => {
    if (!currentUser?.company_id) return;
    try {
      await api.chats.updateAppointment(apptId, currentUser.company_id, { start_at: newIso });
      const refreshed = await api.chats.listAppointments(chatId, currentUser.company_id);
      setMyAppointments(prev => {
        const others = prev.filter(a => a.id !== apptId);
        const f = refreshed.find(a => a.id === apptId);
        return f ? [...others, { id: f.id, chat_id: chatId, assigned_user_id: f.assigned_user_id, start_at: f.start_at }].sort((a,b)=> new Date(a.start_at).getTime()-new Date(b.start_at).getTime()) : prev;
      });
      alert('Cita reprogramada');
    } catch (e) {
      alert('No se pudo reprogramar (posible conflicto)');
    }
  };

  const handleGenerateSummary = async (chatId: number) => {
    if (!currentUser?.company_id) return;
    setSummaryStateByChat((prev) => ({ ...prev, [chatId]: { ...prev[chatId], loading: true } }));
    try {
      const res = await api.chats.generateSummary({ chat_id: chatId }, currentUser.company_id);
      setSummaryStateByChat((prev) => ({
        ...prev,
        [chatId]: { loading: false, interested: res.interest === "Interesado", summary: res.summary },
      }));
    } catch {
      setSummaryStateByChat((prev) => ({ ...prev, [chatId]: { loading: false } }));
    }
  };

  useEffect(() => {
    if (!selectedChat?.id || !currentUser?.company_id) return;
    const load = async () => {
      try {
        setLoadingMessages(true);
        const msgs = await api.chats.getMessages(selectedChat.id, currentUser.company_id as number, 100);
        setMessages(msgs);
        const ns = await api.chats.listNotes(selectedChat.id, currentUser.company_id as number);
        setNotes(ns);
      } finally {
        setLoadingMessages(false);
      }
    };
    load();
  }, [selectedChat?.id, currentUser?.company_id]);

  const refreshInsights = async () => {
    if (!selectedChat?.id || !currentUser?.company_id) {
      setInsights({ chatSentiment: null, intents: [], entities: [], suggestedActions: [], suggestedReply: null, toneWarnings: [], interestProbability: null, churnRisk: null });
      return;
    }
    try {
      const payloadMessages = messages
        .filter(m => m.message_type === 'text')
        .slice(-100)
        .map(m => ({ id: m.id, content: m.content, message_type: m.message_type, direction: m.direction, created_at: m.created_at }));
      const data = await api.chats.insights(selectedChat.id, currentUser.company_id, 100, payloadMessages as Array<{ id?: number; content: string; message_type?: string; direction?: string; created_at?: string }>);
      // Si backend soporta mensajes enviados, usarlo; de lo contrario, segundo intento con solo chat_id
      const parsed = data;
      setInsights({
        chatSentiment: parsed.chat_sentiment ? { label: parsed.chat_sentiment.label as 'positive'|'neutral'|'negative', score: parsed.chat_sentiment.score } : null,
        intents: parsed.intents || [],
        entities: parsed.entities || [],
        suggestedActions: parsed.suggested_actions || [],
        suggestedReply: parsed.suggested_reply || null,
        toneWarnings: parsed.tone_warnings || [],
        interestProbability: parsed.interest_probability ?? null,
        churnRisk: parsed.churn_risk ?? null,
      });
    } catch {
      setInsights({ chatSentiment: null, intents: [], entities: [], suggestedActions: [], suggestedReply: null, toneWarnings: [], interestProbability: null, churnRisk: null });
    }
  };

  const translateIntent = (intent: string): string => {
    const raw = intent.toLowerCase().trim();
    const key = raw.replace(/[^a-z\s_\-]/g, '').replace(/\s+/g, '_');
    const map: Record<string, string> = {
      appointment_inquiry: 'consulta de cita',
      scheduling: 'agendar',
      purchase_intent: 'compra',
      frustration: 'frustración',
      information_delivery: 'entrega de información',
      user_express_dissatisfaction: 'insatisfacción del usuario',
      user_express_anger: 'enojo del usuario',
      user_insult: 'insulto del usuario',
      user_inquire_cancellation_process: 'consulta sobre cancelación',
      user_question_appointment_purpose: 'pregunta sobre propósito de cita',
      user_test_system: 'prueba del sistema',
      agent_apologize: 'el agente se disculpa',
      agent_de_escalate: 'desescalada del agente',
      agent_gather_information: 'el agente solicita información',
      agent_provide_appointment_reminder: 'el agente recuerda cita',
      agent_greet: 'saludo del agente',
    };
    if (map[key]) return map[key];
    if (raw.includes('appointment')) return 'cita';
    if (raw.includes('cancel')) return 'cancelación';
    if (raw.includes('anger') || raw.includes('angry')) return 'enojo del usuario';
    if (raw.includes('dissatisfaction') || raw.includes('frustration')) return 'insatisfacción del usuario';
    if (raw.includes('apolog')) return 'el agente se disculpa';
    return intent.replace(/[_-]+/g, ' ');
  };

  const translateActionLabel = (action: string): string => {
    const key = action.toLowerCase().replace(/[^a-z\s_\-]/g, '').replace(/\s+/g, '_');
    const map: Record<string, string> = {
      escalate_to_human_agent: 'escalar a agente',
      escalate_to_supervisor: 'escalar a supervisor',
      escalate_to_supervisor_team_lead: 'escalar a supervisor',
      check_appointment_status: 'ver estado de cita',
      apologize_for_inconvenience: 'disculparse',
      request_additional_info: 'pedir más información',
      confirm_appointment: 'confirmar cita',
      reschedule_appointment: 'reprogramar cita',
      provide_information: 'enviar información',
      offer_discount: 'ofrecer descuento',
      proactive_outreach_phone_call: 'llamada proactiva',
      review_user_account_history: 'revisar historial de usuario',
      analyze_agents_repeated_responses: 'analizar respuestas repetitivas',
      agendar: 'agendar',
      enviar_oferta: 'enviar oferta',
      pedir_datos_contacto: 'pedir datos',
    };
    return map[key] || action.replace(/[_-]+/g, ' ');
  };

  const buildActionMessage = (action: string): string => {
    const key = action.toLowerCase().replace(/[^a-z\s_\-]/g, '').replace(/\s+/g, '_');
    const map: Record<string, string> = {
      escalate_to_human_agent: 'Te voy a poner en contacto con un agente para ayudarte mejor.',
      escalate_to_supervisor: 'Voy a escalar tu caso a un supervisor para una atención prioritaria.',
      escalate_to_supervisor_team_lead: 'Voy a escalar tu caso a un supervisor para una atención prioritaria.',
      check_appointment_status: '¿Me confirmas tu nombre o número de cita para revisar el estado?',
      apologize_for_inconvenience: 'Lamentamos las molestias. Vamos a ayudarte de inmediato.',
      request_additional_info: '¿Podrías compartir más detalles para asistirte mejor?',
      confirm_appointment: 'Confirmamos tu cita. ¿Deseas recibir un recordatorio?',
      reschedule_appointment: '¿Deseas reprogramar tu cita? Indícame tu disponibilidad.',
      provide_information: 'Comparto la información solicitada. ¿Hay algo más en lo que pueda ayudarte?',
      offer_discount: 'Podemos ofrecerte una condición especial. ¿Te interesa?',
      proactive_outreach_phone_call: '¿Puedo llamarte para resolverlo más rápido? Indícame un número y horario de preferencia.',
      review_user_account_history: 'Voy a revisar tu historial para darte una solución precisa.',
      analyze_agents_repeated_responses: 'Revisaremos nuestras respuestas para mejorar la atención de ahora en adelante.',
      agendar: '¿Te parece si agendamos una cita? Indícame tu disponibilidad.',
      enviar_oferta: 'Te comparto una oferta personalizada. ¿Te interesa revisarla?',
      pedir_datos_contacto: '¿Me confirmas tu nombre completo y correo para avanzar, por favor?',
    };
    return map[key] || '';
  };

  useEffect(() => {
    const loadTemplates = async () => {
      if (!currentUser?.company_id) return;
      try {
        setTemplatesLoading(true);
        const list = await api.templates.list(currentUser.company_id);
        setTemplates(list);
      } catch {
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };
    loadTemplates();
  }, [currentUser?.company_id]);

  const handleSendTemplate = async (template: { id: number; name: string; items: Array<{ order_index: number; item_type: string; text_content?: string; media_url?: string; caption?: string }> }, chatId: number) => {
    if (!currentUser?.company_id || !currentUser?.id) return;
    const companyId = currentUser.company_id;
    const userId = currentUser.id;
    const sorted = [...template.items].sort((a, b) => a.order_index - b.order_index);
    for (const it of sorted) {
      if (it.item_type === 'text' && it.text_content) {
        await api.chats.sendMessage({ chat_id: chatId, content: it.text_content, message_type: 'text' }, companyId, userId);
      } else if (it.media_url && ['image','video','audio','document'].includes(it.item_type)) {
        await api.chats.sendMediaLink({ chat_id: chatId, media_url: it.media_url, message_type: it.item_type, caption: it.caption }, companyId, userId);
      }
    }
  };

  useChatRealtime<{ company_id: number } & MessageDTO>(
    currentUser?.company_id || undefined,
    selectedChat?.id,
    {
      enabled: Boolean(selectedChat?.id && currentUser?.company_id),
      onEvent: (evt) => {
        if (evt.event === "message.created") {
          const msg = evt.data as unknown as MessageDTO & { company_id?: number };
          if (msg.chat_id === selectedChat?.id) {
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === msg.id);
              if (exists) return prev;
              return [...prev, msg];
            });
          }
          (async () => {
            if (!currentUser?.company_id) return;
            try {
              const all = await api.chats.list(currentUser.company_id);
              setChats(all);
            } catch {}
          })();
        }
      },
    }
  );

  useCompanyRealtime<{ chat_id: number; company_id: number; last_message: MessageDTO }>(
    currentUser?.company_id || undefined,
    {
      enabled: Boolean(currentUser?.company_id),
      onEvent: () => {
        if (!currentUser?.company_id) return;
        api.chats
          .list(currentUser.company_id, {
            status: filterStatus,
            priority: filterPriority,
            has_appointment: filterHasAppointment,
            has_response: filterHasResponse,
            last_days: filterLastDays,
            q: filterQ || undefined,
            tag_ids: selectedTagIds.length ? selectedTagIds : undefined,
            pinned_by_user_id: currentUser.id,
            exclude_snoozed_for_user_id: excludeSnoozed ? currentUser.id : undefined,
          })
          .then(setChats)
          .catch(() => {});
      },
    }
  );

  const handleFileSelect = (file: File, type: "image" | "video" | "audio" | "document") => {
    const it = { file, type, id: `${Date.now()}_${Math.random().toString(36).slice(2)}` };
    setSelectedFiles((prev) => [...prev, it]);
  };

  const removeSelectedFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  const handleAudioRecorded = (audioBlob: Blob) => {
    const audioFile = new File([audioBlob], `audio_${Date.now()}.wav`, { type: "audio/wav" });
    const it = { file: audioFile, type: "audio" as const, id: `${Date.now()}_${Math.random().toString(36).slice(2)}` };
    setSelectedFiles((prev) => [...prev, it]);
    setShowAudioRecorder(false);
  };

  const sendFiles = async (caption?: string) => {
    if (selectedFiles.length === 0 || !selectedChat || sending) return;
    try {
      setSending(true);
      const companyId = currentUser?.company_id;
      const userId = currentUser?.id;
      if (!companyId || !userId) return;
      for (let i = 0; i < selectedFiles.length; i++) {
        const fileData = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", fileData.file);
        formData.append("chat_id", selectedChat.id.toString());
        formData.append("message_type", fileData.type);
        if (caption && i === 0) formData.append("caption", caption);
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(`${baseUrl}/api/chats/send-file?company_id=${companyId}&user_id=${userId}`, { method: "POST", body: formData });
        if (!response.ok) throw new Error(`Error ${response.status}`);
      }
      setSelectedFiles([]);
      const msgs = await api.chats.getMessages(selectedChat.id, companyId, 100);
      setMessages(msgs);
    } catch {
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
      if (!companyId || !userId) return;
      const payload: SendMessageRequestDTO = { chat_id: selectedChat.id, content: sticker.url, message_type: "sticker" };
      await api.chats.sendMessage(payload, companyId, userId);
      const msgs = await api.chats.getMessages(selectedChat.id, companyId, 100);
      setMessages(msgs);
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleStickerSelect = (sticker: CompanyStickerDTO) => {
    setShowStickerPicker(false);
    sendSticker(sticker);
  };

  const handlePin = async (chatId: number) => {
    if (!currentUser?.id) return;
    await api.chats.pin(chatId, currentUser.id);
    if (!currentUser?.company_id) return;
    const all = await api.chats.list(currentUser.company_id);
    setChats(all);
  };

  const handleSnooze1h = async (chatId: number) => {
    if (!currentUser?.id) return;
    const until = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await api.chats.snooze(chatId, currentUser.id, until);
    if (!currentUser?.company_id) return;
    const all = await api.chats.list(currentUser.company_id);
    setChats(all);
  };

  const applyBulk = async (args: { status?: string; priority?: string; assigned_user_id?: number; tag_ids?: number[] }) => {
    if (!currentUser?.company_id || selectedChatIds.size === 0) return;
    await api.chats.bulk(currentUser.company_id, {
      chat_ids: Array.from(selectedChatIds),
      ...args,
    });
    const all = await api.chats.list(currentUser.company_id, {
      status: filterStatus,
      priority: filterPriority,
      has_appointment: filterHasAppointment,
      has_response: filterHasResponse,
      last_days: filterLastDays,
      q: filterQ || undefined,
      tag_ids: selectedTagIds.length ? selectedTagIds : undefined,
      pinned_by_user_id: currentUser.id,
      exclude_snoozed_for_user_id: excludeSnoozed ? currentUser.id : undefined,
    });
    setChats(all);
    setSelectedChatIds(new Set());
  };

  const exportSelectedToCsv = () => {
    const rows = chats.filter((c) => selectedChatIds.has(c.id));
    if (rows.length === 0) return;
    const headers = [
      "id",
      "customer_name",
      "phone_number",
      "status",
      "priority",
      "last_message",
      "last_message_at",
    ];
    const csv = [
      headers.join(","),
      ...rows.map((r) => {
        const last = r.last_message?.content
          ? r.last_message.content.replace(/\n/g, " ").replace(/"/g, "'")
          : "";
        const vals = [
          r.id,
          r.customer_name || "",
          r.phone_number,
          r.status || "",
          r.priority || "",
          last,
          String(r.last_message_time || r.last_message_at || ""),
        ];
        return vals
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",");
      }),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chats_seleccionados.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || sending) return;
    try {
      setSending(true);
      const companyId = currentUser?.company_id;
      const userId = currentUser?.id;
      if (!companyId || !userId) return;
      const payload: SendMessageRequestDTO = { chat_id: selectedChat.id, content: newMessage.trim(), message_type: "text" };
      await api.chats.sendMessage(payload, companyId, userId);
      setNewMessage("");
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const improveDraft = () => {
    if (!newMessage.trim()) return;
    let s = newMessage.trim().replace(/\s+/g, ' ');
    s = s.charAt(0).toUpperCase() + s.slice(1);
    if (!/[\.!?]$/.test(s)) s += '.';
    setNewMessage(s);
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatLastMessage = (content: string) => {
    if (!content) return "Sin mensajes";
    return content.length > 60 ? content.slice(0, 60) + "..." : content;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card title={`Asignados (${myChats.length})`}>
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <select className="border rounded px-2 py-1 text-sm" value={filterStatus || ""} onChange={e => setFilterStatus(e.target.value || undefined)}>
                  <option value="">Estado</option>
                  <option value="active">Abierto</option>
                  <option value="closed">Cerrado</option>
                </select>
                <select className="border rounded px-2 py-1 text-sm" value={filterPriority || ""} onChange={e => setFilterPriority(e.target.value || undefined)}>
                  <option value="">Prioridad</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
                <select className="border rounded px-2 py-1 text-sm" value={String(filterHasAppointment ?? "")} onChange={e => setFilterHasAppointment(e.target.value === "" ? undefined : e.target.value === "true")}>
                  <option value="">Cita</option>
                  <option value="true">Con cita</option>
                  <option value="false">Sin cita</option>
                </select>
                <select className="border rounded px-2 py-1 text-sm" value={String(filterHasResponse ?? "")} onChange={e => setFilterHasResponse(e.target.value === "" ? undefined : e.target.value === "true")}>
                  <option value="">Respuesta</option>
                  <option value="true">Con respuesta</option>
                  <option value="false">Sin respuesta</option>
                </select>
                <select className="border rounded px-2 py-1 text-sm" value={String(filterLastDays ?? "")} onChange={e => setFilterLastDays(e.target.value === "" ? undefined : Number(e.target.value))}>
                  <option value="">Sin rango</option>
                  <option value="7">Últimos 7 días</option>
                  <option value="30">Últimos 30 días</option>
                  <option value="90">Últimos 90 días</option>
                </select>
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                  <input type="checkbox" checked={excludeSnoozed} onChange={e => setExcludeSnoozed(e.target.checked)} />
                  <span>Ocultar snoozed</span>
                </label>
              </div>
              <input className="w-full border rounded px-2 py-1 text-sm" placeholder="Buscar por nombre, teléfono o mensaje" value={filterQ} onChange={e => setFilterQ(e.target.value)} />
            </div>
            {selectedChatIds.size > 0 && (
              <div className="border rounded p-2 space-y-2 mb-4">
                <div className="text-xs text-gray-600">Acciones masivas ({selectedChatIds.size})</div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    onChange={(e) => applyBulk({ status: e.target.value || undefined })}
                  >
                    <option value="">Cambiar estado</option>
                    <option value="active">Abierto</option>
                    <option value="closed">Cerrado</option>
                  </select>
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    onChange={(e) => applyBulk({ priority: e.target.value || undefined })}
                  >
                    <option value="">Cambiar prioridad</option>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    onChange={(e) =>
                      applyBulk({
                        assigned_user_id: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  >
                    <option value="">Reasignar a</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    onChange={(e) =>
                      applyBulk({
                        tag_ids: e.target.value ? [Number(e.target.value)] : undefined,
                      })
                    }
                  >
                    <option value="">Aplicar etiqueta</option>
                    {companyTags.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="w-full px-2 py-1 rounded text-white text-xs"
                  style={{
                    background:
                      "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                  }}
                  onClick={exportSelectedToCsv}
                >
                  Exportar CSV
                </button>
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                <span className="ml-2 text-gray-600 text-sm">Cargando...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            ) : myChats.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No tienes chats asignados</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {myChats.map((chat) => (
                  <div key={chat.id} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="mr-3" checked={selectedChatIds.has(chat.id)} onChange={() => setSelectedChatIds(prev => { const next = new Set(prev); if (next.has(chat.id)) next.delete(chat.id); else next.add(chat.id); return next; })} />
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold mr-4 shadow-sm" style={{ backgroundColor: "#2c4687" }}>
                      {(chat.customer_name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {chat.customer_name || "Usuario desconocido"}
                        </h3>
                        <span className="text-xs text-gray-500 font-medium">
                          {chat.last_message_at ? formatTime(chat.last_message_at) : ""}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 font-mono mb-1 bg-gray-100 px-2 py-1 rounded inline-block">
                        {chat.phone_number}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.last_message ? formatLastMessage(chat.last_message.content) : "Sin mensajes"}
                      </p>
      </div>
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      {appointmentByChat[chat.id] && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Cita agendada</span>
                      )}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleGenerateSummary(chat.id)}
                          disabled={summaryStateByChat[chat.id]?.loading}
                          className="px-3 py-1 rounded text-white text-xs disabled:opacity-50"
                          style={{ background: summaryStateByChat[chat.id]?.loading ? "#9ca3af" : "linear-gradient(135deg, #2c4687 0%, #1e3566 100%)" }}
                          title="Generar resumen con IA"
                        >
                          {summaryStateByChat[chat.id]?.loading ? "Generando..." : "Resumen IA"}
                        </button>
                        {chat.assigned_user_id !== currentUser?.id && (
                          <button
                            onClick={async () => { if (!currentUser?.company_id || !currentUser?.id) return; await api.chats.assign({ chat_id: chat.id, assigned_user_id: currentUser.id, priority: (chat.priority as 'low'|'medium'|'high') || 'low' }, currentUser.company_id); const all = await api.chats.list(currentUser.company_id, { status: filterStatus, priority: filterPriority, has_appointment: filterHasAppointment, has_response: filterHasResponse, last_days: filterLastDays, q: filterQ || undefined, tag_ids: selectedTagIds.length ? selectedTagIds : undefined, pinned_by_user_id: currentUser.id, exclude_snoozed_for_user_id: excludeSnoozed ? currentUser.id : undefined, }); setChats(all); }}
                            className="px-3 py-1 rounded text-white text-xs"
                            style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                            title="Tomar chat"
                          >
                            Tomar
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedChat(chat)}
                          className="px-3 py-1 rounded text-white text-xs"
                          style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}
                          title="Abrir chat"
                        >
                          Abrir
                        </button>
                        <button
                          onClick={() => handlePin(chat.id)}
                          className="px-2 py-1 rounded text-white text-xs"
                          style={{ background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)" }}
                          title="Anclar"
                        >
                          Pin
                        </button>
                        <button
                          onClick={() => handleSnooze1h(chat.id)}
                          className="px-2 py-1 rounded text-white text-xs"
                          style={{ background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)" }}
                          title="Snooze 1h"
                        >
                          Snooze
                        </button>
                  </div>
                      {summaryStateByChat[chat.id] && summaryStateByChat[chat.id]?.summary && (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${summaryStateByChat[chat.id]?.interested ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {summaryStateByChat[chat.id]?.interested ? "Interesado" : "No interesado/Indeciso"}
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </Card>
          {selectedChat && (
            <div className="mt-4">
              <Card title="Insights IA">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="border rounded p-3 bg-white">
                    <div className="text-sm font-medium text-gray-800 mb-1">Sentimiento del chat</div>
                    <div className={`text-sm ${insights.chatSentiment?.label==='positive'?'text-green-700':insights.chatSentiment?.label==='negative'?'text-red-700':'text-gray-700'}`}>
                      {insights.chatSentiment ? `${insights.chatSentiment.label} (${insights.chatSentiment.score})` : 'N/A'}
                    </div>
                    <div className="mt-2 text-xs text-gray-600">Prob. interés: {insights.interestProbability ?? '-'} · Riesgo fuga: {insights.churnRisk ?? '-'}</div>
                  </div>
                  <div className="border rounded p-3 bg-white">
                    <div className="text-sm font-medium text-gray-800 mb-1">Intenciones</div>
                    <div className="flex flex-wrap gap-2">
                      {insights.intents.length ? insights.intents.map(x => (
                        <span key={x} className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">{x}</span>
                      )) : <span className="text-xs text-gray-500">Sin detectar</span>}
                    </div>
                    {insights.entities.length > 0 && (
                      <div className="mt-2 text-xs text-gray-700">
                        Entidades: {insights.entities.map((e,i)=> `${e.type}:${e.value}`).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="border rounded p-3 bg-white">
                    <div className="text-sm font-medium text-gray-800 mb-1">Siguiente mejor acción</div>
                  <div className="space-x-2">
                    <button className="mb-2 px-2 py-1 text-xs rounded border" onClick={refreshInsights}>Actualizar insights</button>
                      {insights.suggestedActions.length ? insights.suggestedActions.map(a => (
                        <button key={a.action} className="mb-2 px-2 py-1 text-xs rounded text-white" style={{ background: 'linear-gradient(135deg, #2c4687 0%, #1e3566 100%)' }} title={a.reason || ''} onClick={() => {
                          if (a.action==='agendar' && selectedChat) setSelectedChat(selectedChat);
                          if (a.action==='enviar_oferta' && selectedChat && currentUser?.company_id && currentUser?.id) {
                            const txt = 'Te comparto una oferta personalizada. ¿Te interesa que la revisemos juntos?';
                            api.chats.sendMessage({ chat_id: selectedChat.id, content: txt, message_type: 'text' }, currentUser.company_id, currentUser.id).catch(()=>{});
                          }
                          if (a.action==='pedir_datos_contacto' && selectedChat && currentUser?.company_id && currentUser?.id) {
                            const txt = '¿Me confirmas tu nombre completo y correo para avanzar, por favor?';
                            api.chats.sendMessage({ chat_id: selectedChat.id, content: txt, message_type: 'text' }, currentUser.company_id, currentUser.id).catch(()=>{});
                          }
                        }}>{a.action.replace('_',' ')}</button>
                      )) : <span className="text-xs text-gray-500">Sin recomendaciones</span>}
                    </div>
                    {insights.suggestedReply && (
                      <div className="mt-2 text-xs text-gray-700">Sugerencia de respuesta: “{insights.suggestedReply}”</div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card title={selectedChat ? (selectedChat.customer_name || "Usuario desconocido") : "Selecciona un chat"}>
            {selectedChat ? (
              <div className="flex flex-col h-[70vh]">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: "#2c4687" }}>
                      {(selectedChat.customer_name || "U").charAt(0).toUpperCase()}
                    </div>
        <div>
                      <div className="text-sm text-gray-700 font-medium">{selectedChat.phone_number}</div>
                      {selectedChat.priority && (
                        <div className="text-xs text-gray-500">Prioridad: {selectedChat.priority}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                      <span className="ml-2 text-gray-600 text-sm">Cargando mensajes...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500">No hay mensajes</div>
                  ) : (
                    <div className="space-y-2">
                      {messages
                        .slice()
                        .sort((a, b) => {
                          const ta = new Date(a.timestamp || a.created_at || "").getTime();
                          const tb = new Date(b.timestamp || b.created_at || "").getTime();
                          return ta - tb;
                        })
                        .map((m) => {
                          const t = m.timestamp || m.created_at || "";
                          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
                          const mediaUrl = m.message_type === "sticker" && !m.attachment_url ? m.content : m.attachment_url;
                          const fullUrl = mediaUrl ? `${baseUrl}${mediaUrl}` : undefined;
                          return (
                            <div key={m.id} className={`flex ${m.direction === "outgoing" ? "justify-end" : "justify-start"}`}>
                              <div className={`${m.direction === "outgoing" ? "bg-[var(--primary)] text-white" : "bg-white text-gray-900 border"} max-w-md px-3 py-2 rounded-lg`}>
                                {m.content && m.message_type === "text" && (
                                  <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                                )}
                                {m.message_type === "image" && fullUrl && (
                                  <div className="mt-2">
                                    <img src={fullUrl} alt="Imagen" className="max-w-xs rounded" onClick={() => window.open(fullUrl, "_blank")} />
                                  </div>
                                )}
                                {m.message_type === "sticker" && fullUrl && (
                                  <div className="mt-2">
                                    <StickerComponent src={fullUrl} alt="Sticker" onClick={() => window.open(fullUrl, "_blank")} />
                                  </div>
                                )}
                                {m.message_type === "video" && fullUrl && (
                                  <div className="mt-2">
                                    <video controls className="max-w-xs rounded" style={{ maxHeight: "300px" }}>
                                      <source src={fullUrl} type="video/mp4" />
                                    </video>
                                  </div>
                                )}
                                {m.message_type === "audio" && fullUrl && (
                                  <div className="mt-2">
                                    <AudioPlayer src={fullUrl} />
                                  </div>
                                )}
                                {(m.message_type === "document" || m.message_type === "file") && fullUrl && (
                                  <div className="mt-2">
                                    <FileAttachment fileName={(mediaUrl || "").split("/").pop() || "archivo"} fileUrl={fullUrl} fileType={(mediaUrl || "").split(".").pop()} />
                                  </div>
                                )}
                                <div className={`text-[10px] mt-1 ${m.direction === "outgoing" ? "text-green-100" : "text-gray-500"}`}>{formatTime(t)}</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 bg-white">
                  <div className="p-3">
                    {showAudioRecorder ? (
                      <AudioRecorder onAudioRecorded={handleAudioRecorded} onCancel={() => setShowAudioRecorder(false)} disabled={sending} />
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-200">
                          <MediaPicker onFileSelect={handleFileSelect} onStickersClick={() => setShowStickerPicker(!showStickerPicker)} disabled={sending} />
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
                            className={`text-gray-400 transition-colors p-1 rounded-full hover:bg-gray-200 ${showStickerPicker ? "text-green-500 bg-green-100" : "hover:text-gray-600"}`}
                            disabled={sending}
                            title="Stickers"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                        {newMessage.trim() ? (
                          <button
                            onClick={sendMessage}
                            disabled={sending}
                            className="p-3 rounded-full text-white transition-all duration-200 disabled:opacity-50"
                            style={{ background: sending ? "#9ca3af" : "linear-gradient(135deg, #2c4687 0%, #1e3566 100%)" }}
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
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={async () => {
                                if (!newMessage.trim()) return; 
                                try {
                                  const res = await api.chats.assistDraft(newMessage);
                                  if (res.tone_warnings && res.tone_warnings.length > 0) {
                                    alert(res.tone_warnings.join(' \n'));
                                  }
                                  setNewMessage(res.improved || newMessage);
                                } catch {
                                  improveDraft();
                                }
                              }}
                              disabled={sending}
                              className="p-3 rounded-full text-white transition-all duration-200 disabled:opacity-50"
                              style={{ background: sending ? "#9ca3af" : "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" }}
                              title="Mejorar borrador"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l9-16-9 4-9-4 9 16z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowAudioRecorder(true)}
                              disabled={sending}
                              className="p-3 rounded-full text-white transition-all duration-200 disabled:opacity-50"
                              style={{ background: sending ? "#9ca3af" : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}
                              title="Grabar audio"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <StickerPanel isOpen={showStickerPicker} onStickerSelect={handleStickerSelect} onClose={() => setShowStickerPicker(false)} />
                  {selectedFiles.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Archivos seleccionados ({selectedFiles.length})</h3>
                        <div className="flex space-x-2">
                          <button onClick={clearAllFiles} className="text-xs text-gray-500 hover:text-gray-700">Limpiar todo</button>
                          <button onClick={() => sendFiles()} disabled={sending} className="px-3 py-1 bg-green-500 text-white text-xs rounded disabled:opacity-50">
                            {sending ? "Enviando..." : `Enviar ${selectedFiles.length > 1 ? "archivos" : "archivo"}`}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {selectedFiles.map((fd) => (
                          <div key={fd.id} className="relative group">
                            <div className="border border-gray-200 rounded-lg p-2 bg-white">
                              {fd.type === "image" ? (
                                <img src={URL.createObjectURL(fd.file)} alt={fd.file.name} className="w-full h-20 object-cover rounded" />
                              ) : (
                                <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center">
                <div className="text-center">
                                    <div className="text-2xl mb-1">{fd.type === "video" ? "🎥" : fd.type === "audio" ? "🎵" : "📄"}</div>
                                    <div className="text-xs text-gray-500 uppercase">{fd.type}</div>
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-gray-600 mt-1 truncate">{fd.file.name}</p>
                              <button onClick={() => removeSelectedFile(fd.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100">×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="border-t border-gray-200 bg-white p-3">
                    <div className="text-sm font-medium text-gray-800 mb-2">Notas</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                      {notes.map((n) => (
                        <div key={n.id} className="text-xs text-gray-700 border rounded p-2">
                          <div className="text-gray-500 text-[10px]">
                            {new Date(n.created_at).toLocaleString()}
                          </div>
                          <div>{n.content}</div>
                        </div>
                      ))}
                      {notes.length === 0 && (
                        <div className="text-xs text-gray-500">Sin notas</div>
                      )}
                </div>
                    <div className="flex items-center space-x-2">
                      <input
                        className="flex-1 border rounded px-2 py-1 text-sm"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Agregar nota"
                      />
                      <button
                        className="px-3 py-1 rounded text-white text-xs"
                        style={{
                          background:
                            "linear-gradient(135deg, #2c4687 0%, #1e3566 100%)",
                        }}
                        disabled={!newNote.trim()}
                        onClick={async () => {
                          if (!currentUser?.company_id || !currentUser?.id || !selectedChat?.id || !newNote.trim()) return;
                          await api.chats.addNote(
                            selectedChat.id,
                            currentUser.company_id,
                            currentUser.id,
                            newNote.trim()
                          );
                          const ns = await api.chats.listNotes(
                            selectedChat.id,
                            currentUser.company_id
                          );
                          setNotes(ns);
                          setNewNote("");
                        }}
                      >
                        Añadir
              </button>
            </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">Selecciona un chat de la lista para verlo aquí</div>
            )}
          </Card>
          {selectedChat && (
          <div className="mt-4">
            <Card title="Insights IA">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border rounded p-3 bg-white">
                  <div className="text-sm font-medium text-gray-800 mb-1">Sentimiento del chat</div>
                  <div className={`text-sm ${insights.chatSentiment?.label==='positive'?'text-green-700':insights.chatSentiment?.label==='negative'?'text-red-700':'text-gray-700'}`}>
                    {insights.chatSentiment ? `${insights.chatSentiment.label} (${insights.chatSentiment.score})` : 'N/A'}
                  </div>
                  <div className="mt-2 text-xs text-gray-600">Prob. interés: {insights.interestProbability ?? '-'} · Riesgo fuga: {insights.churnRisk ?? '-'}</div>
                </div>
                <div className="border rounded p-3 bg-white">
                  <div className="text-sm font-medium text-gray-800 mb-1">Intenciones</div>
                  <div className="flex flex-wrap gap-2">
                    {insights.intents.length ? insights.intents.map(x => (
                      <span key={x} className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">{translateIntent(x)}</span>
                    )) : <span className="text-xs text-gray-500">Sin detectar</span>}
                  </div>
                  {insights.entities.length > 0 && (
                    <div className="mt-2 text-xs text-gray-700">
                      Entidades: {insights.entities.map((e,i)=> `${e.type}:${e.value}`).join(', ')}
                    </div>
                  )}
                </div>
                <div className="border rounded p-3 bg-white">
                  <div className="text-sm font-medium text-gray-800 mb-1">Siguiente mejor acción</div>
                  <div className="space-x-2">
                    <button className="mb-2 px-2 py-1 text-xs rounded border" onClick={refreshInsights}>Actualizar insights</button>
                    {insights.suggestedActions.length ? insights.suggestedActions.map(a => (
                      <button key={a.action} className="mb-2 px-2 py-1 text-xs rounded text-white" style={{ background: 'linear-gradient(135deg, #2c4687 0%, #1e3566 100%)' }} title={a.reason || ''} onClick={async () => {
                        if (!selectedChat || !currentUser?.company_id || !currentUser?.id) return;
                        const txt = buildActionMessage(a.action) || insights.suggestedReply || '¿Cómo deseas continuar?';
                        await api.chats.sendMessage({ chat_id: selectedChat.id, content: txt, message_type: 'text' }, currentUser.company_id, currentUser.id);
                      }}>{translateActionLabel(a.action)}</button>
                    )) : <span className="text-xs text-gray-500">Sin recomendaciones</span>}
                  </div>
                  {insights.suggestedReply && (
                    <div className="mt-2 text-xs text-gray-700">Sugerencia de respuesta: “{insights.suggestedReply}”</div>
                  )}
                  {insights.candidateReplies && insights.candidateReplies.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-800 mb-1">Mensajes sugeridos</div>
                      <div className="flex flex-wrap gap-2">
                          {insights.candidateReplies.map((r: string, idx: number) => (
                            <button key={idx} className="px-2 py-1 text-xs rounded border hover:bg-gray-50" title={r} onClick={async ()=>{
                            if (!selectedChat || !currentUser?.company_id || !currentUser?.id) return;
                              await api.chats.sendMessage({ chat_id: selectedChat.id, content: r, message_type: 'text' }, currentUser.company_id, currentUser.id);
                            }}>{r.length > 40 ? r.slice(0,40)+'…' : r}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
          )}
          <Card title="Agenda">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <button className={`px-2 py-1 text-xs rounded ${calendarView==='week' ? 'bg-[var(--color-primary)] text-white' : 'border'}`} onClick={()=>setCalendarView('week')}>Semana</button>
                  <button className={`px-2 py-1 text-xs rounded ${calendarView==='month' ? 'bg-[var(--color-primary)] text-white' : 'border'}`} onClick={()=>setCalendarView('month')}>Mes</button>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-2 py-1 text-xs border rounded" onClick={goPrev}>{'<'}</button>
                  <div className="text-sm text-gray-700">
                    {calendarView==='week' ? `Semana de ${fmtDate(startOfWeek(calendarDate))}` : calendarDate.toLocaleDateString('es-ES', { month:'long', year:'numeric' })}
                  </div>
                  <button className="px-2 py-1 text-xs border rounded" onClick={goNext}>{'>'}</button>
                </div>
              </div>
              {calendarView==='week' ? (
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({length:7}).map((_,i)=>{
                    const d = new Date(startOfWeek(calendarDate)); d.setDate(d.getDate()+i);
                    const dayAppts = myAppointments.filter(a => sameDay(new Date(a.start_at), d));
                    return (
                      <div key={i} className="border rounded p-2 bg-white">
                        <div className="text-xs font-medium text-gray-700 mb-2">{d.toLocaleDateString('es-ES', { weekday:'short', day:'2-digit' })}</div>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {dayAppts.map(a => (
                            <div key={a.id} className="text-xs p-2 rounded border flex items-center justify-between">
                              <div>
                                <div className="font-medium">{fmtTime(a.start_at)}</div>
                                <div className="text-gray-600">{chatById.get(a.chat_id)?.customer_name || chatById.get(a.chat_id)?.phone_number}</div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button className="px-2 py-0.5 rounded text-white text-[10px]" style={{ background:'linear-gradient(135deg, #10b981 0%, #059669 100%)' }} onClick={()=>sendAppointmentText({chat_id:a.chat_id, start_at:a.start_at}, 'reminder')}>Recordar</button>
                                <button className="px-2 py-0.5 rounded text-white text-[10px]" style={{ background:'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }} onClick={()=>sendAppointmentText({chat_id:a.chat_id, start_at:a.start_at}, 'confirm')}>Confirmar</button>
                                <button className="px-2 py-0.5 rounded text-white text-[10px]" style={{ background:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }} onClick={async ()=>{
                                  const slots = suggestSlotsLocal(d);
                                  const choice = slots.length ? prompt(`Sugerencias (ISO):\n${slots.slice(0,5).join('\n')}\n\nO ingresa fecha y hora (YYYY-MM-DDTHH:MM):`, slots[0].slice(0,16)) : prompt('Ingresa nueva fecha (YYYY-MM-DDTHH:MM):');
                                  if (!choice) return;
                                  const iso = choice.length===16 ? `${choice}:00` : choice;
                                  await reprogramAppointment(a.id, a.chat_id, iso);
                                }}>Reprogramar</button>
                              </div>
                            </div>
                          ))}
                          {dayAppts.length===0 && (
                            <div className="text-[11px] text-gray-400">Sin citas</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({length: daysInMonth(calendarDate)}).map((_,i)=>{
                    const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), i+1);
                    const dayAppts = myAppointments.filter(a => sameDay(new Date(a.start_at), d));
                    return (
                      <div key={i} className="border rounded p-2 bg-white">
                        <div className="text-xs font-medium text-gray-700 mb-1">{d.toLocaleDateString('es-ES', { day:'2-digit' })}</div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {dayAppts.map(a => (
                            <div key={a.id} className="text-[11px] p-1 rounded border flex items-center justify-between">
                              <span>{fmtTime(a.start_at)} · {chatById.get(a.chat_id)?.customer_name || chatById.get(a.chat_id)?.phone_number}</span>
                              <button className="px-2 py-0.5 rounded text-white text-[10px]" style={{ background:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }} onClick={async ()=>{
                                const slots = suggestSlotsLocal(d);
                                const choice = slots.length ? prompt(`Sugerencias (ISO):\n${slots.slice(0,5).join('\n')}\n\nO ingresa fecha y hora (YYYY-MM-DDTHH:MM):`, slots[0].slice(0,16)) : prompt('Ingresa nueva fecha (YYYY-MM-DDTHH:MM):');
                                if (!choice) return;
                                const iso = choice.length===16 ? `${choice}:00` : choice;
                                await reprogramAppointment(a.id, a.chat_id, iso);
                              }}>Reprog.</button>
                            </div>
                          ))}
                          {dayAppts.length===0 && (
                            <div className="text-[11px] text-gray-400">—</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </Card>
          {selectedChat && (
            <div className="mt-6">
              <Card title="Plantillas">
                {templatesLoading ? (
                  <div className="text-sm text-gray-600">Cargando plantillas…</div>
                ) : templates.length === 0 ? (
                  <div className="text-sm text-gray-500">No hay plantillas configuradas.</div>
                ) : (
                  <div className="space-y-2">
                    {templates.map(t => (
                      <div key={t.id} className="p-2 border rounded flex items-center justify-between">
                        <div className="text-sm text-gray-800">{t.name}</div>
                        <button className="px-2 py-1 text-xs rounded text-white" style={{ background: 'linear-gradient(135deg, #2c4687 0%, #1e3566 100%)' }} onClick={() => handleSendTemplate(t, selectedChat.id)}>Enviar</button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
