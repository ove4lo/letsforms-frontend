export type ElementsType =
  | "TextField"
  | "TextareaField"
  | "SelectField"
  | "CheckboxField"
  | "DateField"
  | "NumberField"
  | "TitleField"
  | "SubTitleField"
  | "ParagraphField"
  | "SeparatorField"
  | "SpacerField"
  | "RadioField";   
export type FormElementInstance = {
  id: string;
  type: ElementsType;
  extraAttributes?: Record<string, any>;
};

export type DesignerElementProps = {
  elementInstance: FormElementInstance;
};

export type PropertiesComponentProps = {
  elementInstance: FormElementInstance;
  updateElement: (updated: FormElementInstance) => void;
};