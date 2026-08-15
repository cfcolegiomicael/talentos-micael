import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ProfileForm } from "@/components/profile/profile-form";
import { PhotoUploader } from "@/components/profile/photo-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Meu perfil — Talentos Comunidade Colégio Micael" };

export default async function MeuPerfilPage() {
  const user = await requireUser();

  const [categories, profile, dbUser] = await Promise.all([
    prisma.category.findMany({ where: { status: "APPROVED" }, orderBy: { name: "asc" } }),
    prisma.providerProfile.findUnique({
      where: { userId: user.id },
      include: { categories: true, photos: { orderBy: { position: "asc" } } },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { name: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Meu perfil</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os serviços que você oferece à comunidade.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fotos</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUploader photos={profile?.photos ?? []} />
        </CardContent>
      </Card>

      <ProfileForm
        categories={categories}
        defaultValues={{
          fullName: dbUser.name,
          businessName: profile?.businessName ?? "",
          description: profile?.description ?? "",
          address: profile?.address ?? "",
          whatsapp: profile?.whatsapp ?? "",
          publicEmail: profile?.publicEmail ?? "",
          categoryIds: profile?.categories.map((c) => c.categoryId) ?? [],
          isPublished: profile?.isPublished ?? false,
        }}
      />
    </div>
  );
}
