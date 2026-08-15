import { ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { acceptTermsAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Termos de uso — Talentos Comunidade Colégio Micael" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(date);
}

export default async function TermosPage() {
  const user = await requireUser();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { termsAcceptedAt: true },
  });

  const alreadyAccepted = dbUser?.termsAcceptedAt ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Termos de uso</h1>
        <p className="text-muted-foreground mt-1">
          Leia com atenção antes de continuar usando a plataforma.
        </p>
      </div>

      <Card className="border border-amber-500/50">
        <CardHeader>
          <CardTitle className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
            <ShieldAlert className="mt-0.5 size-5 shrink-0" />
            ESTE TEXTO É PROVISÓRIO E AINDA PRECISA DE REVISÃO JURÍDICA ANTES DO LANÇAMENTO OFICIAL À COMUNIDADE.
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 text-sm leading-relaxed">
          <p>
            A plataforma <strong>Talentos Comunidade Colégio Micael</strong> é um espaço de ajuda
            mútua, voluntário e gratuito, criado para que famílias e profissionais da comunidade
            do Colégio Waldorf Micael possam divulgar e encontrar serviços entre si.
          </p>
          <p>
            O Colégio Waldorf Micael e a associação mantenedora não fazem parte, não organizam,
            não fiscalizam e não intermedeiam nenhuma negociação, contratação ou prestação de
            serviço realizada entre os membros a partir desta plataforma. A escola e a associação
            não endossam, recomendam nem se responsabilizam pela qualidade, idoneidade, preço ou
            resultado dos serviços e produtos oferecidos por qualquer usuário, tampouco por
            eventuais ganhos, perdas, danos ou prejuízos — financeiros ou de qualquer outra
            natureza — decorrentes de contratos firmados entre membros.
          </p>
          <p>
            O uso da plataforma e a contratação de qualquer serviço aqui divulgado são de
            responsabilidade exclusiva dos membros envolvidos, por sua própria conta e risco. Cabe
            a cada usuário avaliar, negociar e formalizar as condições que julgar adequadas antes
            de contratar ou prestar qualquer serviço.
          </p>
          <p>
            As informações de perfil (nome, contato, descrição do serviço, fotos) são de
            responsabilidade de quem as publica, que declara serem verdadeiras e atualizadas. As
            avaliações e comentários publicados por membros refletem a opinião pessoal de quem
            avalia e passam por moderação da administração antes de ficarem visíveis, mas isso não
            representa uma garantia da escola ou da associação sobre o prestador avaliado.
          </p>
          <p>
            O acesso é restrito a membros convidados da comunidade e pode ser revogado a qualquer
            momento em caso de uso indevido da plataforma.
          </p>

          <Separator />

          {alreadyAccepted ? (
            <p className="text-muted-foreground text-sm">
              Você aceitou estes termos em {formatDate(alreadyAccepted)}.
            </p>
          ) : (
            <form action={acceptTermsAction}>
              <Button type="submit">Aceito os termos</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
