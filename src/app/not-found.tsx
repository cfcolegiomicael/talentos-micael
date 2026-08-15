import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="text-muted-foreground">
        O conteúdo que você procura não existe ou não está mais disponível.
      </p>
      <Button render={<Link href="/diretorio" />}>Voltar ao diretório</Button>
    </div>
  );
}
