import {
  createInviteCodeAction,
  rotateInviteCodeAction,
  toggleInviteCodeAction,
} from "@/actions/admin-actions";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Convites — Admin" };

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

export default async function ConvitesAdminPage() {
  const invites = await prisma.inviteCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  });

  const registerBaseUrl = "/registrar?code=";

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo código de convite</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createInviteCodeAction}
            className="flex flex-wrap items-end gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="label">Rótulo (opcional)</Label>
              <Input id="label" name="label" placeholder="Ex: Turma 2026" className="w-48" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="maxUses">Limite de usos</Label>
              <Input
                id="maxUses"
                name="maxUses"
                type="number"
                min={1}
                defaultValue={1}
                className="w-28"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expiresAt">Validade (opcional)</Label>
              <Input id="expiresAt" name="expiresAt" type="date" className="w-44" />
            </div>
            <Button type="submit">Criar convite</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Convites emitidos</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Rótulo</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Criado por</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((invite) => {
                const exhausted = invite.useCount >= invite.maxUses;
                const expired = invite.expiresAt ? invite.expiresAt < new Date() : false;
                const effectivelyActive = invite.isActive && !exhausted && !expired;

                return (
                  <TableRow key={invite.id}>
                    <TableCell className="font-mono text-sm">
                      <a
                        href={`${registerBaseUrl}${invite.code}`}
                        className="underline underline-offset-4"
                      >
                        {invite.code}
                      </a>
                    </TableCell>
                    <TableCell>{invite.label ?? "—"}</TableCell>
                    <TableCell>
                      {invite.useCount}/{invite.maxUses}
                    </TableCell>
                    <TableCell>
                      {effectivelyActive ? (
                        <Badge>Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">
                          {!invite.isActive
                            ? "Desativado"
                            : exhausted
                              ? "Esgotado"
                              : "Expirado"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(invite.expiresAt)}</TableCell>
                    <TableCell>{invite.createdBy.name}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <form
                        action={toggleInviteCodeAction.bind(
                          null,
                          invite.id,
                          !invite.isActive
                        )}
                      >
                        <Button type="submit" variant="outline" size="sm">
                          {invite.isActive ? "Desativar" : "Ativar"}
                        </Button>
                      </form>
                      <form action={rotateInviteCodeAction.bind(null, invite.id)}>
                        <Button type="submit" variant="outline" size="sm">
                          Rotacionar
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })}
              {invites.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground text-center">
                    Nenhum convite criado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
