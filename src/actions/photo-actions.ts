"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

const MAX_PHOTOS = 6;

async function getOwnProfile(userId: string) {
  return prisma.providerProfile.upsert({
    where: { userId },
    update: {},
    create: { userId, description: "" },
  });
}

export type PhotoActionResult = { error?: string };

export async function addPhotoAction(
  url: string,
  publicId: string
): Promise<PhotoActionResult> {
  const user = await requireUser();
  const profile = await getOwnProfile(user.id);

  const count = await prisma.profilePhoto.count({
    where: { providerProfileId: profile.id },
  });
  if (count >= MAX_PHOTOS) {
    return { error: `Limite de ${MAX_PHOTOS} fotos por perfil.` };
  }

  await prisma.profilePhoto.create({
    data: {
      providerProfileId: profile.id,
      url,
      publicId,
      position: count,
    },
  });

  revalidatePath("/meu-perfil");
  revalidatePath("/diretorio");
  return {};
}

export async function deletePhotoAction(photoId: string) {
  const user = await requireUser();

  const photo = await prisma.profilePhoto.findUnique({
    where: { id: photoId },
    include: { providerProfile: true },
  });
  if (!photo || photo.providerProfile.userId !== user.id) return;

  await prisma.profilePhoto.delete({ where: { id: photoId } });

  if (photo.publicId) {
    await deleteCloudinaryImage(photo.publicId).catch((error) => {
      console.error("Falha ao remover imagem do Cloudinary:", error);
    });
  }

  revalidatePath("/meu-perfil");
  revalidatePath("/diretorio");
}

export async function reorderPhotoAction(photoId: string, direction: "up" | "down") {
  const user = await requireUser();

  const photo = await prisma.profilePhoto.findUnique({
    where: { id: photoId },
    include: { providerProfile: true },
  });
  if (!photo || photo.providerProfile.userId !== user.id) return;

  const neighbor = await prisma.profilePhoto.findFirst({
    where: {
      providerProfileId: photo.providerProfileId,
      position: direction === "up" ? { lt: photo.position } : { gt: photo.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;

  await prisma.$transaction([
    prisma.profilePhoto.update({ where: { id: photo.id }, data: { position: neighbor.position } }),
    prisma.profilePhoto.update({ where: { id: neighbor.id }, data: { position: photo.position } }),
  ]);

  revalidatePath("/meu-perfil");
}
