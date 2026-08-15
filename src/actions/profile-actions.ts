"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";

export type ProfileActionResult = {
  error?: string;
};

function normalizeUrl(value: string | undefined): string | null {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

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
    website,
    instagramUrl,
    facebookUrl,
    linkedinUrl,
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
        website: normalizeUrl(website),
        instagramUrl: normalizeUrl(instagramUrl),
        facebookUrl: normalizeUrl(facebookUrl),
        linkedinUrl: normalizeUrl(linkedinUrl),
        isPublished,
      },
      create: {
        userId: user.id,
        businessName: businessName || null,
        description,
        address: address || null,
        whatsapp: whatsapp || null,
        publicEmail: publicEmail || null,
        website: normalizeUrl(website),
        instagramUrl: normalizeUrl(instagramUrl),
        facebookUrl: normalizeUrl(facebookUrl),
        linkedinUrl: normalizeUrl(linkedinUrl),
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
