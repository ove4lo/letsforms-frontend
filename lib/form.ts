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

// Создание формы
export async function createForm(data: CreateFormType) {
  try {
    const validated = CreateFormSchema.parse(data);

    // просто мокаем создание
    await new Promise(r => setTimeout(r, 800));

    const newForm = {
      id: Date.now(),
      title: validated.name,
      description: validated.description || null,
      type: "survey",
      status: "draft",
      created_at: new Date().toISOString(),
      user: 1,
      user_username: "ove4lo",
    };

    toast.success("Форма успешно создана!");
    return newForm;

    // const res = await fetch(`${API_BASE}/forms/`, {
    //   method: "POST",
    //   headers: authHeaders,
    //   body: JSON.stringify({ ... }),
    // });
    // ...
  } catch (error: any) {
    toast.error("Ошибка при создании формы");
    throw error;
  }
}

// получение всех форм
export async function getMyForms(): Promise<any[]> {
  await new Promise(r => setTimeout(r, 600));

  return [
    {
      id: 1,
      title: "Опрос удовлетворённости клиентов",
      description: "Собираем обратную связь после покупки",
      type: "survey",
      status: "active",
      created_at: "2025-03-15T10:00:00Z",
    },
    {
      id: 2,
      title: "Регистрация на вебинар",
      description: null,
      type: "registration",
      status: "draft",
      created_at: "2025-03-18T09:15:00Z",
    },
  ];
}