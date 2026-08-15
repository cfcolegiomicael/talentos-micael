import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/diretorio");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="flex max-w-lg flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Talentos Waldorf Micael
        </h1>
        <p className="text-muted-foreground text-lg">
          Diretório privado de serviços da comunidade do Colégio Waldorf
          Micael. Antes de contratar fora, procure aqui — profissionais
          liberais, autônomos e empresários da nossa própria comunidade.
        </p>
        <p className="text-muted-foreground text-sm">
          Acesso restrito a membros da comunidade, por código de convite.
        </p>
      </div>
      <div className="flex gap-3">
        <Button render={<Link href="/entrar" />}>Entrar</Button>
        <Button variant="outline" render={<Link href="/registrar" />}>
          Tenho um código de convite
        </Button>
      </div>
    </div>
  );
}
