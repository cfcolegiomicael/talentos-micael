import { requireUser } from "@/lib/session";
import { AppNav } from "@/components/nav/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex flex-1 flex-col">
      <AppNav isAdmin={user.role === "ADMIN"} />
      <main className="mx-auto w-full max-w-5xl flex-1 p-4">{children}</main>
    </div>
  );
}
