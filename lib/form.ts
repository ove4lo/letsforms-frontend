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
    console.log("👤 ID пользователя:", tgId);
  } catch {
    throw new Error("Ошибка парсинга пользователя");
  }

  if (!tgId) throw new Error("ID пользователя не найден");

  // Получаем токен из отдельной куки
  const accessToken = getCookie("access_token");
  console.log("🔑 Токен:", accessToken ? "есть" : "нет");
  
  if (!accessToken) {
    throw new Error("Токен авторизации не найден");
  }

  // Преобразуем answers в нужный формат
  const responses = Object.entries(answers).map(([qId, ans]) => ({
    question_id: Number(qId),
    answer: ans ?? null,
  }));

  console.log("📤 Хеш формы:", hash);
  console.log("📤 Отправляем ответы:", {
    tg_id: tgId,
    responses_count: responses.length
  });

  const url = `${API_BASE}/forms/${hash}/submit/`;
  console.log("📤 URL:", url);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        tg_id: tgId,
        responses: responses,
      }),
    });

    console.log("📥 Статус ответа:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Ошибка сервера:", errorText);
      
      // Если 401 - пробуем обновить токен или перенаправить на авторизацию
      if (res.status === 401) {
        handleUnauthorized();
      }
      
      throw new Error(`Ошибка отправки: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    console.log("✅ Ответы успешно отправлены:", data);
    return data;

  } catch (error) {
    console.error("❌ Ошибка при отправке формы:", error);
    throw error;
  }
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


/**
 * Сохраняет форму и её вопросы на сервере.
 * Включает валидацию данных перед отправкой.
 */
export async function saveForm(
  hash: string,
  data: { title: string; elements: FormElementInstance[] }
): Promise<any> {
  const telegramId = getTelegramId();
  if (!telegramId) throw new Error('Пользователь не авторизован (cookies)');

  // Проходим по всем элементам и убеждаемся, что они валидны
  const validatedElements = data.elements.map((el) => {
    const attrs = el.extraAttributes || {};

    // Если это поле с вариантами выбора, проверяем наличие опций
    if (["CheckboxField", "RadioField", "SelectField"].includes(el.type)) {
      if (!attrs.options || !Array.isArray(attrs.options) || attrs.options.length === 0) {
        // Если опций нет (пользователь удалил все), возвращаем дефолтные
        console.warn(`Элемент ${el.id} не имел опций. Установлены значения по умолчанию.`);
        attrs.options = ["Вариант 1", "Вариант 2"];
      }
    }

    // Если нет заголовка/текста, ставим заглушку
    if (!attrs.label && !attrs.text) {
      attrs.label = "Поле без названия";
    }

    return { ...el, extraAttributes: attrs };
  });

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
  if (!formRes.ok) {
    const text = await formRes.text();
    throw new Error(`Ошибка обновления формы: ${formRes.status} ${text}`);
  }

  const questions = validatedElements
    .filter((el) => !["SeparatorField", "SpacerField"].includes(el.type))
    .map((el, index) => {
      const attrs = el.extraAttributes || {};

      // Базовая структура вопроса
      const baseQuestion = {
        type: mapClientTypeToServer(el.type),
        order: index + 1,
        text: attrs.label || attrs.text || "Без названия",
        is_required: !!attrs.required,
      };

      // Специфичные поля для разных типов
      switch (el.type) {
        case "TextField":
        case "TextareaField":
          return {
            ...baseQuestion,
            placeholder: attrs.placeholder || null,
          };

        case "NumberField":
          return {
            ...baseQuestion,
            min: attrs.min ?? null,
            max: attrs.max ?? null,
            placeholder: attrs.placeholder || null,
          };

        case "ScaleField":
          return {
            ...baseQuestion,
            min: attrs.min || 1,
            max: attrs.max || 10,
            min_label: attrs.min_label || null,
            max_label: attrs.max_label || null,
          };

        case "ParagraphField":
          return {
            ...baseQuestion,
            text: attrs.text || "",
            is_required: false,
          };

        case "RadioField":
        case "CheckboxField":
        case "SelectField":
          return {
            ...baseQuestion,
            options: attrs.options || [],
          };

        default:
          return baseQuestion;
      }
    });

  console.log("📤 Отправляем вопросы на сервер:", questions);

  // --- 4. ЗАМЕНА ВОПРОСОВ НА СЕРВЕРЕ ---
  const qRes = await fetch(`${API_BASE}/forms/${hash}/replace_questions/`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      tg_id: telegramId,
      questions: questions,
    }),
  });

  if (qRes.status === 401) { handleUnauthorized(); throw new Error("Unauthorized"); }
  if (!qRes.ok) {
    const text = await qRes.text();
    throw new Error(`Ошибка сохранения вопросов: ${qRes.status} ${text}`);
  }

  console.log("✅ Форма успешно сохранена!");
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