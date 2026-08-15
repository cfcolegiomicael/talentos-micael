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

  const profile = await prisma.providerProfile.findUnique({
    where: { id: profileId },
    select: { id: true, userId: true },
  });
  if (!profile) {
    return { error: "Perfil não encontrado." };
  }
  if (profile.userId === user.id) {
    return { error: "Você não pode avaliar o próprio perfil." };
  }

  await prisma.rating.upsert({
    where: {
      providerProfileId_raterUserId: {
        providerProfileId: profile.id,
        raterUserId: user.id,
      },
    },
    update: {
      score: parsed.data.score,
      comment: parsed.data.comment || null,
    },
    create: {
      providerProfileId: profile.id,
      raterUserId: user.id,
      score: parsed.data.score,
      comment: parsed.data.comment || null,
    },
  });

  revalidatePath(`/diretorio/${profileId}`);
  return {};
}
