"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function toggleFavoriteAction(profileId: string): Promise<{ favorited: boolean }> {
  const user = await requireUser();

  const existing = await prisma.favorite.findUnique({
    where: { userId_providerProfileId: { userId: user.id, providerProfileId: profileId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath(`/diretorio/${profileId}`);
    revalidatePath("/favoritos");
    return { favorited: false };
  }

  await prisma.favorite.create({
    data: { userId: user.id, providerProfileId: profileId },
  });
  revalidatePath(`/diretorio/${profileId}`);
  revalidatePath("/favoritos");
  return { favorited: true };
}

export async function updateFavoriteNoteAction(profileId: string, note: string) {
  const user = await requireUser();

  await prisma.favorite.update({
    where: { userId_providerProfileId: { userId: user.id, providerProfileId: profileId } },
    data: { note: note.trim() || null },
  });

  revalidatePath(`/diretorio/${profileId}`);
  revalidatePath("/favoritos");
}
