"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createInviteCodeAction(formData: FormData) {
  const admin = await requireAdmin();

  const label = String(formData.get("label") ?? "").trim() || null;
  const maxUses = Math.max(1, Number(formData.get("maxUses") ?? 1) || 1);
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

  await prisma.inviteCode.create({
    data: {
      code: nanoid(8).toUpperCase(),
      label,
      maxUses,
      expiresAt,
      createdById: admin.id,
    },
  });

  revalidatePath("/admin/convites");
}

export async function toggleInviteCodeAction(id: string, nextIsActive: boolean) {
  await requireAdmin();
  await prisma.inviteCode.update({
    where: { id },
    data: { isActive: nextIsActive },
  });
  revalidatePath("/admin/convites");
}

export async function rotateInviteCodeAction(id: string) {
  const admin = await requireAdmin();

  const current = await prisma.inviteCode.findUniqueOrThrow({ where: { id } });

  await prisma.$transaction([
    prisma.inviteCode.update({ where: { id }, data: { isActive: false } }),
    prisma.inviteCode.create({
      data: {
        code: nanoid(8).toUpperCase(),
        label: current.label,
        maxUses: current.maxUses,
        expiresAt: current.expiresAt,
        createdById: admin.id,
      },
    }),
  ]);

  revalidatePath("/admin/convites");
}

export async function toggleUserStatusAction(id: string, nextStatus: "ACTIVE" | "DISABLED") {
  const admin = await requireAdmin();
  if (admin.id === id) return;

  await prisma.user.update({
    where: { id },
    data: { status: nextStatus },
  });
  revalidatePath("/admin/usuarios");
}

export async function toggleUserRoleAction(id: string, nextRole: "MEMBER" | "ADMIN") {
  const admin = await requireAdmin();
  if (admin.id === id) return;

  await prisma.user.update({
    where: { id },
    data: { role: nextRole },
  });
  revalidatePath("/admin/usuarios");
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.category.upsert({
    where: { name },
    update: {},
    create: { name, slug: slugify(name) },
  });

  revalidatePath("/admin/categorias");
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();

  const inUse = await prisma.profileCategory.count({ where: { categoryId: id } });
  if (inUse > 0) return;

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categorias");
}
