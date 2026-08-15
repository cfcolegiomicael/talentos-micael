import {
  approveCategoryAction,
  createCategoryAction,
  deleteCategoryAction,
  rejectCategoryAction,
} from "@/actions/admin-actions";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Categorias — Admin" };

export default async function CategoriasAdminPage() {
  const categories = await prisma.category.findMany({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" },
    include: { _count: { select: { profiles: true } } },
  });

  const pendingCategories = await prisma.category.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { suggestedBy: { select: { name: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      {pendingCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sugestões pendentes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pendingCategories.map((category) => (
              <div
                key={category.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{category.name}</p>
                  <p className="text-muted-foreground text-xs">
                    Sugerida por {category.suggestedBy?.name ?? "membro removido"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={approveCategoryAction.bind(null, category.id)}>
                    <Button type="submit" size="sm">
                      Aprovar
                    </Button>
                  </form>
                  <form action={rejectCategoryAction.bind(null, category.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      Rejeitar
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Nova categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCategoryAction} className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" placeholder="Ex: Fotografia" className="w-64" />
            </div>
            <Button type="submit">Adicionar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categorias existentes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 rounded-md border px-3 py-1.5"
            >
              <span className="text-sm">{category.name}</span>
              <Badge variant="secondary">{category._count.profiles}</Badge>
              {category._count.profiles === 0 && (
                <form action={deleteCategoryAction.bind(null, category.id)}>
                  <Button type="submit" variant="ghost" size="xs">
                    Remover
                  </Button>
                </form>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-muted-foreground text-sm">Nenhuma categoria cadastrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
