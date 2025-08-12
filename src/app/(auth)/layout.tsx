import { PropsWithChildren } from "react";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/ui/brand/logo";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="auth-layout grid lg:grid-cols-2 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="relative hidden lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/8 via-white to-[var(--color-secondary)]/12" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(44, 70, 135, 0.1) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(138, 148, 187, 0.1) 2px, transparent 0)`,
            backgroundSize: '100px 100px'
          }} />
        </div>
        
        {/* Línea separadora más prominente */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-white/50"></div>
        
        <div className="relative z-10 h-full flex flex-col p-8 lg:p-12">
          <div className="flex items-center">
            <BrandLogo />
          </div>
          
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <div className="space-y-6 lg:space-y-8">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground/90 tracking-tight leading-tight">
                  Gestiona con
                  <span className="block text-[var(--color-primary)]">confianza</span>
                </h2>
                <p className="mt-4 lg:mt-6 text-base lg:text-lg text-foreground/70 leading-relaxed">
                  Una plataforma moderna y segura para gestionar todos tus servicios empresariales 
                  de manera eficiente y organizada.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 lg:gap-4">
                <div className="flex items-center space-x-3 p-3 lg:p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm lg:text-base text-foreground">Seguridad avanzada</p>
                    <p className="text-xs lg:text-sm text-foreground/60">Protección de datos empresariales</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 lg:p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm lg:text-base text-foreground">Rendimiento óptimo</p>
                    <p className="text-xs lg:text-sm text-foreground/60">Acceso rápido y confiable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-6 lg:pt-8">
            <p className="text-xs lg:text-sm text-foreground/50">
              © 2025 SibarConnect. Todos los derechos reservados.
            </p>
          </div>
        </div>
        
        <div className="absolute right-6 lg:right-8 top-6 lg:top-8">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-xs lg:text-sm font-medium text-foreground/70 hover:bg-white/30 hover:text-foreground transition-all duration-200"
          >
            <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver al inicio</span>
          </Link>
        </div>
        
        <div className="absolute -bottom-24 lg:-bottom-32 -left-24 lg:-left-32 opacity-5">
          <Image src="/globe.svg" alt="decorativo" width={500} height={500} className="lg:w-[600px] lg:h-[600px]" />
        </div>
      </div>
      
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 relative">
        {/* Sombra de separación adicional en el lado derecho */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent lg:hidden"></div>
        
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="mb-8 lg:mb-12 lg:hidden text-center">
            <BrandLogo />
            <p className="mt-3 lg:mt-4 text-sm lg:text-base text-foreground/60">Plataforma de gestión empresarial</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}


