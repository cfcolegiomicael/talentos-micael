"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { suggestCategoryAction } from "@/actions/category-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CategorySuggestForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSuggest = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await suggestCategoryAction(name);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setName("");
        setOpen(false);
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted-foreground mt-3 text-left text-sm underline underline-offset-4 hover:text-foreground"
      >
        Não encontrou sua categoria? Sugira uma nova
      </button>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome da nova categoria"
        className="w-56"
      />
      <Button type="button" size="sm" disabled={isPending} onClick={handleSuggest}>
        {isPending ? "Enviando..." : "Sugerir"}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
    </div>
  );
}
