const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const BASIC_AUTH = process.env.NEXT_PUBLIC_API_BASIC_AUTH
  ? "Basic " + btoa(process.env.NEXT_PUBLIC_API_BASIC_AUTH)
  : "";

const TELEGRAM_ID = "123456789";

const getHeaders = () => ({
  "Content-Type": "application/json",
  ...(BASIC_AUTH ? { Authorization: BASIC_AUTH } : {}),
});

const mapClientTypeToServer = (type: string): string => {
  const map: Record<string, string> = {
    TextField: "text",
    TextareaField: "text_area",
    SelectField: "single_choice",
    RadioField: "single_choice",
    CheckboxField: "multiple_choice",
    NumberField: "number",
    ScaleField: "scale",
    DateField: "date",
    TitleField: "info",
    SubTitleField: "info",
    ParagraphField: "info",
  };
  return map[type] || "text";
};

// Получение всех форм
export async function getMyForms() {
  try {
    const url = `${API_BASE}/forms/by_tg_id/?tg_id=${TELEGRAM_ID}`;
    console.log("Запрос к:", url);

    const res = await fetch(url, {
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("HTTP error:", res.status, await res.text());
      return { results: [], user_statistics: null };
    }

    const data = await res.json();
    console.log("Ответ от сервера:", data);
    
    if (data && data.results && Array.isArray(data.results)) {
      return {
        results: data.results,
        user_statistics: data.user_statistics || null,
      };
    }

    return { results: [], user_statistics: null };
  } catch (error) {
    console.error("getMyForms error:", error);
    return { results: [], user_statistics: null };
  }
}

export async function getFormByHash(hash: string) {
  if (!hash) {
    console.error("Hash пустой!");
    return null;
  }

  const url = `${API_BASE}/forms/${hash}/`;

  try {
    const res = await fetch(url, {
      headers: getHeaders(),
      cache: "no-store",
    });

    console.log("Статус ответа:", res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error("Ошибка от сервера:", res.status, text);
      return null;
    }

    const data = await res.json();
    console.log("Форма успешно загружена:", data);
    return data;
  } catch (error: any) {
    console.error("Ошибка fetch (сеть/CORS/таймаут):", error.message);
    return null;
  }
}

export async function createForm(data: { name: string; description?: string }) {
  try {
    const res = await fetch(`${API_BASE}/forms/telegram/${TELEGRAM_ID}/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        title: data.name,
        description: data.description || null,
        type: "survey",
        status: "draft",
      }),
    });

    if (!res.ok) throw new Error("Ошибка создания");
    return await res.json();
  } catch (error) {
    console.error("createForm error:", error);
    throw error;
  }
}

export async function saveForm(hash: string, data: { title: string; elements: any[] }) {
  try {
    const formRes = await fetch(`${API_BASE}/forms/${hash}/`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        tg_id: TELEGRAM_ID,
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

    const questions = data.elements.map((el, index) => ({
      type: mapClientTypeToServer(el.type),
      text: el.extraAttributes?.label || "Без названия",
      is_required: !!el.extraAttributes?.required,
      order: index + 1,
      options: el.extraAttributes?.options || null,
    }));

    const questionsRes = await fetch(`${API_BASE}/forms/${hash}/add_questions/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        tg_id: TELEGRAM_ID,
        questions,
      }),
    });

    if (!questionsRes.ok) {
      const text = await questionsRes.text();
      console.error("Ответ сервера:", text);
      throw new Error(`Ошибка добавления вопросов: ${questionsRes.status} ${text}`);
    }

    console.log("Форма и вопросы успешно сохранены!");
    return await questionsRes.json();
  } catch (error) {
    console.error("saveForm error:", error);
    throw error;
  }
}