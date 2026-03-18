import { FormElementInstance } from "@/components/builder/types";
import { getCookie, clearAuthCookies } from "./cookies";
import { GetMyFormsResponse, AdminServerForm, GetResponsesResponse, FormDetailedStats } from '@/types/form';

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
  console.log("🔍 getMyForms: telegramId:", telegramId);
  
  if (!telegramId) {
    console.log("🔍 getMyForms: нет telegramId, возвращаем пустой результат");
    return { results: [], user_statistics: undefined };
  }

  try {
    const url = `${API_BASE}/forms/by_tg_id/?tg_id=${telegramId}`;
    console.log("🔍 getMyForms: запрос к:", url);
    console.log("🔍 getMyForms: заголовки:", getHeaders());
    
    const res = await fetch(url, {
      headers: getHeaders(),
      cache: 'no-store',
    });

    console.log("🔍 getMyForms: статус ответа:", res.status, res.statusText);

    if (res.status === 401) { 
      console.log("🔍 getMyForms: получен 401");
      handleUnauthorized(); 
      return { results: [], user_statistics: undefined }; 
    }
    
    if (!res.ok) {
      console.log("🔍 getMyForms: ошибка ответа:", res.status);
      return { results: [], user_statistics: undefined };
    }

    const data = await res.json();
    console.log("🔍 getMyForms: ПОЛНЫЙ ОТВЕТ ОТ СЕРВЕРА:", JSON.stringify(data, null, 2));
    
    // Детальный анализ статистики
    if (data.user_statistics) {
      console.log("🔍 getMyForms: АНАЛИЗ СТАТИСТИКИ ПОЛЬЗОВАТЕЛЯ:");
      console.log("  - total_visits:", data.user_statistics.total_visits);
      console.log("  - total_responses:", data.user_statistics.total_responses);
      console.log("  - overall_conversion_rate:", data.user_statistics.overall_conversion_rate);
      console.log("  - overall_bounce_rate:", data.user_statistics.overall_bounce_rate);
      
      // Проверяем каждую форму
      if (data.results) {
        console.log("🔍 getMyForms: АНАЛИЗ КАЖДОЙ ФОРМЫ:");
        let totalVisitsFromForms = 0;
        let totalResponsesFromForms = 0;
        
        data.results.forEach((form: any, index: number) => {
          console.log(`  Форма ${index + 1} [${form.hash}]:`, {
            title: form.title,
            status: form.status,
            visit_count: form.visit_count,
            response_count: form.response_count,
            conversion_rate: form.conversion_rate
          });
          
          totalVisitsFromForms += form.visit_count || 0;
          totalResponsesFromForms += form.response_count || 0;
        });
        
        console.log("🔍 getMyForms: СУММА ПО ФОРМАМ:");
        console.log("  - Всего посещений по формам:", totalVisitsFromForms);
        console.log("  - Всего ответов по формам:", totalResponsesFromForms);
        console.log("  - В статистике пользователя посещения:", data.user_statistics.total_visits);
        console.log("  - В статистике пользователя ответы:", data.user_statistics.total_responses);
        console.log("  - Совпадают посещения:", totalVisitsFromForms === data.user_statistics.total_visits ? "✅" : "❌");
        console.log("  - Совпадают ответы:", totalResponsesFromForms === data.user_statistics.total_responses ? "✅" : "❌");
      }
    }

    return data;
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
  console.log("🎯 НАЧАЛО ОТПРАВКИ ФОРМЫ");
  console.log("📋 Hash формы:", hash);
  console.log("📋 Количество ответов:", Object.keys(answers).length);
  console.log("📋 Ответы (сырые):", answers);
  
  const tgUserJson = getCookie("tg_user");
  console.log("🍪 tg_user cookie:", tgUserJson ? "есть" : "нет");
  
  if (!tgUserJson) throw new Error("Пользователь не авторизован");

  let tgId: string | null = null;
  
  try {
    const user = JSON.parse(decodeURIComponent(tgUserJson));
    console.log("👤 Распарсенный пользователь:", user);
    tgId = user.id || user.telegram_id;
    console.log("👤 Telegram ID:", tgId);
  } catch (e) {
    console.error("❌ Ошибка парсинга пользователя:", e);
    throw new Error("Ошибка парсинга пользователя");
  }

  if (!tgId) throw new Error("ID пользователя не найден");

  // Получаем токен
  const accessToken = getCookie("access_token");
  console.log("🔑 Токен доступа:", accessToken ? "есть" : "нет");
  
  if (!accessToken) {
    throw new Error("Токен авторизации не найден");
  }
  
  console.log("📦 Преобразование ответов в формат сервера...");
  
  const responses = Object.entries(answers).map(([qId, ans]) => {
    console.log(`  Вопрос ${qId}:`, {
      исходный_ответ: ans,
      тип: typeof ans,
      преобразованный: ans ?? null
    });
    
    return {
      question_id: Number(qId),
      answer: ans ?? null,
    };
  });

  console.log("📦 Итоговый payload для отправки:", {
    tg_id: tgId,
    responses_count: responses.length,
    responses: responses
  });

  const url = `${API_BASE}/forms/${hash}/submit/`;
  console.log("📤 URL:", url);

  const requestBody = {
    tg_id: tgId,
    responses: responses,
  };
  console.log("📤 Тело запроса:", JSON.stringify(requestBody, null, 2));

  try {
    console.log("⏳ Отправка запроса...");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📥 Статус ответа:", res.status, res.statusText);

    const responseText = await res.text();
    console.log("📥 Тело ответа (сырое):", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("📥 Распарсенный ответ:", data);
      
      if (data.success) {
        console.log("✅ Успех:", data.message);
        console.log("📊 Создано ответов:", data.responses_created);
        console.log("👤 Пользователь:", data.username);
      }
    } catch (e) {
      console.error("❌ Ошибка парсинга ответа:", e);
    }

    if (!res.ok) {
      console.error("❌ Ошибка сервера:", {
        status: res.status,
        statusText: res.statusText,
        body: responseText
      });
      
      if (res.status === 401) {
        console.log("🚫 Получен 401, вызываем handleUnauthorized");
        handleUnauthorized();
      }
      
      throw new Error(`Ошибка отправки: ${res.status} ${responseText}`);
    }

    console.log("✅ Ответы успешно отправлены!");
    console.log("🎯 КОНЕЦ ОТПРАВКИ ФОРМЫ\n");
    return data;

  } catch (error) {
    console.error("❌ Ошибка при отправке формы:", error);
    console.log("🎯 ОШИБКА ОТПРАВКИ ФОРМЫ \n");
    throw error;
  }
}

