import { z } from "zod";

export const registerSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .min(1, "Informe o código de convite."),
  name: z.string().trim().min(2, "Informe seu nome completo."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  phone: z
    .string()
    .trim()
    .min(8, "Informe um telefone/WhatsApp válido.")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(1, "Informe sua senha."),
});

export type LoginInput = z.infer<typeof loginSchema>;
