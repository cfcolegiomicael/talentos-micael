"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/diretorio", label: "Diretório" },
  { href: "/meu-perfil", label: "Meu perfil" },
];

export function AppNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 p-4">
        <Link href="/diretorio" className="font-semibold">
          Talentos Comunidade Colégio Micael
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              className={cn(
                pathname.startsWith(link.href) && "bg-accent text-accent-foreground"
              )}
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                pathname.startsWith("/admin") && "bg-accent text-accent-foreground"
              )}
              render={<Link href="/admin/convites" />}
            >
              Admin
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sair
          </Button>
        </nav>
      </div>
    </header>
  );
}
