import { FormElementInstance } from "@/components/builder/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

const getHeaders = () => {
  // Получаем токен из localStorage
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  // Базовые заголовки
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Добавляем токен, если он есть
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
};

// Получаем Telegram ID пользователя
const getTelegramId = (): string => {
  if (typeof window === 'undefined') return '';
  
  try {
    const tgUserStr = localStorage.getItem('tg_user');
    if (!tgUserStr) return '';
    
    const user = JSON.parse(tgUserStr);
    return user.telegram_id || user.id || '';
  } catch (error) {
    console.error('Ошибка получения Telegram ID:', error);
    return '';
  }
};

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

// Получение всех форм пользователя
export async function getMyForms() {
  try {
    const telegramId = getTelegramId();
    if (!telegramId) {
      console.error('Telegram ID не найден');
      return { results: [], user_statistics: null };
    }

    const url = `${API_BASE}/forms/by_tg_id/?tg_id=${telegramId}`;
    console.log('Запрос к:', url);

    const res = await fetch(url, {
      headers: getHeaders(),
      cache: 'no-store',
      credentials: 'include', 
    });

    if (!res.ok) {
      console.error('HTTP error:', res.status, await res.text());
      
      if (res.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          return getMyForms();
        }
      }
      
      return { results: [], user_statistics: null };
    }

    const data = await res.json();
    console.log('Ответ от сервера:', data);
    
    if (data && data.results && Array.isArray(data.results)) {
      return {
        results: data.results,
        user_statistics: data.user_statistics || null,
      };
    }

    return { results: [], user_statistics: null };
  } catch (error) {
    console.error('getMyForms error:', error);
    return { results: [], user_statistics: null };
  }
}

// Получение формы по хэшу
export async function getFormByHash(hash: string) {
  if (!hash) {
    console.error('Hash пустой!');
    return null;
  }

  const url = `${API_BASE}/forms/${hash}/`;

  try {
    const res = await fetch(url, {
      headers: getHeaders(),
      cache: 'no-store',
    });

    console.log('Статус ответа:', res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error('Ошибка от сервера:', res.status, text);
      return null;
    }

    const data = await res.json();
    console.log('Форма успешно загружена:', data);
    return data;
  } catch (error: any) {
    console.error('Ошибка fetch (сеть/CORS/таймаут):', error.message);
    return null;
  }
}

// Создание новой формы
export async function createForm(data: { name: string; description?: string }) {
  try {
    const telegramId = getTelegramId();
    if (!telegramId) {
      throw new Error('Пользователь не авторизован');
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

export async function saveForm(hash: string, data: { title: string; elements: FormElementInstance[] }) {
  try {
    const telegramId = getTelegramId();
    if (!telegramId) {
      throw new Error('Пользователь не авторизован');
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

    console.log("Отправляем на сервер:", questions);

    const questionsRes = await fetch(`${API_BASE}/forms/${hash}/replace_questions/`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        tg_id: telegramId,
        questions,
      }),
    });

    if (!questionsRes.ok) {
      const text = await questionsRes.text();
      throw new Error(`Ошибка добавления вопросов: ${questionsRes.status} ${text}`);
    }

    console.log("Форма и вопросы успешно сохранены!");
    return await questionsRes.json();
  } catch (error) {
    console.error("saveForm error:", error);
    throw error;
  }
}

// Функция для обновления токена
async function refreshToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    
    // Сохраняем новый access токен
    localStorage.setItem('access_token', data.access);
    
    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка обновления токена:', error);
    return false;
  }
}

// Функция обновления статуса
export async function updateFormStatus(hash: string, status: string) {
  const telegramId = getTelegramId();
  if (!telegramId) {
    throw new Error("Пользователь не авторизован");
  }

  const token = typeof window !== "undefined" 
    ? localStorage.getItem("access_token") 
    : null;
    
  if (!token) {
    throw new Error("Токен не найден");
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
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка обновления статуса: ${res.status} ${text}`);
  }

  return await res.json();
}

export async function getResponsesByHash(hash: string) {
  try {
    const url = `${API_BASE}/forms/${hash}/responses/`;
    
    console.log("Запрос ответов:", url);
    console.log("Заголовки:", getHeaders());

    const res = await fetch(url, {
      headers: getHeaders(),
    });

    const text = await res.text(); // читаем как текст, чтобы увидеть ошибку
    console.log("Статус ответа:", res.status);
    console.log("Тело ответа:", text);

    if (!res.ok) {
      console.error("Ошибка загрузки ответов:", res.status, text);
      return { results: [] };
    }

    try {
      const data = JSON.parse(text);
      console.log("Успешно распарсили JSON:", data);
      return data; // возвращаем весь объект (включая responses)
    } catch (parseError) {
      console.error("Ошибка парсинга JSON:", parseError);
      return { results: [] };
    }
  } catch (error) {
    console.error("getResponsesByHash error:", error);
    return { results: [] };
  }
}

export async function submitFormResponses(hash: string, answers: Record<string, any>) {
  try {
    // Получаем tg_id из localStorage
    const tgUserStr = localStorage.getItem("tg_user");
    let tgId = null;
    if (tgUserStr) {
      try {
        const user = JSON.parse(tgUserStr);
        tgId = user.id || user.telegram_id;
      } catch {}
    }

    if (!tgId) {
      throw new Error("Не удалось определить пользователя");
    }

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
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Ошибка отправки");
    }

    return await res.json();
  } catch (error) {
    console.error("submitFormResponses error:", error);
    throw error;
  }
}

export async function deleteForm(hash: string) {
  try {
    const res = await fetch(`${API_BASE}/forms/${hash}/`, {
      method: "DELETE",
      headers: getHeaders(),
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