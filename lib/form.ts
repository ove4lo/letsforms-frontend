const API_BASE = process.env.NEXT_PUBLIC_API_BASE!; 
const BASIC_AUTH = process.env.NEXT_PUBLIC_API_BASIC_AUTH
  ? "Basic " + btoa(process.env.NEXT_PUBLIC_API_BASIC_AUTH)
  : "";

const TELEGRAM_ID = "123456789"; 

const getHeaders = () => ({
  "Content-Type": "application/json",
  ...(BASIC_AUTH ? { Authorization: BASIC_AUTH } : {}),
});

// Получение всех форм
export async function getMyForms() {
  try {
    const url = `${API_BASE}/forms/telegram/${TELEGRAM_ID}/`;
    console.log("Запрос к:", url);

    const res = await fetch(url, {
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("HTTP error:", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    console.log("Ответ от сервера:", data);

    if (data && data.forms && Array.isArray(data.forms)) {
      return data.forms;
    }

    return [];
  } catch (error) {
    console.error("Network error:", error);
    return [];
  }
}

// lib/form.ts
export async function getFormById(id: string) {
  try {
    const url = `${API_BASE}/forms/${id}/`;
    console.log("Загружаем форму:", url);

    const res = await fetch(url, {
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Форма не найдена или ошибка авторизации:", res.status, text);
      return null;
    }

    const data = await res.json();
    console.log("Форма получена:", data);
    return data;
  } catch (error) {
    console.error("getFormById error:", error);
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

export async function saveForm(id: string, data: { title: string; elements: any[] }) {
  try {
    const res = await fetch(`${API_BASE}/forms/telegram/${TELEGRAM_ID}/${id}/`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        title: data.title,
        content: JSON.stringify({ elements: data.elements }),
      }),
    });

    if (!res.ok) throw new Error("Ошибка сохранения");
    return await res.json();
  } catch (error) {
    console.error("saveForm error:", error);
    throw error;
  }
}