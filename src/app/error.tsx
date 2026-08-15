"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Algo deu errado</h1>
      <p className="text-muted-foreground max-w-sm">
        Ocorreu um erro inesperado. Tente novamente — se o problema continuar,
        avise um administrador.
      </p>
      <Button onClick={() => reset()}>Tentar novamente</Button>
    </div>
  );
}
