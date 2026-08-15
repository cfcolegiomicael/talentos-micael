"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { requireUser } from "@/lib/session";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";

export type RegisterActionResult = {
  error?: string;
};

export async function registerAction(
  input: RegisterInput
): Promise<RegisterActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { inviteCode, name, email, phone, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  const invite = await prisma.inviteCode.findUnique({
    where: { code: inviteCode },
  });

  if (!invite || !invite.isActive) {
    return { error: "Código de convite inválido." };
  }
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return { error: "Este código de convite expirou." };
  }
  if (invite.useCount >= invite.maxUses) {
    return { error: "Este código de convite atingiu o limite de usos." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.inviteCode.updateMany({
        where: { id: invite.id, useCount: { lt: invite.maxUses } },
        data: { useCount: { increment: 1 } },
      });
      if (claimed.count === 0) {
        throw new Error("INVITE_EXHAUSTED");
      }

      await tx.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          passwordHash,
          invitedById: invite.id,
        },
      });
    });
  } catch {
    return { error: "Este código de convite acabou de atingir o limite de usos. Peça um novo código." };
  }

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/meu-perfil",
  });

  return {};
}

export async function acceptTermsAction() {
  const user = await requireUser();

  await prisma.user.update({
    where: { id: user.id },
    data: { termsAcceptedAt: new Date() },
  });

  redirect("/diretorio");
}
