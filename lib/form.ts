import { FormElementInstance } from "@/components/builder/types";
import { getCookie } from "./cookies";
import { GetMyFormsResponse, AdminServerForm, GetResponsesResponse, ServerResponse } from '@/types/form';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

// Функция для получения Telegram ID
const getTelegramId = (): string => {
  const tgUserJson = getCookie("tg_user");
  if (!tgUserJson) {
    console.warn("Данные пользователя (tg_user) не найдены в cookies.");
    return '';
  }

  try {
    const user = JSON.parse(tgUserJson);
    return user.id || user.telegram_id || '';
  } catch (error) {
    console.error('Ошибка парсинга tg_user из cookies:', error, 'Полученная строка:', tgUserJson);
    return '';
  }
};

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const accessToken = getCookie("access_token");
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
};

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshTokenValue = getCookie("refresh_token");
      if (!refreshTokenValue) {
        return false;
      }

      const res = await fetch(`${API_BASE}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshTokenValue }),
      });

      if (!res.ok) {
        return false;
      }

      const data = await res.json();
      
      if (data.access) {
        document.cookie = `access_token=${data.access}; path=/; ${
          process.env.NODE_ENV === 'production' ? 'secure; ' : ''
        }samesite=strict; max-age=${60 * 60 * 24}`;
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  
  return refreshPromise;
}

// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ СОПОСТАВЛЕНИЯ ТИПОВ
const mapClientTypeToServer = (type: string): string => {
  const map: Record<string, string> = {
    TextField: 'text',
    TextareaField: 'text_area',
    SelectField: 'select',
    RadioField: 'single_choice',
    CheckboxField: 'multiple_choice',
    NumberField: 'number',
    ScaleField: 'scale',
    DateField: 'date',
    TitleField: 'info',
    SubTitleField: 'info',
    ParagraphField: 'info',
  };
  return map[type] || 'text';
};

// ОСНОВНЫЕ ФУНКЦИИ

// Получение всех форм пользователя (административная версия)
export async function getMyForms(): Promise<GetMyFormsResponse> {
  try {
    const telegramId = getTelegramId();
    if (!telegramId) {
      return { results: [], user_statistics: undefined };
    }
    
    const url = `${API_BASE}/forms/by_tg_id/?tg_id=${telegramId}`;
    
    console.log('📊 Загрузка списка форм...');
    
    const res = await fetch(url, {
      headers: getHeaders(), 
      cache: 'no-store',
      credentials: 'include',
    });

    if (!res.ok) {
      if (res.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          return getMyForms();
        }
      }
      return { results: [], user_statistics: undefined };
    }

    const data: GetMyFormsResponse = await res.json();
    console.log(`📊 Загружено форм: ${data.results?.length || 0}`);
    return data;
    
  } catch (error) {
    console.error('getMyForms error:', error);
    return { results: [], user_statistics: undefined };
  }
}

// Получение формы по хэшу (административная версия)
// Использует эндпоинт /forms/{hash}/, типизируем возвращаемое значение
export async function getFormByHash(hash: string): Promise<AdminServerForm | null> {
  if (!hash) {
    console.error('Hash пустой!');
    return null;
  }

  const url = `${API_BASE}/forms/${hash}/`;
  
  try {
    
    const headers = getHeaders();
    
    const res = await fetch(url, {
      headers: headers,
      cache: 'no-store',
      credentials: 'include',
    });

    if (res.status === 401) {
      console.error('Ошибка авторизации при загрузке формы');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/';
      }
      return null;
    }

    if (!res.ok) {
      console.error(`Ошибка загрузки формы: ${res.status}`);
      return null;
    }

    const data: AdminServerForm = await res.json();
    return data;
    
  } catch (error: any) {
    console.error('Ошибка fetch:', error.message);
    return null;
  }
}

// Отправка ответов на форму
export async function submitFormResponses(hash: string, answers: Record<string, any>): Promise<any> {
  try {
    // Получаем tg_id из cookies
    const tgUserJsonEncoded = getCookie("tg_user");
    let tgId = null;
    if (tgUserJsonEncoded) {
      try {
        const tgUserJson = decodeURIComponent(tgUserJsonEncoded);
        const user = JSON.parse(tgUserJson);
        tgId = user.id || user.telegram_id;
      } catch {}
    }

    if (!tgId) {
      throw new Error("Не удалось определить пользователя из cookies");
    }

    // Подготовка ответов
    const responseAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: Number(questionId),
      answer: answer ?? null,
    }));

    const res = await fetch(`${API_BASE}/forms/${hash}/submit/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        tg_id: tgId,
        responses: responseAnswers,
      }),
      credentials: 'include',
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Ошибка отправки ответов");
    }

    return await res.json();
  } catch (error) {
    console.error("submitFormResponses error:", error);
    throw error;
  }
}

