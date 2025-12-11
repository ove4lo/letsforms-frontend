import { TextFieldDesigner } from "./TextFieldDesigner";
import { TextareaFieldDesigner } from "./TextareaFieldDesigner";
import { SelectFieldDesigner } from "./SelectFieldDesigner";
import { CheckboxFieldDesigner } from "./CheckboxFieldDesigner";
import { DateFieldDesigner } from "./DateFieldDesigner";
import { TitleFieldDesigner } from "./TitleFieldDesigner";
import { SubTitleFieldDesigner } from "./SubTitleFieldDesigner";
import { ParagraphFieldDesigner } from "./ParagraphFieldDesigner";
import { SeparatorFieldDesigner } from "./SeparatorFieldDesigner";
import { SpacerFieldDesigner } from "./SpacerFieldDesigner";
import { NumberFieldDesigner } from "./NumberFieldDesigner";

export const FormElements = {
  TextField: { designerComponent: TextFieldDesigner },
  TextareaField: { designerComponent: TextareaFieldDesigner },
  SelectField: { designerComponent: SelectFieldDesigner },
  CheckboxField: { designerComponent: CheckboxFieldDesigner },
  DateField: { designerComponent: DateFieldDesigner },
  TitleField: { designerComponent: TitleFieldDesigner },
  SubTitleField: { designerComponent: SubTitleFieldDesigner },
  ParagraphField: { designerComponent: ParagraphFieldDesigner },
  SeparatorField: { designerComponent: SeparatorFieldDesigner },
  SpacerField: { designerComponent: SpacerFieldDesigner },
  NumberField: { designerComponent: NumberFieldDesigner },
} as const;