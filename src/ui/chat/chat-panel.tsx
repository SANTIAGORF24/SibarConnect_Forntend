"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/ui/card/card";
import { Button } from "@/ui/button/button";
import { TextInput, Select, Textarea } from "@/ui/form";
import { Badge } from "@/ui/badge/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion/accordion";
import { ScrollArea } from "@/ui/scroll-area/scroll-area";
import { useState } from "react";

export interface ChatPanelProps {
    chat: {
        id: number;
        customer_name?: string;
        phone_number: string;
        status: 'active' | 'closed';
        priority?: 'low' | 'medium' | 'high';
        assigned_user_id?: number;
    };
    users: Array<{ id: number; first_name: string; last_name: string }>;
    appointments: Array<{ id: number; assigned_user_id: number; start_at: string }>;
    templates: Array<{ id: number; name: string; items: Array<any> }>;
    onAssignUser: (userId: number | '', priority: 'low' | 'medium' | 'high') => void;
    onStatusChange: (status: 'active' | 'closed') => void;
    onGenerateSummary: () => void;
    onCreateAppointment: (data: { date: string; time: string; userId: number }) => void;
    onSendTemplate: (template: any) => void;
    summaryLoading?: boolean;
    lastSummary?: { text: string; interested: boolean };
    className?: string;
}

