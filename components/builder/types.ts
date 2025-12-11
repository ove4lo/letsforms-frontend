export type ElementsType =
  | "TextField"
  | "TextareaField"
  | "SelectField"
  | "CheckboxField"
  | "DateField"
  | "TitleField"
  | "SubTitleField"
  | "ParagraphField"
  | "SeparatorField"
  | "SpacerField"
  | "NumberField";

export type FormElementInstance = {
  id: string;
  type: ElementsType;
  extraAttributes?: Record<string, any>;
};

export type DesignerElementProps = {
  elementInstance: FormElementInstance;
};