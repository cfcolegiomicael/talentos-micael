"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { addPhotoAction, deletePhotoAction, reorderPhotoAction } from "@/actions/photo-actions";
import { Button } from "@/components/ui/button";

type Photo = { id: string; url: string; position: number };

export function PhotoUploader({ photos }: { photos: Photo[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Falha ao enviar a imagem.");
        return;
      }

      const result = await addPhotoAction(data.url, data.publicId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Foto adicionada.");
      }
    } catch {
      toast.error("Falha ao enviar a imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <div key={photo.id} className="relative overflow-hidden rounded-md border">
            <Image
              src={photo.url}
              alt=""
              width={300}
              height={300}
              className="aspect-square w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-background/90 p-1">
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon-xs"
                  variant="outline"
                  disabled={index === 0 || isPending}
                  onClick={() =>
                    startTransition(() => reorderPhotoAction(photo.id, "up"))
                  }
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="outline"
                  disabled={index === photos.length - 1 || isPending}
                  onClick={() =>
                    startTransition(() => reorderPhotoAction(photo.id, "down"))
                  }
                >
                  ↓
                </Button>
              </div>
              <Button
                type="button"
                size="icon-xs"
                variant="destructive"
                disabled={isPending}
                onClick={() => startTransition(() => deletePhotoAction(photo.id))}
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          disabled={isUploading || photos.length >= 6}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading
            ? "Enviando..."
            : photos.length >= 6
              ? "Limite de 6 fotos atingido"
              : "Adicionar foto"}
        </Button>
      </div>
    </div>
  );
}
