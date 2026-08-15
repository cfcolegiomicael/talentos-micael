import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RatingForm } from "@/components/profile/rating-form";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}

export default async function ProviderProfilePage(props: {
  params: Promise<{ profileId: string }>;
}) {
  const user = await requireUser();
  const { profileId } = await props.params;

  const profile = await prisma.providerProfile.findUnique({
    where: { id: profileId },
    include: {
      user: { select: { id: true, name: true } },
      categories: { include: { category: true } },
      photos: { orderBy: { position: "asc" } },
      ratings: {
        include: { rater: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const isOwner = profile?.user.id === user.id;
  const canView =
    !!profile && (profile.isPublished || isOwner || user.role === "ADMIN");

  if (!profile || !canView) {
    notFound();
  }

  const ratingCount = profile.ratings.length;
  const ratingAverage = ratingCount
    ? profile.ratings.reduce((sum, r) => sum + r.score, 0) / ratingCount
    : null;

  const displayName = profile.businessName || profile.user.name;
  const myRating = profile.ratings.find((r) => r.raterUserId === user.id);

  return (
    <div className="flex flex-col gap-6">
      {!profile.isPublished && (
        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          {isOwner
            ? "Este perfil ainda não está publicado — só você (e administradores) podem vê-lo."
            : "Perfil não publicado."}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold">{displayName}</h1>
        <p className="text-muted-foreground text-sm">{profile.user.name}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {profile.categories.map((c) => (
            <Badge key={c.categoryId} variant="secondary">
              {c.category.name}
            </Badge>
          ))}
        </div>
      </div>

      {profile.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {profile.photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-md bg-muted"
            >
              <Image
                src={photo.url}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sobre</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{profile.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          {profile.whatsapp && <p>WhatsApp/telefone: {profile.whatsapp}</p>}
          {profile.publicEmail && <p>E-mail: {profile.publicEmail}</p>}
          {!profile.whatsapp && !profile.publicEmail && (
            <p className="text-muted-foreground">
              Nenhum contato informado pelo prestador.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Avaliações da comunidade
            {ratingCount > 0 && (
              <span className="text-muted-foreground ml-2 font-normal">
                ★ {ratingAverage?.toFixed(1)} ({ratingCount})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {profile.ratings.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Ainda não há avaliações para este prestador.
            </p>
          )}
          {profile.ratings.map((rating, index) => (
            <div key={rating.id}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{rating.rater.name}</span>
                <span className="text-sm">★ {rating.score}</span>
              </div>
              {rating.comment && (
                <p className="text-muted-foreground mt-1 text-sm">{rating.comment}</p>
              )}
              <p className="text-muted-foreground mt-1 text-xs">
                {formatDate(rating.createdAt)}
              </p>
            </div>
          ))}

          {!isOwner && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-medium">
                  {myRating ? "Atualizar minha avaliação" : "Avaliar este prestador"}
                </p>
                <RatingForm
                  profileId={profile.id}
                  defaultValues={{
                    score: myRating?.score ?? 0,
                    comment: myRating?.comment ?? "",
                  }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
