import { FormElementInstance } from "@/components/builder/types";
import { getCookie } from "./cookies"; 

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

// Функция для получения Telegram ID
const getTelegramId = (): string => {
  // Получаем JSON-строку из куки tg_user
  const tgUserJson = getCookie("tg_user");
  if (!tgUserJson) {
    console.warn("Данные пользователя (tg_user) не найдены в cookies.");
    return '';
  }

  try {
    // tgUserJson теперь декодированная строка
    const user = JSON.parse(tgUserJson);
    return user.id || user.telegram_id || '';
  } catch (error) {
    console.error('Ошибка парсинга tg_user из cookies:', error, 'Полученная строка:', tgUserJson);
    return '';
  }
};

// Функция для получения заголовков
const getHeaders = (): Record<string, string> => {
  const accessToken = getCookie("access_token"); 

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    console.warn("Access token не найден в cookies (не httpOnly). Запрос может завершиться с 401.");
  }

  return headers;
};

// Получение всех форм пользователя
export async function getMyForms() {
  try {
    const telegramId = getTelegramId();
    if (!telegramId) {
      console.error('Telegram ID не найден в cookies');
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
      const responseText = await res.text(); 
      console.error('HTTP error:', res.status, responseText);

      if (res.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          return getMyForms();
        } else {
          console.error('Токен недействителен и не удалось обновить. Редирект на /auth ожидается в компоненте.');
          return { results: [], user_statistics: null };
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
      credentials: 'include', // Отправляем куки
    });
    console.log('Статус ответа:', res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error('Ошибка от сервера:', res.status, text);
      if (res.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          return getFormByHash(hash); // Повтор с новыми куками/токеном
        }
      }
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
export async function createForm(formData: { name: string; description?: string }) {
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
        title: formData.name,
        description: formData.description || null,
        type: 'survey',
        status: 'draft',
      }),
      credentials: 'include', // Отправляем куки
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

// Сохранение формы
export async function saveForm(hash: string, data: { title: string; elements: FormElementInstance[] }) {
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

    // Подготовка вопросов
    const questions = data.elements
      .filter(el => !["SeparatorField", "SpacerField"].includes(el.type)) // Фильтруем служебные элементы
      .map((el, index) => {
        const attrs = el.extraAttributes || {};

        const base = {
          type: mapClientTypeToServer(el.type),
          order: index + 1,
          text: attrs.label || attrs.text || "Без названия",
          is_required: !!attrs.required,
        };

        // Обработка специфических атрибутов для разных типов
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

    console.log("Отправляем вопросы на сервер: ", questions);

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
    const refreshTokenValue = getCookie("refresh_token");
    if (!refreshTokenValue) {
      console.warn("Refresh token не найден в cookies (не httpOnly).");
      return false;
    }

    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshTokenValue }),
    });

    if (!res.ok) {
      console.error("Ошибка обновления токена на сервере:", res.status, await res.text());
      return false;
    }

    const data = await res.json();

    if (data.access) {
      document.cookie = `access_token=${data.access}; path=/; ${process.env.NODE_ENV === 'production' ? 'secure; ' : ''
        }samesite=strict; max-age=${60 * 60 * 24}`; // 1 день
    }

    // Если сервер возвращает новый refresh_token, обновим его в cookies
    if (data.refresh) {
      document.cookie = `refresh_token=${data.refresh}; path=/; ${process.env.NODE_ENV === 'production' ? 'secure; ' : ''
        }samesite=strict; max-age=${60 * 60 * 24 * 30}`; // 30 дней
    }
    console.log("Токены обновлены в cookies (не httpOnly).");
    return true;
  } catch (error) {
    console.error('Ошибка обновления токена (JS):', error);
    return false;
  }
}


// Функция обновления статуса
export async function updateFormStatus(hash: string, status: string) {
  const telegramId = getTelegramId();
  if (!telegramId) {
    throw new Error("Пользователь не авторизован (cookies)");
  }

  // Получаем токен для заголовка Authorization
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
    credentials: 'include', // Отправляем куки
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка обновления статуса: ${res.status} ${text}`);
  }

  return await res.json();
}

// Получение ответов по хэшу
export async function getResponsesByHash(hash: string) {
  try {
    const url = `${API_BASE}/forms/${hash}/responses/`;
    console.log("Запрос ответов:", url);
    console.log("Заголовки:", getHeaders()); // Передаём токен из cookies

    const res = await fetch(url, {
      headers: getHeaders(), // Используем headers
      credentials: 'include', // Отправляем куки
    });

    const text = await res.text();
    console.log("Статус ответа:", res.status);
    console.log("Тело ответа:", text);

    if (!res.ok) {
      console.error("Ошибка загрузки ответов:", res.status, text);
      if (res.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          return getResponsesByHash(hash); // Повтор с новыми куками/токеном
        }
      }
      return { results: [] }; // Возвращаем пустой массив в случае ошибки
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

// Отправка ответов на форму
export async function submitFormResponses(hash: string, answers: Record<string, any>) {
  try {
    // Получаем tg_id из cookies
    const tgUserJsonEncoded = getCookie("tg_user");
    let tgId = null;
    if (tgUserJsonEncoded) {
      try {
        const tgUserJson = decodeURIComponent(tgUserJsonEncoded);
        const user = JSON.parse(tgUserJson);
        tgId = user.id || user.telegram_id;
      } catch { }
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
        responses: responseAnswers, // Отправляем подготовленный массив ответов
      }),
      credentials: 'include', // Отправляем куки
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

// Удаление формы
export async function deleteForm(hash: string) {
  try {
    const res = await fetch(`${API_BASE}/forms/${hash}/`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: 'include', // Отправляем куки
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