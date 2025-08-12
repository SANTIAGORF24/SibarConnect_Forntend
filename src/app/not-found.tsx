import Link from "next/link";
import { Button } from "@/ui/button/button";

export default function NotFound() {
  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Página no encontrada</h1>
        <p className="text-foreground/70">La ruta solicitada no existe.</p>
        <div className="flex justify-center gap-3">
          <Link href="/">
            <Button variant="ghost">Ir al inicio</Button>
          </Link>
          <Link href="/login">
            <Button>Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


