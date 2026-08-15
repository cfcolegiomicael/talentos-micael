import { z } from "zod";

export const profileSchema = z.object({
  businessName: z.string().trim().max(120).optional().or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(20, "Descreva seu serviço com pelo menos 20 caracteres.")
    .max(2000),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  publicEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("E-mail inválido.")
    .optional()
    .or(z.literal("")),
  categoryIds: z
    .array(z.string())
    .min(1, "Selecione pelo menos uma categoria."),
  isPublished: z.boolean(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
