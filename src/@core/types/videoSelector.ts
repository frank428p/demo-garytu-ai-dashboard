import { Locale } from "./common";

export type VideoSelectorType = "STYLE" | "MOVEMENT" | "MOTION";

export interface VideoSelectorTranslation {
  locale: Locale;
  name: string;
}

export interface CmsVideoSelectorFile {
  id: string;
  uuid: string;
  category: string;
  file_type: string;
  position: number;
  url: string;
  thumbnail_url?: string | null;
  thumbnail_id?: string | null;
  created_at?: string | null;
}

export interface CmsVideoSelectorResponse {
  id: string;
  uuid: string;
  selector_type: string;
  code: string;
  prompt: string;
  translations: VideoSelectorTranslation[];
  enabled: boolean;
  position: number;
  cover?: CmsVideoSelectorFile | null;
  created_at: string;
  updated_at: string;
}

export type CmsVideoSelectorDetailResponse = CmsVideoSelectorResponse;

export interface CmsVideoSelectorThumbnailResponse {
  id: string;
  uuid: string;
  category: string;
  file_type: string;
  position: number;
  url: string;
  created_at?: string | null;
}

export interface CmsVideoSelectorTypeThumbnailResponse {
  id: string;
  selector_type: string;
  has_global_thumbnail: boolean;
  thumbnail?: CmsVideoSelectorThumbnailResponse | null;
  created_at: string;
  updated_at: string;
}

export interface GetVideoSelectorsParams {
  page?: number;
  page_size?: number;
  search?: string;
  selector_type?: VideoSelectorType;
  enabled?: boolean;
}

export interface VideoSelectorTranslationRequest {
  locale: Locale;
  name: string;
}

export interface VideoSelectorFormData {
  selector_type: VideoSelectorType;
  code: string;
  prompt: string;
  translations: VideoSelectorTranslationRequest[];
  enabled?: boolean;
}

export interface VideoSelectorUpdateData {
  prompt?: string;
  translations?: VideoSelectorTranslationRequest[];
  enabled?: boolean;
}

export interface VideoSelectorPositionItem {
  id: number;
  position: number;
}

export interface UpdateVideoSelectorPositionsRequest {
  items: VideoSelectorPositionItem[];
}
