import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProviderCard, type ProviderCardData } from "@/components/directory/provider-card";

export const metadata = { title: "Diretório — Talentos Comunidade Colégio Micael" };

function buildHref(q: string | undefined, categoria: string | undefined) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (categoria) params.set("categoria", categoria);
  const qs = params.toString();
  return qs ? `/diretorio?${qs}` : "/diretorio";
}

export default async function DiretorioPage(props: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const { q, categoria } = await props.searchParams;

  const [categories, profiles] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.providerProfile.findMany({
      where: {
        isPublished: true,
        ...(categoria
          ? { categories: { some: { category: { slug: categoria } } } }
          : {}),
        ...(q
          ? {
              OR: [
                { businessName: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { user: { name: { contains: q, mode: "insensitive" } } },
                {
                  categories: {
                    some: { category: { name: { contains: q, mode: "insensitive" } } },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { name: true } },
        categories: { include: { category: true } },
        photos: { orderBy: { position: "asc" }, take: 1 },
        ratings: { select: { score: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const providers: ProviderCardData[] = profiles.map((profile) => {
    const ratingCount = profile.ratings.length;
    const ratingAverage = ratingCount
      ? profile.ratings.reduce((sum, r) => sum + r.score, 0) / ratingCount
      : null;

    return {
      id: profile.id,
      displayName: profile.businessName || profile.user.name,
      description: profile.description,
      photoUrl: profile.photos[0]?.url ?? null,
      categoryNames: profile.categories.map((c) => c.category.name),
      ratingAverage,
      ratingCount,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Diretório de talentos</h1>
        <p className="text-muted-foreground mt-1">
          Serviços oferecidos por membros da comunidade do Colégio Waldorf Micael.
        </p>
      </div>

      <form method="GET" className="flex gap-2">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por serviço, nome ou categoria..."
        />
        <Button type="submit">Buscar</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link href={buildHref(q, undefined)}>
          <Badge variant={!categoria ? "default" : "secondary"}>Todas</Badge>
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={buildHref(q, categoria === category.slug ? undefined : category.slug)}
          >
            <Badge variant={categoria === category.slug ? "default" : "secondary"}>
              {category.name}
            </Badge>
          </Link>
        ))}
      </div>

      {providers.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">
          Nenhum perfil encontrado. Tente outra busca ou categoria.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}
