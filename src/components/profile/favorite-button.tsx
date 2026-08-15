"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { toggleFavoriteAction, updateFavoriteNoteAction } from "@/actions/favorite-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  profileId,
  initialFavorited,
  initialNote,
}: {
  profileId: string;
  initialFavorited: boolean;
  initialNote: string;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [note, setNote] = useState(initialNote);
  const [isPending, startTransition] = useTransition();
  const [isSavingNote, startNoteTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleFavoriteAction(profileId);
      setFavorited(result.favorited);
      if (!result.favorited) setNote("");
      toast.success(result.favorited ? "Adicionado aos favoritos." : "Removido dos favoritos.");
    });
  };

  const handleSaveNote = () => {
    startNoteTransition(async () => {
      await updateFavoriteNoteAction(profileId, note);
      toast.success("Nota salva.");
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleToggle}
        className="w-fit gap-1.5"
      >
        <Star
          className={cn("size-3.5", favorited && "fill-amber-500 text-amber-500")}
        />
        {favorited ? "Favoritado" : "Favoritar"}
      </Button>

      {favorited && (
        <div className="flex flex-col gap-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nota pessoal (só você vê — ex: já usei, recomendo)"
            rows={2}
            className="text-sm"
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isSavingNote}
            onClick={handleSaveNote}
            className="w-fit"
          >
            {isSavingNote ? "Salvando..." : "Salvar nota"}
          </Button>
        </div>
      )}
    </div>
  );
}
