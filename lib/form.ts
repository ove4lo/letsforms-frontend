// src/lib/form.ts
import { CreateFormSchema, CreateFormType } from "@/schemas/form";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const BASIC_AUTH = process.env.NEXT_PUBLIC_API_BASIC_AUTH
  ? "Basic " + btoa(process.env.NEXT_PUBLIC_API_BASIC_AUTH)
  : "";

const authHeaders = {
  "Content-Type": "application/json",
  ...(BASIC_AUTH && { Authorization: BASIC_AUTH }),
};

// === Создание формы ===
export async function createForm(data: CreateFormType) {
  try {
    const validated = CreateFormSchema.parse(data);

    const res = await fetch(`${API_BASE}/forms/`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        user: 1, // временно, потом будет из Telegram
        title: validated.name,
        description: validated.description || null,
        type: "survey",
        status: "draft",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Не удалось создать форму");
    }

    const newForm = await res.json();
    toast.success("Форма успешно создана!");
    return newForm;
  } catch (error: any) {
    toast.error(error.message || "Ошибка при создании формы");
    throw error;
  }
}

// === Тип формы с бэка ===
export type FormFromAPI = {
  id: number;
  title: string;
  description: string | null;
  type: string;
  status: "draft" | "active" | "paused" | "archived";
  created_at: string;
  updated_at: string;
  user: number;
  user_username: string;
  // visits и submissions пока нет — добавим позже
};

// === Получение всех форм пользователя ===
export async function getMyForms(): Promise<FormFromAPI[]> {
  try {
    const res = await fetch(`${API_BASE}/forms/`, {
      headers: authHeaders,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Не удалось загрузить формы");
    }

    const data = await res.json();
    return data.results as FormFromAPI[];
  } catch (error: any) {
    toast.error("Не удалось загрузить формы");
    console.error(error);
    // Возвращаем пустой массив, чтобы UI не упал
    return [];
  }
}