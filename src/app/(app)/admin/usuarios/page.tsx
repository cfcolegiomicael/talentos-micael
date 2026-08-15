import { Download } from "lucide-react";
import { toggleUserRoleAction, toggleUserStatusAction } from "@/actions/admin-actions";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Usuários — Admin" };

export default async function UsuariosAdminPage() {
  const admin = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Usuários da comunidade</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          render={<a href="/api/admin/export" />}
        >
          <Download className="size-3.5" />
          Exportar dados
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === admin.id;
              return (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role === "ADMIN" ? "Admin" : "Membro"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
                      {user.status === "ACTIVE" ? "Ativo" : "Desativado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <form
                      action={toggleUserStatusAction.bind(
                        null,
                        user.id,
                        user.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
                      )}
                    >
                      <Button type="submit" variant="outline" size="sm" disabled={isSelf}>
                        {user.status === "ACTIVE" ? "Desativar" : "Ativar"}
                      </Button>
                    </form>
                    <form
                      action={toggleUserRoleAction.bind(
                        null,
                        user.id,
                        user.role === "ADMIN" ? "MEMBER" : "ADMIN"
                      )}
                    >
                      <Button type="submit" variant="outline" size="sm" disabled={isSelf}>
                        {user.role === "ADMIN" ? "Rebaixar" : "Tornar admin"}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