export async function getResponsesByHash(hash: string): Promise<GetResponsesResponse> {
  console.log("📊 ЗАПРОС СТАТИСТИКИ");
  console.log("📊 Hash формы:", hash);
  
  try {
    const url = `${API_BASE}/forms/${hash}/responses/`;
    console.log("📊 URL запроса:", url);
    console.log("📊 Заголовки:", getHeaders());
    
    const res = await fetch(url, {
      headers: getHeaders(),
      cache: 'no-store',
    });

    console.log("📊 Статус ответа статистики:", res.status, res.statusText);

    if (res.status === 401) { 
      console.log("📊 Получен 401 при запросе статистики");
      handleUnauthorized(); 
      return { responses: [] }; 
    }
    
    if (!res.ok) {
      console.log("📊 Ошибка при запросе статистики:", res.status);
      return { responses: [] };
    }

    const data = await res.json();
    console.log("📊 Данные статистики:", data);
    
    if (data.responses) {
      console.log("📊 Количество ответов:", data.responses.length);
      data.responses.forEach((response: any, idx: number) => {
        console.log(`📊 Ответ ${idx + 1}:`, {
          id: response.id,
          user_id: response.user_id,
          created_at: response.created_at,
          answers_count: response.answers?.length
        });
      });
    }
    
    console.log("📊 КОНЕЦ ЗАПРОСА СТАТИСТИКИ\n");
    return data;
  } catch (error) {
    console.error("📊 Ошибка в getResponsesByHash:", error);
    console.log("📊 ОШИБКА ЗАПРОСА СТАТИСТИКИ\n");
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

// Добавьте новый тип в types/form.ts
export interface DetailedFormStats {
  success: boolean;
  form_hash: string;
  form_title: string;
  basic_stats: {
    visit_count: number;
    response_count: number;
    conversion_rate: number;
    bounce_rate: number;
    unique_visitors: number;
    unique_respondents: number;
  };
  visits_by_day: Array<{ day: string; count: number }>;
  responses_by_day: Array<{ day: string; count: number }>;
  question_stats: Array<{
    question_id: number;
    question_text: string;
    answer_count: number;
  }>;
}

export async function getFormDetailedStats(hash: string): Promise<FormDetailedStats | null> {
  console.log("📊 ЗАПРОС ДЕТАЛЬНОЙ СТАТИСТИКИ");
  console.log("📊 Hash формы:", hash);
  
  try {
    const url = `${API_BASE}/forms/${hash}/detailed_statistics/`;
    console.log("📊 URL:", url);
    console.log("📊 Заголовки:", getHeaders());
    
    const res = await fetch(url, {
      headers: getHeaders(),
      cache: 'no-store',
    });

    console.log("📊 Статус ответа:", res.status, res.statusText);

    if (res.status === 401) {
      console.log("📊 Получен 401, вызываем handleUnauthorized");
      handleUnauthorized();
      return null;
    }
    
    if (!res.ok) {
      console.log("📊 Ошибка при запросе статистики:", res.status);
      const errorText = await res.text();
      console.log("📊 Текст ошибки:", errorText);
      return null;
    }

    const data = await res.json();
    console.log("📊 Получены данные статистики:", data);
    
    // Детальный лог статистики
    if (data.basic_stats) {
      console.log("📊 Базовая статистика:", {
        посещения: data.basic_stats.visit_count,
        ответы: data.basic_stats.response_count,
        конверсия: data.basic_stats.conversion_rate + '%',
        отказы: data.basic_stats.bounce_rate + '%',
        уникальные_посетители: data.basic_stats.unique_visitors,
        уникальные_респонденты: data.basic_stats.unique_respondents
      });
      
      // Проверяем расчеты
      if (data.basic_stats.visit_count > 0) {
        const calculatedConversion = (data.basic_stats.response_count / data.basic_stats.visit_count) * 100;
        const calculatedBounce = ((data.basic_stats.visit_count - data.basic_stats.response_count) / data.basic_stats.visit_count) * 100;
        
        console.log("📊 Проверка расчетов:", {
          конверсия_сервера: data.basic_stats.conversion_rate,
          конверсия_рассчитанная: calculatedConversion.toFixed(2),
          отказы_сервера: data.basic_stats.bounce_rate,
          отказы_рассчитанные: calculatedBounce.toFixed(2),
          совпадает: Math.abs(data.basic_stats.conversion_rate - calculatedConversion) < 0.1 ? "✅" : "❌"
        });
      }
    }
    
    console.log("📊КОНЕЦ ЗАПРОСА СТАТИСТИКИ \n");
    return data;
    
  } catch (error) {
    console.error("📊 Ошибка при получении детальной статистики:", error);
    console.log("📊ОШИБКА ЗАПРОСА СТАТИСТИКИ\n");
    return null;
  }
}