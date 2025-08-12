"use client";
import { Button } from "@/ui/button/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Ocurrió un error</h1>
        <p className="text-foreground/70">Intenta nuevamente. Si persiste, vuelve más tarde.</p>
        <div className="flex justify-center">
          <Button onClick={() => reset()}>Reintentar</Button>
        </div>
      </div>
    </div>
  );
}


