"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type SuggestCategoryResult = { error?: string; success?: string };

export async function suggestCategoryAction(name: string): Promise<SuggestCategoryResult> {
  const user = await requireUser();

  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { error: "Digite um nome de categoria válido." };
  }

  const existing = await prisma.category.findUnique({ where: { name: trimmed } });
  if (existing) {
    return {
      error:
        existing.status === "APPROVED"
          ? "Essa categoria já existe — selecione ela na lista."
          : "Essa categoria já foi sugerida e está aguardando aprovação de um administrador.",
    };
  }

  await prisma.category.create({
    data: {
      name: trimmed,
      slug: slugify(trimmed),
      status: "PENDING",
      suggestedById: user.id,
    },
  });

  revalidatePath("/meu-perfil");
  revalidatePath("/admin/categorias");
  return { success: "Categoria sugerida! Um administrador vai revisar em breve." };
}
