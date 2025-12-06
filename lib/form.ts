import { CreateFormSchema, CreateFormType } from "@/schemas/form";
import { toast } from "sonner";

const BASIC_AUTH = "Basic " + btoa(process.env.NEXT_PUBLIC_API_BASIC_AUTH || "");

export async function createForm(data: CreateFormType) {
  try {
    const validated = CreateFormSchema.parse(data);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/forms/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": BASIC_AUTH,   
      },
      body: JSON.stringify({
        user: 1, // пока нет авторизации
        title: validated.name,
        description: validated.description || null,
        type: "survey",
        status: "draft",
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API error:", errorText);
      throw new Error("Не удалось создать форму");
    }

    const newForm = await res.json();
    toast.success("Форма успешно создана!");
    return newForm;
  } catch (error: any) {
    toast.error("Ошибка: " + (error.message || "Неизвестная ошибка"));
    throw error;
  }
}