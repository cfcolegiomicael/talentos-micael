import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

export async function GET() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      providerProfile: {
        include: { categories: { include: { category: true } } },
      },
    },
  });

  const header = [
    "Nome",
    "E-mail",
    "Telefone",
    "Papel",
    "Status da conta",
    "Data de cadastro",
    "Nome do negócio",
    "Categorias",
    "Perfil publicado",
  ];

  const rows = users.map((user) => [
    user.name,
    user.email,
    user.phone ?? "",
    user.role === "ADMIN" ? "Admin" : "Membro",
    user.status === "ACTIVE" ? "Ativo" : "Desativado",
    formatDate(user.createdAt),
    user.providerProfile?.businessName ?? "",
    user.providerProfile?.categories.map((c) => c.category.name).join("; ") ?? "",
    user.providerProfile ? (user.providerProfile.isPublished ? "Sim" : "Não") : "",
  ]);

  const csvLines = [header, ...rows].map((row) => row.map(csvEscape).join(","));
  const csv = "﻿" + csvLines.join("\r\n");

  const filename = `talentos-micael-usuarios-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
