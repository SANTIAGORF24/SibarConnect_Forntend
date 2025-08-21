"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DialogRoot,
  DialogContent,
  DialogTitle,
  PrimaryButton,
  SecondaryButton,
  OutlineButton
} from "@/components/ui";
import { CalendarIcon, MessageCircleIcon, SparklesIcon, ClockIcon, BuildingIcon } from "lucide-react";



// Componente de Header
function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #2c4687 0%, #1e3566 100%)' }}>
              <MessageCircleIcon className="w-6 h-6" />
            </div>
            <div className="text-xl font-bold text-gray-900">SibarConnect</div>
          </div>

          {/* Botón de Login */}
          <Link href="/login">
            <SecondaryButton size="md" className="px-6 py-2.5">
              Iniciar Sesión
            </SecondaryButton>
          </Link>
        </div>
      </div>
    </header>
  );
}

// Componente de Hero Section
function HeroSection({ onScheduleMeeting }: { onScheduleMeeting: () => void }) {
  return (
    <section className="relative pt-24 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
            <SparklesIcon className="w-4 h-4 mr-2" />
            Plataforma con Inteligencia Artificial
          </div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Gestión Inteligente de{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WhatsApp Business
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Optimiza la comunicación con tus clientes usando IA + CRM especializado en WhatsApp.
            Automatiza respuestas, gestiona conversaciones y aumenta tus ventas.
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <PrimaryButton
              onClick={onScheduleMeeting}
              size="xl"
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              Agendar Cita
            </PrimaryButton>

            <SecondaryButton size="xl">
              Ver Demo
            </SecondaryButton>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Empresas confían en nosotros</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">1M+</div>
              <div className="text-gray-600">Mensajes procesados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">99.9%</div>
              <div className="text-gray-600">Tiempo de actividad</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Componente de Beneficios
function BenefitsSection() {
  const benefits = [
    {
      icon: <MessageCircleIcon className="w-8 h-8" />,
      title: "Gestión de Chats en Tiempo Real",
      description: "Maneja todas tus conversaciones de WhatsApp desde una interfaz unificada y profesional.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <SparklesIcon className="w-8 h-8" />,
      title: "Automatización con IA",
      description: "Responde automáticamente, genera resúmenes inteligentes y analiza el sentimiento de tus clientes.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <ClockIcon className="w-8 h-8" />,
      title: "Citas y Agendas Inteligentes",
      description: "Programa citas automáticamente, gestiona horarios y optimiza la agenda de tu equipo.",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: <BuildingIcon className="w-8 h-8" />,
      title: "Administración Empresarial",
      description: "Control total sobre usuarios, roles, empresas y configuraciones avanzadas del sistema.",
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            ¿Por qué elegir{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SibarConnect?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestra plataforma combina la simplicidad de WhatsApp con la potencia de un CRM empresarial
            y la inteligencia de la IA para transformar tu comunicación con clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Componente de Características
function FeaturesSection() {
  const features = [
    {
      title: "Integración WhatsApp Business",
      description: "Conecta directamente con la API oficial de WhatsApp Business para máxima confiabilidad.",
      icon: "✅"
    },
    {
      title: "CRM Inteligente",
      description: "Gestiona contactos, conversaciones y oportunidades de venta en una sola plataforma.",
      icon: "✅"
    },
    {
      title: "Análisis Avanzado",
      description: "Obtén insights detallados sobre el rendimiento de tu equipo y la satisfacción del cliente.",
      icon: "✅"
    },
    {
      title: "Multiempresa",
      description: "Administra múltiples empresas desde una sola cuenta con separación completa de datos.",
      icon: "✅"
    },
    {
      title: "API REST",
      description: "Integra SibarConnect con tus sistemas existentes mediante nuestra API robusta.",
      icon: "✅"
    },
    {
      title: "Soporte 24/7",
      description: "Equipo de soporte técnico disponible en todo momento para resolver tus dudas.",
      icon: "✅"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Características{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Destacadas
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre todas las herramientas que hacen de SibarConnect la solución definitiva
            para la gestión profesional de WhatsApp Business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="text-2xl">{feature.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Componente de CTA Final
function FinalCTASection({ onScheduleMeeting }: { onScheduleMeeting: () => void }) {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          ¿Listo para transformar tu{" "}
          <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            WhatsApp Business?
          </span>
        </h2>
        <p className="text-xl text-blue-100 mb-10 leading-relaxed">
          Únete a cientos de empresas que ya están optimizando su comunicación
          con clientes usando SibarConnect. Agenda una demostración gratuita hoy mismo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <PrimaryButton
            onClick={onScheduleMeeting}
            size="xl"
            className="bg-white text-blue-600 hover:bg-gray-50"
          >
            <CalendarIcon className="w-5 h-5 mr-2" />
            Agendar Demo Gratuita
          </PrimaryButton>

          <Link href="/login">
            <OutlineButton size="xl" className="text-white border-white hover:bg-white hover:text-blue-600">
              Comenzar Ahora
            </OutlineButton>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Componente de Footer
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #2c4687 0%, #1e3566 100%)' }}>
              <MessageCircleIcon className="w-6 h-6" />
            </div>
            <div className="text-xl font-bold">SibarConnect</div>
          </div>

          <div className="text-gray-400 text-sm">
            © 2025 SibarConnect. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}

// Modal de Agendar Cita
function ScheduleMeetingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario
    console.log('Formulario enviado:', formData);
    alert('¡Gracias! Nos pondremos en contacto contigo pronto.');
    onClose();
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <DialogContent size="2" className="sm:max-w-md">
        <DialogTitle className="text-2xl font-bold text-gray-900">
          Agenda tu Demo Gratuita
        </DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email corporativo *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa *
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre de tu empresa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+57 300 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje
            </label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Cuéntanos sobre tu empresa y necesidades..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <SecondaryButton
              type="button"
              onClick={onClose}
              size="md"
              className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              size="md"
              className="flex-1"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Agendar Demo
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}

// Página principal
export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleScheduleMeeting = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <HeroSection onScheduleMeeting={handleScheduleMeeting} />
        <BenefitsSection />
        <FeaturesSection />
        <FinalCTASection onScheduleMeeting={handleScheduleMeeting} />
      </main>

      <Footer />

      <ScheduleMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
