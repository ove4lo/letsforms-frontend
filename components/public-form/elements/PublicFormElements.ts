import { FormElementInstance } from "@/components/builder/types";

import { TextFieldFormComponent } from "./TextFieldFormComponent";
import { TextareaFieldFormComponent } from "./TextareaFieldFormComponent";
import { RadioFieldFormComponent } from "./RadioFieldFormComponent";
import { CheckboxFieldFormComponent } from "./CheckboxFieldFormComponent";
import { SelectFieldFormComponent } from "./SelectFieldFormComponent";
import { NumberFieldFormComponent } from "./NumberFieldFormComponent";
import { ScaleFieldFormComponent } from "./ScaleFieldFormComponent";
import { DateFieldFormComponent } from "./DateFieldFormComponent";
import { ParagraphFieldFormComponent } from "./ParagraphFieldFormComponent";
import { TitleFieldFormComponent } from "./TitleFieldFormComponent";
import { SubTitleFieldFormComponent } from "./SubTitleFieldFormComponent";

export const PublicFormElements = {
  TextField: { formComponent: TextFieldFormComponent },
  TextareaField: { formComponent: TextareaFieldFormComponent },
  RadioField: { formComponent: RadioFieldFormComponent },
  CheckboxField: { formComponent: CheckboxFieldFormComponent },
  SelectField: { formComponent: SelectFieldFormComponent },
  NumberField: { formComponent: NumberFieldFormComponent },
  ScaleField: { formComponent: ScaleFieldFormComponent },
  DateField: { formComponent: DateFieldFormComponent },
  ParagraphField: { formComponent: ParagraphFieldFormComponent },
  TitleField: { formComponent: TitleFieldFormComponent },
  SubTitleField: { formComponent: SubTitleFieldFormComponent },
} as const;

export type PublicElementsType = keyof typeof PublicFormElements;