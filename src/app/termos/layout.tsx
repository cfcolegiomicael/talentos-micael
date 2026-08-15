import { requireUser } from "@/lib/session";
import { AppShell } from "@/components/nav/app-shell";

export default async function TermosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return <AppShell isAdmin={user.role === "ADMIN"}>{children}</AppShell>;
}
