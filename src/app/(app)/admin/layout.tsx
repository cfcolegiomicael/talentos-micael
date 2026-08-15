import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { href: "/admin/convites", label: "Convites" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/categorias", label: "Categorias" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap gap-2 border-b pb-4">
        {adminLinks.map((link) => (
          <Button
            key={link.href}
            variant="outline"
            size="sm"
            render={<Link href={link.href} />}
          >
            {link.label}
          </Button>
        ))}
      </nav>
      {children}
    </div>
  );
}
