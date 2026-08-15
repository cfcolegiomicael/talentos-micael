import Link from "next/link";
import { Star, StarOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Meus favoritos — Talentos Comunidade Colégio Micael" };

export default async function FavoritosPage() {
  const user = await requireUser();

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      providerProfile: {
        include: {
          user: { select: { name: true } },
          categories: { include: { category: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Meus favoritos</h1>
        <p className="text-muted-foreground mt-1">
          Prestadores que você salvou, com suas anotações pessoais (visíveis só para você).
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
          <StarOff className="size-8" />
          <p>Você ainda não favoritou nenhum prestador.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {favorites.map((favorite) => {
            const profile = favorite.providerProfile;
            const displayName = profile.businessName || profile.user.name;
            return (
              <Card key={favorite.id}>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/diretorio/${profile.id}`}
                      className="flex items-center gap-1.5 font-medium hover:underline"
                    >
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      {displayName}
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.categories.map((c) => (
                      <Badge key={c.categoryId} variant="secondary">
                        {c.category.name}
                      </Badge>
                    ))}
                  </div>
                  {favorite.note && (
                    <p className="text-muted-foreground border-l-2 pl-3 text-sm whitespace-pre-wrap">
                      {favorite.note}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
