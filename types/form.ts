// Тип для статуса формы
export type FormStatus = 'draft' | 'active' | 'paused' | 'archived';

// Интерфейс для вопроса формы (как приходит с сервера)
export interface ServerQuestion {
  id: number | string; // ID вопроса, может быть числом или строкой
  type: string; // Тип вопроса (например, 'text', 'single_choice')
  text: string; // Текст вопроса
  is_required: boolean; // Обязательный ли вопрос
  order: number; // Порядок вопроса
  placeholder?: string; // Плейсхолдер (если применимо)
  options?: any; // Опции для выбора (структура может варьироваться)
  min?: number; // Минимальное значение (для числовых/шкальных полей)
  max?: number; // Максимальное значение (для числовых/шкальных полей)
  min_label?: string; // Метка минимума (для шкальных полей)
  max_label?: string; // Метка максимума (для шкальных полей)
}

// Интерфейс для ответа на вопрос (как приходит с сервера)
export interface ServerResponse {
  id: number; // ID ответа
  question_id: number; // ID вопроса, на который дан ответ
  answer: any; // Сам ответ (может быть строкой, числом, массивом и т.д.)
  tg_id: string; // ID пользователя Telegram
  username: string; // Имя пользователя Telegram
  created_at: string; // Дата создания ответа (ISO строка)
  question_order: number; // Порядок вопроса (для сортировки)
  question_text: string; // Текст вопроса (для отображения)
}

// Интерфейс для полного ответа от getResponsesByHash
export interface GetResponsesResponse {
  responses: ServerResponse[]; // Массив ответов
}

// Интерфейс для статистики формы
export interface FormStatistics {
  visit_count: number; // Количество посещений
  response_count: number; // Количество ответов
  conversion_rate: number; // Конверсия
}

// Интерфейс для полной формы (административная версия)
export interface AdminServerForm {
  hash: string; // Уникальный хэш формы
  title: string; // Название формы
  description?: string; // Описание формы (опционально)
  status: FormStatus; // Статус формы
  type: string; // Тип формы (например, 'survey')
  created_at: string; // Дата создания (ISO строка)
  updated_at: string; // Дата обновления (ISO строка)
  tg_id: string; // ID создателя (Telegram)
  questions: ServerQuestion[]; // Список вопросов
  visit_count?: number;
  response_count?: number;
  conversion_rate?: number;
}

// Интерфейс для публичной формы
export interface PublicServerForm {
  hash: string;
  title: string;
  description?: string;
  status: FormStatus; 
  questions: ServerQuestion[];
}

export interface FormSummary {
  hash: string;
  title: string;
  description: string | null;
  status: FormStatus;
  created_at: string;
  visit_count: number;
  response_count: number;
  conversion_rate: number;
}


// интерфейс GetMyFormsResponse
export interface GetMyFormsResponse {
  results: FormSummary[];
  user_statistics?: UserStatistics;
  count?: number;
  next?: string | null;
  previous?: string | null;
}

// статистика пользователя
export interface UserStatistics {
  total_visits: number;
  total_responses: number;
  overall_conversion_rate: number;
  overall_bounce_rate: number;
}