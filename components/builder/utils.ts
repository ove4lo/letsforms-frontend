import { ElementsType, FormElementInstance } from "./types";

// Фабрика дефолтных атрибутов для каждого типа элемента
export const getDefaultAttributes = (type: ElementsType): Record<string, any> => {
  switch (type) {
    case "TextField":
    case "TextareaField":
      return {
        label: "Новое текстовое поле",
        required: false,
        placeholder: "Введите текст...",
      };
    case "NumberField":
      return {
        label: "Числовое поле",
        required: false,
        placeholder: "0",
        min: undefined,
        max: undefined,
      };
    case "DateField":
      return {
        label: "Выберите дату",
        required: false,
      };
    case "CheckboxField":
    case "RadioField":
    case "SelectField":
      return {
        label: "Выберите вариант",
        required: false,
        options: ["Вариант 1", "Вариант 2", "Вариант 3"],
      };
    case "ScaleField":
      return {
        label: "Оцените от 1 до 10",
        required: false,
        min: 1,
        max: 10,
        min_label: "Минимум",
        max_label: "Максимум",
      };
    case "ParagraphField":
      return {
        text: "Информационный блок. Напишите здесь полезный текст для пользователя.",
      };
    case "TitleField":
      return { text: "Заголовок формы" };
    case "SubTitleField":
      return { text: "Подзаголовок" };
    default:
      return {};
  }
};

// Функция создания нового элемента
export const createNewElement = (type: ElementsType): FormElementInstance => {
  return {
    id: crypto.randomUUID(),
    type,
    extraAttributes: getDefaultAttributes(type),
  };
};