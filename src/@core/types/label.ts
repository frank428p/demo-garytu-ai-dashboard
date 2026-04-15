import { Locale } from "./common";

export interface LabelTranslation {
  locale: Locale;
  name: string;
}

export interface Label {
  id: number;
  code: string;
  enabled: boolean;
  translations: LabelTranslation[];
  created_at: string;
  updated_at: string;
}

export interface GetLabelsParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface LabelFormData {
  code: string;
  translations: LabelTranslation[];
  enabled?: boolean;
}
