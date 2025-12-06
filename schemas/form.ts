import { z } from "zod";

export const CreateFormSchema = z.object({
  name: z
    .string()
    .min(4, "Название должно содержать минимум 4 символа")
    .max(100, "Слишком длинное название"),
  description: z.string().optional(),
});

export const UpdateFormSchema = CreateFormSchema.extend({
  // заглушка
});

export type CreateFormType = z.infer<typeof CreateFormSchema>;
export type UpdateFormType = z.infer<typeof UpdateFormSchema>;