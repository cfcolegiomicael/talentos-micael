"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";

export type ProfileActionResult = {
  error?: string;
};

export async function updateProfileAction(
  input: ProfileInput
): Promise<ProfileActionResult> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const {
    fullName,
    businessName,
    description,
    address,
    whatsapp,
    publicEmail,
    categoryIds,
    isPublished,
  } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { name: fullName },
    });

    const profile = await tx.providerProfile.upsert({
      where: { userId: user.id },
      update: {
        businessName: businessName || null,
        description,
        address: address || null,
        whatsapp: whatsapp || null,
        publicEmail: publicEmail || null,
        isPublished,
      },
      create: {
        userId: user.id,
        businessName: businessName || null,
        description,
        address: address || null,
        whatsapp: whatsapp || null,
        publicEmail: publicEmail || null,
        isPublished,
      },
    });

    await tx.profileCategory.deleteMany({
      where: { providerProfileId: profile.id },
    });
    if (categoryIds.length > 0) {
      await tx.profileCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          providerProfileId: profile.id,
          categoryId,
        })),
      });
    }
  });

  revalidatePath("/meu-perfil");
  revalidatePath("/diretorio");

  return {};
}
