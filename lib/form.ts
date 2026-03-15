import { FormElementInstance } from "@/components/builder/types";
import { getCookie, clearAuthCookies } from "./cookies";
import { GetMyFormsResponse, AdminServerForm, GetResponsesResponse } from '@/types/form';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

const getTelegramId = (): string => {
  const tgUserJson = getCookie("tg_user");
  if (!tgUserJson) return '';
  try {
    const user = JSON.parse(tgUserJson);
    return user.id || user.telegram_id || '';
  } catch {
    return '';
  }
};

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const accessToken = getCookie("access_token");
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
};

// Универсальная обработка 401 ошибки
const handleUnauthorized = () => {
  if (typeof window !== 'undefined') {
    clearAuthCookies();
    window.location.href = '/auth';
  }
  throw new Error("Unauthorized");
};

const mapClientTypeToServer = (type: string): string => {
  const map: Record<string, string> = {
    TextField: 'text', TextareaField: 'text_area', SelectField: 'select',
    RadioField: 'single_choice', CheckboxField: 'multiple_choice',
    NumberField: 'number', ScaleField: 'scale', DateField: 'date',
    TitleField: 'info', SubTitleField: 'info', ParagraphField: 'info',
  };
  return map[type] || 'text';
};

// --- ОСНОВНЫЕ ФУНКЦИИ ---

export async function getMyForms(): Promise<GetMyFormsResponse> {
  const telegramId = getTelegramId();
  if (!telegramId) return { results: [], user_statistics: undefined };

  try {
    const res = await fetch(`${API_BASE}/forms/by_tg_id/?tg_id=${telegramId}`, {
      headers: getHeaders(),
      cache: 'no-store',
    });

    if (res.status === 401) { handleUnauthorized(); return { results: [], user_statistics: undefined }; }
    if (!res.ok) return { results: [], user_statistics: undefined };

    return await res.json();
  } catch (error) {
    console.error('getMyForms error:', error);
    return { results: [], user_statistics: undefined };
  }
}

export async function getFormByHash(hash: string): Promise<AdminServerForm | null> {
  if (!hash) return null;
  try {
    const res = await fetch(`${API_BASE}/forms/${hash}/`, {
      headers: getHeaders(),
      cache: 'no-store',
    });

    if (res.status === 401) { handleUnauthorized(); return null; }
    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
    console.error('getFormByHash error:', error);
    return null;
  }
}

export async function submitFormResponses(hash: string, answers: Record<string, any>): Promise<any> {
  const tgUserJson = getCookie("tg_user");
  if (!tgUserJson) throw new Error("Пользователь не авторизован");
  
  let tgId: string | null = null;
  try {
    const user = JSON.parse(decodeURIComponent(tgUserJson));
    tgId = user.id || user.telegram_id;
  } catch { throw new Error("Ошибка парсинга пользователя"); }

  if (!tgId) throw new Error("ID пользователя не найден");

  const res = await fetch(`${API_BASE}/forms/${hash}/submit/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      tg_id: tgId,
      responses: Object.entries(answers).map(([qId, ans]) => ({
        question_id: Number(qId),
        answer: ans ?? null,
      })),
    }),
  });

  if (res.status === 401) { handleUnauthorized(); throw new Error("Unauthorized"); }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Ошибка отправки");
  }

  return await res.json();
}

export async function getResponsesByHash(hash: string): Promise<GetResponsesResponse> {
  try {
    const res = await fetch(`${API_BASE}/forms/${hash}/responses/`, {
      headers: getHeaders(),
      cache: 'no-store',
    });

    if (res.status === 401) { handleUnauthorized(); return { responses: [] }; }
    if (!res.ok) return { responses: [] };

    return await res.json();
  } catch (error) {
    console.error("getResponsesByHash error:", error);
    return { responses: [] };
  }
}

export async function createForm(data: { name: string; description?: string }): Promise<any> {
  const telegramId = getTelegramId();
  if (!telegramId) throw new Error('Пользователь не авторизован');

  const res = await fetch(`${API_BASE}/forms/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      tg_id: telegramId,
      title: data.name,
      description: data.description || null,
      type: 'survey',
      status: 'draft',
    }),
  });

  if (res.status === 401) { handleUnauthorized(); throw new Error("Unauthorized"); }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка создания: ${res.status} ${text}`);
  }

  return await res.json();
}

export async function saveForm(hash: string, data: { title: string; elements: FormElementInstance[] }): Promise<any> {
  const telegramId = getTelegramId();
  if (!telegramId) throw new Error('Пользователь не авторизован');

  // 1. Обновляем метаданные формы
  const formRes = await fetch(`${API_BASE}/forms/${hash}/`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      tg_id: telegramId,
      title: data.title,
      description: "",
      type: "survey",
      status: "draft",
    }),
  });

  if (formRes.status === 401) { handleUnauthorized(); throw new Error("Unauthorized"); }
  if (!formRes.ok) throw new Error(`Ошибка обновления формы: ${formRes.status}`);

  // 2. Формируем вопросы
  const questions = data.elements
    .filter(el => !["SeparatorField", "SpacerField"].includes(el.type))
    .map((el, index) => {
      const attrs = el.extraAttributes || {};
      const base = {
        type: mapClientTypeToServer(el.type),
        order: index + 1,
        text: attrs.label || attrs.text || "Без названия",
        is_required: !!attrs.required,
      };

      switch (el.type) {
        case "TextField": case "TextareaField":
          return { ...base, placeholder: attrs.placeholder || null };
        case "NumberField":
          return { ...base, min: attrs.min ?? null, max: attrs.max ?? null, placeholder: attrs.placeholder || null };
        case "ScaleField":
          return { ...base, min: attrs.min || 1, max: attrs.max || 10, min_label: attrs.minLabel || null, max_label: attrs.maxLabel || null };
        case "ParagraphField":
          return { ...base, text: attrs.text || "" };
        case "RadioField": case "CheckboxField": case "SelectField":
          return { ...base, options: attrs.options || null };
        default:
          return base;
      }
    });

  // 3. Заменяем вопросы
  const qRes = await fetch(`${API_BASE}/forms/${hash}/replace_questions/`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ tg_id: telegramId, questions }),
  });

  if (qRes.status === 401) { handleUnauthorized(); throw new Error("Unauthorized"); }
  if (!qRes.ok) throw new Error(`Ошибка вопросов: ${qRes.status}`);

  return await qRes.json();
}

export async function updateFormStatus(hash: string, status: string) {
  const telegramId = getTelegramId();
  if (!telegramId) throw new Error("Пользователь не авторизован");

  const token = getCookie("access_token");
  if (!token) throw new Error("Токен не найден");

  const res = await fetch(`${API_BASE}/forms/${hash}/change_status/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ tg_id: telegramId, status }),
  });

  if (res.status === 401) { handleUnauthorized(); throw new Error("Unauthorized"); }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка статуса: ${res.status} ${text}`);
  }

  return await res.json();
}

export async function deleteForm(hash: string) {
  const res = await fetch(`${API_BASE}/forms/${hash}/`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (res.status === 401) { handleUnauthorized(); throw new Error("Unauthorized"); }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка удаления: ${res.status} ${text}`);
  }
  return true;
}