// Получение ответов по хэшу
// Использует эндпоинт /forms/{hash}/responses/, типизируем возвращаемое значение
export async function getResponsesByHash(hash: string): Promise<GetResponsesResponse> { 
  try {
    const url = `${API_BASE}/forms/${hash}/responses/`;
    console.log("Запрос ответов (getResponsesByHash):", url);
    console.log("Заголовки (getResponsesByHash):", getHeaders());

    const res = await fetch(url, {
      headers: getHeaders(),
      credentials: 'include', 
    });

    const text = await res.text();
    console.log("Статус ответа (getResponsesByHash):", res.status);
    console.log("Тело ответа (getResponsesByHash):", text);

    if (!res.ok) {
      console.error("Ошибка загрузки ответов (getResponsesByHash):", res.status, text);
      if (res.status === 401) {
         const refreshed = await refreshToken();
         if (refreshed) {
            return getResponsesByHash(hash);
         }
         return { responses: [] };
      }
      return { responses: [] };
    }

    try {
      const data: GetResponsesResponse = JSON.parse(text);
      console.log("Успешно распарсили JSON (getResponsesByHash):", data);
      return data;
    } catch (parseError) {
      console.error("Ошибка парсинга JSON (getResponsesByHash):", parseError);
      return { responses: [] };
    }
  } catch (error) {
    console.error("getResponsesByHash error:", error);
    return { responses: [] }; 
  }
}

export async function createForm(data: { name: string; description?: string }): Promise<any> {
  try {
    const telegramId = getTelegramId();
    if (!telegramId) {
      throw new Error('Пользователь не авторизован (cookies)');
    }
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
      credentials: 'include',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ошибка создания: ${res.status} ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('createForm error:', error);
    throw error;
  }
}

export async function saveForm(hash: string, data: { title: string; elements: FormElementInstance[] }): Promise<any> {
  try {
    const telegramId = getTelegramId();
    if (!telegramId) {
      throw new Error('Пользователь не авторизован (cookies)');
    }

    // Обновляем форму
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
      credentials: 'include',
    });

    if (!formRes.ok) {
      const text = await formRes.text();
      throw new Error(`Ошибка обновления формы: ${formRes.status} ${text}`);
    }

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
          case "TextField":
          case "TextareaField":
            return {
              ...base,
              placeholder: attrs.placeholder || null,
            };
          case "NumberField":
            return {
              ...base,
              min: attrs.min ?? null,
              max: attrs.max ?? null,
              placeholder: attrs.placeholder || null,
            };
          case "ScaleField":
            return {
              ...base,
              min: attrs.min || 1,
              max: attrs.max || 10,
              min_label: attrs.minLabel || null,
              max_label: attrs.maxLabel || null,
            };
          case "ParagraphField":
            return {
              ...base,
              text: attrs.text || "",
            };
          case "RadioField":
          case "CheckboxField":
          case "SelectField":
            return {
              ...base,
              options: attrs.options || null,
            };
          default:
            return base;
        }
      });

    console.log("Отправляем вопросы на сервер (saveForm): ", questions);

    // Заменяем вопросы в форме
    const questionsRes = await fetch(`${API_BASE}/forms/${hash}/replace_questions/`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        tg_id: telegramId,
        questions,
      }),
      credentials: 'include',
    });

    if (!questionsRes.ok) {
      const text = await questionsRes.text();
      throw new Error(`Ошибка обновления вопросов: ${questionsRes.status} ${text}`);
    }

    console.log("Форма и вопросы успешно сохранены (saveForm)!");
    return await questionsRes.json();
  } catch (error) {
    console.error("saveForm error:", error);
    throw error;
  }
}

// Функция обновления статуса
export async function updateFormStatus(hash: string, status: string) {
  const telegramId = getTelegramId();
  if (!telegramId) {
    throw new Error("Пользователь не авторизован (cookies)");
  }

  const token = getCookie("access_token");
  if (!token) {
    throw new Error("Токен доступа не найден в cookies (не httpOnly).");
  }

  const url = `${API_BASE}/forms/${hash}/change_status/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      tg_id: telegramId,
      status: status,
    }),
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка обновления статуса: ${res.status} ${text}`);
  }

  return await res.json();
}

// Удаление формы
export async function deleteForm(hash: string) {
  try {
    const res = await fetch(`${API_BASE}/forms/${hash}/`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ошибка удаления: ${res.status} ${text}`);
    }

    return true;
  } catch (error) {
    console.error("deleteForm error:", error);
    throw error;
  }
}