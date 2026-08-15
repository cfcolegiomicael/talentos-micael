import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const STARTER_CATEGORIES = [
  "Marketing Digital",
  "Fotografia e Vídeo",
  "Sonorização para Eventos",
  "Manutenção de Computadores",
  "Design Gráfico",
  "Contabilidade",
  "Advocacia",
  "Arquitetura e Design de Interiores",
  "Terapias e Bem-estar",
  "Aulas Particulares",
  "Alimentação e Buffet",
  "Marcenaria e Reformas",
];

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@waldorfmicael.dev";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "troque-esta-senha";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin já existe: ${adminEmail} — pulando criação.`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });

    const code = process.env.SEED_INVITE_CODE ?? nanoid(8).toUpperCase();
    await prisma.inviteCode.create({
      data: {
        code,
        label: "Convite inicial (seed)",
        maxUses: 50,
        createdById: admin.id,
      },
    });

    console.log("Admin criado:");
    console.log(`  email: ${adminEmail}`);
    console.log(`  senha: ${adminPassword}`);
    console.log(`Código de convite inicial: ${code}`);
  }

  for (const name of STARTER_CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }
  console.log(`Categorias iniciais garantidas (${STARTER_CATEGORIES.length}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
