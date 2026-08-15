"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ticket, Users, Tag, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin/convites", label: "Convites", icon: Ticket },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/categorias", label: "Categorias", icon: Tag },
  { href: "/admin/avaliacoes", label: "Avaliações", icon: MessageSquareText },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b pb-4">
      {adminLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname.startsWith(link.href);
        return (
          <Button
            key={link.href}
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5",
              isActive && "bg-accent text-accent-foreground"
            )}
            render={<Link href={link.href} />}
          >
            <Icon className="size-3.5" />
            {link.label}
          </Button>
        );
      })}
    </nav>
  );
}
