"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ratingSchema, type RatingInput } from "@/lib/validations/rating";
import { submitRatingAction } from "@/actions/rating-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function RatingForm({
  profileId,
  defaultValues,
}: {
  profileId: string;
  defaultValues: RatingInput;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RatingInput>({
    resolver: zodResolver(ratingSchema),
    defaultValues,
  });

  const onSubmit = (data: RatingInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitRatingAction(profileId, data);
      if (result?.error) {
        setServerError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Avaliação enviada. Obrigado!");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Controller
        name="score"
        control={control}
        render={({ field }) => (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} estrela${value > 1 ? "s" : ""}`}
                onClick={() => field.onChange(value)}
                className={cn(
                  "text-2xl leading-none",
                  value <= field.value ? "text-foreground" : "text-muted-foreground/40"
                )}
              >
                ★
              </button>
            ))}
          </div>
        )}
      />
      {errors.score && <p className="text-sm text-destructive">{errors.score.message}</p>}

      <Controller
        name="comment"
        control={control}
        render={({ field }) => (
          <Textarea
            placeholder="Conte como foi sua experiência (opcional)."
            rows={3}
            {...field}
          />
        )}
      />

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div>
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? "Enviando..." : "Enviar avaliação"}
        </Button>
      </div>
    </form>
  );
}
