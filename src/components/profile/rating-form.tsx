"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ratingSchema, type RatingInput } from "@/lib/validations/rating";
import { submitRatingAction } from "@/actions/rating-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };
type MyRating = { score: number; comment: string };

export function RatingForm({
  profileId,
  categories,
  myRatingsByCategory,
}: {
  profileId: string;
  categories: Category[];
  myRatingsByCategory: Record<string, MyRating>;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const firstCategoryId = categories[0]?.id ?? "";
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RatingInput>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      categoryId: firstCategoryId,
      score: myRatingsByCategory[firstCategoryId]?.score ?? 0,
      comment: myRatingsByCategory[firstCategoryId]?.comment ?? "",
    },
  });

  const onSubmit = (data: RatingInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitRatingAction(profileId, data);
      if (result?.error) {
        setServerError(result.error);
        toast.error(result.error);
      } else {
        toast.success(
          "Avaliação enviada para moderação. Obrigado! Ela ficará visível assim que um administrador confirmar."
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      {categories.length > 1 && (
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(next) => {
                if (!next) return;
                field.onChange(next);
                const existing = myRatingsByCategory[next];
                setValue("score", existing?.score ?? 0);
                setValue("comment", existing?.comment ?? "");
              }}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Qual serviço você usou?">
                  {(value: string | null) =>
                    categories.find((c) => c.id === value)?.name ?? "Qual serviço você usou?"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}

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
