"use client";
import Link from "next/link";
import { Card } from "@/ui/card/card";
import { TextInput } from "@/ui/form/input";
import { Button } from "@/ui/button/button";
import { useEffect, useState } from "react";
import { Checkbox } from "@/ui/form/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { getSession } from "@/auth/session";

// Iconos SVG para mejor experiencia visual
const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.2a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const existing = getSession();
    if (existing) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await login({ email, password }, remember);
      router.push("/dashboard");
    } catch {
      setError("Credenciales inválidas. Por favor, verifica tu email y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 h-full flex items-center">
      <Card variant="elevated" className="backdrop-blur-sm w-full">
        <div className="space-y-8 lg:space-y-10">
          <header className="space-y-3 text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">Bienvenido de vuelta</h1>
            <p className="text-sm lg:text-base text-foreground/70 max-w-sm mx-auto">Accede a tu cuenta de SibarConnect para continuar gestionando tus servicios</p>
          </header>
          <form
            className="space-y-6 lg:space-y-7"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4 lg:space-y-5">
              <TextInput
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder="tu@empresa.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<MailIcon />}
                className="transition-all duration-200 hover:border-[var(--color-primary)]/30"
                required
              />
              <div className="relative">
                <TextInput
                  label="Contraseña"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<LockIcon />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l4.242 4.242M14.12 14.12L15.536 15.536" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  }
                  className="transition-all duration-200 hover:border-[var(--color-primary)]/30"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Checkbox
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                label="Recordar sesión"
              />
              <Link 
                href="#" 
                className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="text-red-500 mt-0.5">
                  <AlertIcon />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Error de autenticación</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 lg:h-12 rounded-xl font-medium text-sm lg:text-base shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 hover:from-[var(--color-primary)]/90 hover:to-[var(--color-primary)]" 
              disabled={loading || !email || !password}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner />
                  <span>Ingresando...</span>
                </div>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
          <div className="pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-foreground/70">
              ¿No tienes cuenta?{" "}
              <Link 
                href="#" 
                className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors hover:underline"
              >
                Crear cuenta nueva
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}


