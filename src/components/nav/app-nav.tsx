"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Compass, UserRound, Star, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/diretorio", label: "Diretório", icon: Compass },
  { href: "/meu-perfil", label: "Meu perfil", icon: UserRound },
  { href: "/favoritos", label: "Favoritos", icon: Star },
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
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5",
                  pathname.startsWith(link.href) && "bg-accent text-accent-foreground"
                )}
                render={<Link href={link.href} />}
              >
                <Icon className="size-3.5" />
                {link.label}
              </Button>
            );
          })}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1.5",
                pathname.startsWith("/admin") && "bg-accent text-accent-foreground"
              )}
              render={<Link href="/admin/convites" />}
            >
              <ShieldCheck className="size-3.5" />
              Admin
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="size-3.5" />
            Sair
          </Button>
        </nav>
      </div>
    </header>
  );
}
