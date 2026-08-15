import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { AppShell } from "@/components/nav/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { termsAcceptedAt: true },
  });

  if (!dbUser?.termsAcceptedAt) {
    redirect("/termos");
  }

  return <AppShell isAdmin={user.role === "ADMIN"}>{children}</AppShell>;
}
