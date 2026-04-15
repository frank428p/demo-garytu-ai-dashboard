import { Locale } from "./common";

export interface CategoryTranslation {
  locale: Locale;
  name: string;
}

export interface Category {
  id: number;
  code: string;
  enabled: boolean;
  translations: CategoryTranslation[];
  created_at: string;
  updated_at: string;
}

export interface GetCategoriesParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface CategoryFormData {
  code: string;
  translations: CategoryTranslation[];
  enabled?: boolean;
}
