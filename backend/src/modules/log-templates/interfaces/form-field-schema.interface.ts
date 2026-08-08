export enum FormFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  PHOTO = 'PHOTO',
  SIGNATURE = 'SIGNATURE',
  TEMPERATURE = 'TEMPERATURE',
}

export interface FormFieldSchema {
  id: string;
  type: FormFieldType;
  label: string;
  required?: boolean;
  min?: number;
  max?: number;
  unit?: string;
  options?: string[];
}
