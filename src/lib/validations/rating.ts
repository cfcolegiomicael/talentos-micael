import { z } from "zod";

export const ratingSchema = z.object({
  score: z.number().int().min(1, "Escolha uma nota.").max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type RatingInput = z.infer<typeof ratingSchema>;
