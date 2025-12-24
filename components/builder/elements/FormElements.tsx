import { TextFieldDesigner } from "./TextFieldDesigner";
import { TextFieldForm } from "./TextFieldForm";
import { TextFieldProperties } from "./TextFieldProperties";

import { TextareaFieldDesigner } from "./TextareaFieldDesigner";
import { TextareaFieldForm } from "./TextareaFieldForm";
import { TextareaFieldProperties } from "./TextareaFieldProperties";

import { SelectFieldDesigner } from "./SelectFieldDesigner";
import { SelectFieldForm } from "./SelectFieldForm";
import { SelectFieldProperties } from "./SelectFieldProperties";

import { CheckboxFieldDesigner } from "./CheckboxFieldDesigner";
import { CheckboxFieldForm } from "./CheckboxFieldForm";
import { CheckboxFieldProperties } from "./CheckboxFieldProperties";

import { RadioFieldDesigner } from "./RadioFieldDesigner";
import { RadioFieldForm } from "./RadioFieldForm";
import { RadioFieldProperties } from "./RadioFieldProperties";

import { DateFieldDesigner } from "./DateFieldDesigner";
import { DateFieldForm } from "./DateFieldForm";
import { DateFieldProperties } from "./DateFieldProperties";

import { NumberFieldDesigner } from "./NumberFieldDesigner";
import { NumberFieldForm } from "./NumberFieldForm";
import { NumberFieldProperties } from "./NumberFieldProperties";

import { TitleFieldDesigner } from "./TitleFieldDesigner";
import { TitleFieldForm } from "./TitleFieldForm";
import { TitleFieldProperties } from "./TitleFieldProperties";

import { SubTitleFieldDesigner } from "./SubTitleFieldDesigner";
import { SubTitleFieldForm } from "./SubTitleFieldForm";
import { SubTitleFieldProperties } from "./SubTitleFieldProperties";

import { ParagraphFieldDesigner } from "./ParagraphFieldDesigner";
import { ParagraphFieldForm } from "./ParagraphFieldForm";
import { ParagraphFieldProperties } from "./ParagraphFieldProperties";

import { SeparatorFieldDesigner } from "./SeparatorFieldDesigner";
import { SeparatorFieldForm } from "./SeparatorFieldForm";

import { SpacerFieldDesigner } from "./SpacerFieldDesigner";
import { SpacerFieldForm } from "./SpacerFieldForm";

import { ScaleFieldDesigner } from "./ScaleFieldDesigner";
import { ScaleFieldForm } from "./ScaleFieldForm";
import { ScaleFieldProperties } from "./ScaleFieldProperties";

const NoProperties = () => null;

export const FormElements = {
  TextField: {
    designerComponent: TextFieldDesigner,
    formComponent: TextFieldForm,
    propertiesComponent: TextFieldProperties,
  },
  TextareaField: {
    designerComponent: TextareaFieldDesigner,
    formComponent: TextareaFieldForm,
    propertiesComponent: TextareaFieldProperties,
  },
  SelectField: {
    designerComponent: SelectFieldDesigner,
    formComponent: SelectFieldForm,
    propertiesComponent: SelectFieldProperties,
  },
  CheckboxField: {
    designerComponent: CheckboxFieldDesigner,
    formComponent: CheckboxFieldForm,
    propertiesComponent: CheckboxFieldProperties,
  },
  RadioField: {
    designerComponent: RadioFieldDesigner,
    formComponent: RadioFieldForm,
    propertiesComponent: RadioFieldProperties,
  },
  DateField: {
    designerComponent: DateFieldDesigner,
    formComponent: DateFieldForm,
    propertiesComponent: DateFieldProperties,
  },
  NumberField: {
    designerComponent: NumberFieldDesigner,
    formComponent: NumberFieldForm,
    propertiesComponent: NumberFieldProperties,
  },
  TitleField: {
    designerComponent: TitleFieldDesigner,
    formComponent: TitleFieldForm,
    propertiesComponent: TitleFieldProperties,
  },
  SubTitleField: {
    designerComponent: SubTitleFieldDesigner,
    formComponent: SubTitleFieldForm,
    propertiesComponent: SubTitleFieldProperties,
  },
  ParagraphField: {
    designerComponent: ParagraphFieldDesigner,
    formComponent: ParagraphFieldForm,
    propertiesComponent: ParagraphFieldProperties,
  },
  SeparatorField: {
    designerComponent: SeparatorFieldDesigner,
    formComponent: SeparatorFieldForm,
    propertiesComponent: NoProperties,
  },
  SpacerField: {
    designerComponent: SpacerFieldDesigner,
    formComponent: SpacerFieldForm,
    propertiesComponent: NoProperties,
  },

  ScaleField: {
    designerComponent: ScaleFieldDesigner,
    formComponent: ScaleFieldForm,
    propertiesComponent: ScaleFieldProperties,
  },
} as const;