import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Star,
  Globe,
  AtSign,
  Users,
  Briefcase,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RatingForm } from "@/components/profile/rating-form";
import { FavoriteButton } from "@/components/profile/favorite-button";
import { cn } from "@/lib/utils";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}

function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}`;
}

function Stars({ score, className }: { score: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            "size-3.5",
            value <= score
              ? "fill-current text-current"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </span>
  );
}

export default async function ProviderProfilePage(props: {
  params: Promise<{ profileId: string }>;
}) {
  const user = await requireUser();
  const { profileId } = await props.params;

  const [profile, myFavorite] = await Promise.all([
    prisma.providerProfile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { id: true, name: true } },
        categories: { include: { category: true } },
        photos: { orderBy: { position: "asc" } },
        ratings: {
          include: {
            rater: { select: { name: true } },
            category: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.favorite.findUnique({
      where: { userId_providerProfileId: { userId: user.id, providerProfileId: profileId } },
    }),
  ]);

  const isOwner = profile?.user.id === user.id;
  const canView =
    !!profile && (profile.isPublished || isOwner || user.role === "ADMIN");

  if (!profile || !canView) {
    notFound();
  }

  const displayName = profile.businessName || profile.user.name;
  const hasContact = Boolean(profile.whatsapp || profile.publicEmail);
  const links = [
    { url: profile.website, label: profile.website, icon: Globe },
    { url: profile.instagramUrl, label: "Instagram", icon: AtSign },
    { url: profile.facebookUrl, label: "Facebook", icon: Users },
    { url: profile.linkedinUrl, label: "LinkedIn", icon: Briefcase },
  ].filter((link): link is { url: string; label: string; icon: typeof Globe } =>
    Boolean(link.url)
  );

  const approvedRatings = profile.ratings.filter((r) => r.status === "APPROVED");
  const ratingsByCategory = profile.categories
    .map(({ category }) => ({
      category,
      ratings: approvedRatings.filter((r) => r.categoryId === category.id),
    }))
    .filter((group) => group.ratings.length > 0);

  const myRatingsByCategory = Object.fromEntries(
    profile.ratings
      .filter((r) => r.raterUserId === user.id)
      .map((r) => [r.categoryId, { score: r.score, comment: r.comment ?? "" }])
  );

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/diretorio"
        className="text-muted-foreground flex w-fit items-center gap-1.5 text-sm hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar ao diretório
      </Link>

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
        {profile.address && (
          <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
            <MapPin className="size-3.5" />
            {profile.address}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {profile.categories.map((c) => (
            <Badge key={c.categoryId} variant="secondary">
              {c.category.name}
            </Badge>
          ))}
        </div>
        {!isOwner && (
          <div className="mt-3">
            <FavoriteButton
              profileId={profile.id}
              initialFavorited={Boolean(myFavorite)}
              initialNote={myFavorite?.note ?? ""}
            />
          </div>
        )}
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

      {hasContact && (
        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {profile.whatsapp && (
              <a
                href={whatsappLink(profile.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
              >
                <Phone className="size-3.5" />
                {profile.whatsapp}
              </a>
            )}
            {profile.publicEmail && (
              <a
                href={`mailto:${profile.publicEmail}`}
                className="flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
              >
                <Mail className="size-3.5" />
                {profile.publicEmail}
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                >
                  <Icon className="size-3.5" />
                  {link.label}
                </a>
              );
            })}
          </CardContent>
        </Card>
      )}

      {ratingsByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliações da comunidade</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {ratingsByCategory.map((group, groupIndex) => {
              const count = group.ratings.length;
              const average =
                group.ratings.reduce((sum, r) => sum + r.score, 0) / count;
              return (
                <div key={group.category.id}>
                  {groupIndex > 0 && <Separator className="mb-6" />}
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="font-medium text-sm">{group.category.name}</h3>
                    <span className="text-muted-foreground flex items-center gap-1 text-sm">
                      <Stars score={Math.round(average)} className="text-amber-500" />
                      {average.toFixed(1)} ({count})
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {group.ratings.map((rating, index) => (
                      <div key={rating.id}>
                        {index > 0 && <Separator className="mb-4" />}
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{rating.rater.name}</span>
                          <Stars score={rating.score} className="text-amber-500" />
                        </div>
                        {rating.comment && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {rating.comment}
                          </p>
                        )}
                        <p className="text-muted-foreground mt-1 text-xs">
                          {formatDate(rating.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {!isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliar este prestador</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingForm
              profileId={profile.id}
              categories={profile.categories.map((c) => c.category)}
              myRatingsByCategory={myRatingsByCategory}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
