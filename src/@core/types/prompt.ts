import { Locale, Translation } from "./common";

export type MediaType = "IMAGE" | "VIDEO" | "AUDIO" | "TEXT";
export type FileType = "IMAGE" | "VIDEO" | "PDF" | "ZIP";
export interface PromptCategory {
  id: number;
  code: string;
  translations: Translation[];
}

export interface PromptLabel {
  code: string;
  name: string;
}

export interface PromptFile {
  id: string;
  uuid: string;
  category: string;
  file_type: FileType;
  position: number;
  url: string;
  thumbnail_url: string | null;
  created_at: string | null;
}

export interface PromptTranslation {
  locale: Locale;
  name: string;
  description: string;
}

export interface Prompt {
  id: string;
  uuid: string;
  // name: string;
  // description: string | null;
  translations: PromptTranslation[];
  media_type: MediaType;
  category: PromptCategory;
  price: number;
  bonus_credit: number;
  enabled: boolean;
  created_at: string | null;
  updated_at: string | null;
  cover: PromptFile;
  pdf: PromptFile;
  zip: PromptFile;
  files: PromptFile[];
  labels: PromptLabel[];
}

export interface GetPromptsParams {
  page?: number;
  page_size?: number;
  [key: string]: unknown;
}

export interface PromptFormData {
  translations: PromptTranslation[];
  media_type: MediaType;
  category_id: number;
  label_id: number;
  price: number;
  bonus_credit: number;
  enabled: boolean;
  label_codes: string[];
}
