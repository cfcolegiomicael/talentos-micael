import { z } from "zod";

export const ratingSchema = z.object({
  categoryId: z.string().min(1, "Selecione qual serviço você está avaliando."),
  score: z.number().int().min(1, "Escolha uma nota.").max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type RatingInput = z.infer<typeof ratingSchema>;
