import { Mail, Phone } from "lucide-react";
import { approveRatingAction, rejectRatingAction } from "@/actions/admin-actions";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Avaliações — Admin" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

export default async function AvaliacoesAdminPage() {
  const pendingRatings = await prisma.rating.findMany({
    where: { status: "PENDING" },
    include: {
      rater: { select: { name: true, email: true, phone: true } },
      category: { select: { name: true } },
      providerProfile: {
        select: {
          id: true,
          businessName: true,
          user: { select: { name: true, email: true, phone: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliações pendentes de moderação</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {pendingRatings.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhuma avaliação aguardando moderação.
          </p>
        )}
        {pendingRatings.map((rating, index) => {
          const providerName =
            rating.providerProfile.businessName || rating.providerProfile.user.name;
          return (
            <div key={rating.id}>
              {index > 0 && <Separator className="mb-6" />}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{rating.rater.name}</span>
                    <span className="text-muted-foreground"> avaliou </span>
                    <span className="font-medium">{providerName}</span>
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {rating.category.name}
                  </Badge>
                  <p className="mt-2 text-sm">★ {rating.score}</p>
                  {rating.comment && (
                    <p className="text-muted-foreground mt-1 text-sm">{rating.comment}</p>
                  )}
                  <p className="text-muted-foreground mt-1 text-xs">
                    Enviada em {formatDate(rating.createdAt)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <form action={approveRatingAction.bind(null, rating.id)}>
                    <Button type="submit" size="sm">
                      Aprovar
                    </Button>
                  </form>
                  <form action={rejectRatingAction.bind(null, rating.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      Rejeitar
                    </Button>
                  </form>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground text-xs">Quem avaliou</p>
                  <p className="font-medium">{rating.rater.name}</p>
                  <p className="mt-1 flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {rating.rater.email}
                  </p>
                  {rating.rater.phone && (
                    <p className="mt-1 flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      {rating.rater.phone}
                    </p>
                  )}
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground text-xs">Quem foi avaliado</p>
                  <p className="font-medium">{rating.providerProfile.user.name}</p>
                  <p className="mt-1 flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {rating.providerProfile.user.email}
                  </p>
                  {rating.providerProfile.user.phone && (
                    <p className="mt-1 flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      {rating.providerProfile.user.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