export function ChatPanel({
    chat,
    users,
    appointments,
    templates,
    onAssignUser,
    onStatusChange,
    onGenerateSummary,
    onCreateAppointment,
    onSendTemplate,
    summaryLoading = false,
    lastSummary,
    className,
}: ChatPanelProps) {
    const [openAccordions, setOpenAccordions] = useState({
        assignment: true,
        summary: false,
        appointments: false,
        templates: false,
    });

    const [appointmentData, setAppointmentData] = useState({
        date: '',
        time: '',
        userId: '',
    });

    const toggleAccordion = (key: keyof typeof openAccordions) => {
        setOpenAccordions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleCreateAppointment = () => {
        if (appointmentData.date && appointmentData.time && appointmentData.userId) {
            onCreateAppointment({
                date: appointmentData.date,
                time: appointmentData.time,
                userId: Number(appointmentData.userId)
            });
            setAppointmentData({ date: '', time: '', userId: '' });
        }
    };

    const getAssignedUserName = (assignedUserId?: number) => {
        if (!assignedUserId) return null;
        const user = users.find(u => u.id === assignedUserId);
        return user ? `${user.first_name} ${user.last_name}` : null;
    };

    return (
        <div className={cn("w-96 border-l border-gray-200 hidden xl:flex flex-col bg-gradient-to-b from-gray-50 to-white", className)}>
            {/* Header */}
            <Card variant="elevated" className="p-6 border-b border-gray-200 rounded-none bg-gradient-to-r from-blue-600 to-blue-700 text-white">
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
            </Card>

            {/* Content */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {/* Assignment Accordion */}
                    <Accordion type="single" collapsible value={openAccordions.assignment ? "assignment" : ""}>
                        <AccordionItem value="assignment">
                            <AccordionTrigger
                                className="text-left"
                                onClick={() => toggleAccordion('assignment')}
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span>Asignación y Prioridad</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Asignar a usuario</label>
                                        <Select
                                            options={[
                                                { value: "", label: "Sin asignar" },
                                                ...users.map(u => ({ value: u.id.toString(), label: `${u.first_name} ${u.last_name}` }))
                                            ]}
                                            value={chat.assigned_user_id?.toString() || ""}
                                            onValueChange={(value) => onAssignUser(value ? Number(value) : '', chat.priority || 'low')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                                        <Select
                                            options={[
                                                { value: "low", label: "🟢 Baja" },
                                                { value: "medium", label: "🟡 Media" },
                                                { value: "high", label: "🔴 Alta" }
                                            ]}
                                            value={chat.priority || "low"}
                                            onValueChange={(value) => onAssignUser(chat.assigned_user_id || '', value as 'low' | 'medium' | 'high')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado del cliente</label>
                                        <Select
                                            options={[
                                                { value: "active", label: "💬 Cliente abierto" },
                                                { value: "closed", label: "✅ Cliente cerrado" }
                                            ]}
                                            value={chat.status}
                                            onValueChange={(value) => onStatusChange(value as 'active' | 'closed')}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Summary Accordion */}
                    <Accordion type="single" collapsible value={openAccordions.summary ? "summary" : ""}>
                        <AccordionItem value="summary">
                            <AccordionTrigger
                                className="text-left"
                                onClick={() => toggleAccordion('summary')}
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <span>Resumen con IA</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Genera un resumen inteligente de la conversación usando IA para identificar puntos clave y el nivel de interés del cliente.
                                    </p>

                                    <Button
                                        onClick={onGenerateSummary}
                                        disabled={summaryLoading}
                                        variant="primary"
                                        fullWidth
                                        loading={summaryLoading}
                                        leftIcon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        }
                                    >
                                        {summaryLoading ? 'Generando...' : 'Generar resumen con IA'}
                                    </Button>

                                    {lastSummary && (
                                        <Card variant="glass" className="p-4">
                                            <div className="space-y-3">
                                                <h4 className="font-medium text-gray-900">Resumen Generado</h4>
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                    {lastSummary.text}
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-gray-900">Nivel de interés:</span>
                                                    <Badge variant={lastSummary.interested ? "success" : "warning"}>
                                                        {lastSummary.interested ? '✅ Alto interés' : '⚠️ Bajo interés'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Appointments Accordion */}
                    <Accordion type="single" collapsible value={openAccordions.appointments ? "appointments" : ""}>
                        <AccordionItem value="appointments">
                            <AccordionTrigger
                                className="text-left"
                                onClick={() => toggleAccordion('appointments')}
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Agenda de Citas</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Programa una cita con el cliente y asigna a un responsable.
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                            <input
                                                type="date"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={appointmentData.date}
                                                onChange={(e) => setAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                                            <input
                                                type="time"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={appointmentData.time}
                                                onChange={(e) => setAppointmentData(prev => ({ ...prev, time: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Asignar a</label>
                                        <Select
                                            options={[
                                                { value: "", label: "Seleccionar persona" },
                                                ...users.map(u => ({ value: u.id.toString(), label: `${u.first_name} ${u.last_name}` }))
                                            ]}
                                            value={appointmentData.userId}
                                            onValueChange={(value) => setAppointmentData(prev => ({ ...prev, userId: value }))}
                                        />
                                    </div>

                                    <Button
                                        onClick={handleCreateAppointment}
                                        disabled={!appointmentData.date || !appointmentData.time || !appointmentData.userId}
                                        variant="primary"
                                        fullWidth
                                        leftIcon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        }
                                    >
                                        Agendar cita
                                    </Button>

                                    {appointments.length > 0 && (
                                        <div className="pt-4 border-t">
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Citas agendadas</h5>
                                            <div className="space-y-2">
                                                {appointments.map((appointment) => {
                                                    const dt = new Date(appointment.start_at);
                                                    const dateStr = dt.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                    const timeStr = dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                                                    const assignedUser = users.find(u => u.id === appointment.assigned_user_id);

                                                    return (
                                                        <Card key={appointment.id} variant="default" className="p-3">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="text-sm text-gray-800">{dateStr} · {timeStr}</div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {assignedUser ? `${assignedUser.first_name} ${assignedUser.last_name}` : 'Sin asignar'}
                                                                    </div>
                                                                </div>
                                                                <Badge variant="outline" size="sm">ID: {appointment.id}</Badge>
                                                            </div>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Templates Accordion */}
                    <Accordion type="single" collapsible value={openAccordions.templates ? "templates" : ""}>
                        <AccordionItem value="templates">
                            <AccordionTrigger
                                className="text-left"
                                onClick={() => toggleAccordion('templates')}
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Plantillas de Mensajes</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Gestiona y utiliza plantillas de mensajes para respuestas rápidas y consistentes.
                                    </p>

                                    {templates.length === 0 ? (
                                        <Card variant="default" className="p-3">
                                            <div className="text-center">
                                                <span className="text-sm text-gray-700">📝 Plantillas disponibles: 0</span>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    No hay plantillas configuradas. Crea plantillas para responder más rápido.
                                                </p>
                                            </div>
                                        </Card>
                                    ) : (
                                        <div className="space-y-2">
                                            {templates.map((template) => (
                                                <Card key={template.id} variant="default" className="p-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-800">{template.name}</span>
                                                        <Button
                                                            onClick={() => onSendTemplate(template)}
                                                            variant="primary"
                                                            size="sm"
                                                        >
                                                            Enviar
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        fullWidth
                                        leftIcon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        }
                                    >
                                        Gestionar plantillas
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </ScrollArea>
        </div>
    );
}
