"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ratingSchema, type RatingInput } from "@/lib/validations/rating";

export type RatingActionResult = { error?: string };

export async function submitRatingAction(
  profileId: string,
  input: RatingInput
): Promise<RatingActionResult> {
  const user = await requireUser();

  const parsed = ratingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { categoryId, score, comment } = parsed.data;

  const profile = await prisma.providerProfile.findUnique({
    where: { id: profileId },
    select: {
      id: true,
      userId: true,
      categories: { select: { categoryId: true } },
    },
  });
  if (!profile) {
    return { error: "Perfil não encontrado." };
  }
  if (profile.userId === user.id) {
    return { error: "Você não pode avaliar o próprio perfil." };
  }
  if (!profile.categories.some((c) => c.categoryId === categoryId)) {
    return { error: "Categoria inválida para este prestador." };
  }

  await prisma.rating.upsert({
    where: {
      providerProfileId_categoryId_raterUserId: {
        providerProfileId: profile.id,
        categoryId,
        raterUserId: user.id,
      },
    },
    update: {
      score,
      comment: comment || null,
      status: "PENDING",
    },
    create: {
      providerProfileId: profile.id,
      categoryId,
      raterUserId: user.id,
      score,
      comment: comment || null,
    },
  });

  revalidatePath(`/diretorio/${profileId}`);
  return {};
}
