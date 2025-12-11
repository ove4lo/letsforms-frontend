import { TextFieldDesigner } from "./TextFieldDesigner";
import { TextFieldProperties } from "./TextFieldProperties";

import { TextareaFieldDesigner } from "./TextareaFieldDesigner";
import { TextareaFieldProperties } from "./TextareaFieldProperties";

import { SelectFieldDesigner } from "./SelectFieldDesigner";
import { SelectFieldProperties } from "./SelectFieldProperties";

import { CheckboxFieldDesigner } from "./CheckboxFieldDesigner";
import { CheckboxFieldProperties } from "./CheckboxFieldProperties";

import { RadioFieldDesigner } from "./RadioFieldDesigner";
import { RadioFieldProperties } from "./RadioFieldProperties";

import { DateFieldDesigner } from "./DateFieldDesigner";
import { DateFieldProperties } from "./DateFieldProperties";

import { NumberFieldDesigner } from "./NumberFieldDesigner";
import { NumberFieldProperties } from "./NumberFieldProperties";

import { TitleFieldDesigner } from "./TitleFieldDesigner";
import { TitleFieldProperties } from "./TitleFieldProperties";

import { SubTitleFieldDesigner } from "./SubTitleFieldDesigner";
import { SubTitleFieldProperties } from "./SubTitleFieldProperties";

import { ParagraphFieldDesigner } from "./ParagraphFieldDesigner";
import { ParagraphFieldProperties } from "./ParagraphFieldProperties";

import { SeparatorFieldDesigner } from "./SeparatorFieldDesigner";
import { SeparatorFieldProperties } from "./SeparatorFieldProperties";

import { SpacerFieldDesigner } from "./SpacerFieldDesigner";
import { SpacerFieldProperties } from "./SpacerFieldProperties";

export const FormElements = {
  TextField: {
    designerComponent: TextFieldDesigner,
    propertiesComponent: TextFieldProperties,
  },
  TextareaField: {
    designerComponent: TextareaFieldDesigner,
    propertiesComponent: TextareaFieldProperties,
  },
  SelectField: {
    designerComponent: SelectFieldDesigner,
    propertiesComponent: SelectFieldProperties,
  },
  CheckboxField: {
    designerComponent: CheckboxFieldDesigner,
    propertiesComponent: CheckboxFieldProperties,
  },
    RadioField: {
    designerComponent: RadioFieldDesigner,
    propertiesComponent: RadioFieldProperties,
  },
  DateField: {
    designerComponent: DateFieldDesigner,
    propertiesComponent: DateFieldProperties,
  },
  NumberField: {
    designerComponent: NumberFieldDesigner,
    propertiesComponent: NumberFieldProperties,
  },
  TitleField: {
    designerComponent: TitleFieldDesigner,
    propertiesComponent: TitleFieldProperties,
  },
  SubTitleField: {
    designerComponent: SubTitleFieldDesigner,
    propertiesComponent: SubTitleFieldProperties,
  },
  ParagraphField: {
    designerComponent: ParagraphFieldDesigner,
    propertiesComponent: ParagraphFieldProperties,
  },
  SeparatorField: {
    designerComponent: SeparatorFieldDesigner,
    propertiesComponent: SeparatorFieldProperties,
  },
  SpacerField: {
    designerComponent: SpacerFieldDesigner,
    propertiesComponent: SpacerFieldProperties,
  },
} as const;