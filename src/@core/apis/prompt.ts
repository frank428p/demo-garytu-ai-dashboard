import apiClient from "@/lib/axios";
import type { ApiResponse, ApiMeta } from "@/@core/types/apiConfig";
import type { Prompt, PromptFile, GetPromptsParams, PromptFormData } from "@/@core/types/prompt";

export type PromptListResponse = ApiResponse<Prompt[]> & { meta: ApiMeta };
export type FeaturedPromptListResponse = ApiResponse<Prompt[]> & { meta: ApiMeta };
export type FeaturedPromptUpdateResponse = ApiResponse<Prompt[]>;

export interface GetFeaturedPromptsParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface FeaturedPromptItem {
  id: number;
  rank: number;
}

export interface UpdateFeaturedPromptsPayload {
  items: FeaturedPromptItem[];
}
export type PromptResponse = ApiResponse<Prompt>;

export async function getPrompts(params?: GetPromptsParams): Promise<PromptListResponse> {
  const response = await apiClient.get<PromptListResponse>("/cms/prompts", { params });
  return response.data;
}

export async function getPrompt(id: string): Promise<PromptResponse> {
  const response = await apiClient.get<PromptResponse>(`/cms/prompts/${id}`);
  return response.data;
}

export async function createPrompt(data: PromptFormData): Promise<PromptResponse> {
  const response = await apiClient.post<PromptResponse>("/cms/prompts", data);
  return response.data;
}

export async function updatePrompt(
  id: string,
  data: Partial<PromptFormData>
): Promise<PromptResponse> {
  const response = await apiClient.patch<PromptResponse>(`/cms/prompts/${id}`, data);
  return response.data;
}

export async function getFeaturedPrompts(
  params?: GetFeaturedPromptsParams
): Promise<FeaturedPromptListResponse> {
  const response = await apiClient.get<FeaturedPromptListResponse>("/cms/prompts/featured", {
    params,
  });
  return response.data;
}

export async function updateFeaturedPrompts(
  payload: UpdateFeaturedPromptsPayload
): Promise<FeaturedPromptUpdateResponse> {
  const response = await apiClient.patch<FeaturedPromptUpdateResponse>(
    "/cms/prompts/featured",
    payload
  );
  return response.data;
}

export interface UpdatePromptFilesPayload {
  cover?: { id?: string; file_key?: string; thumbnail_file_key?: string };
  pdf?: { id?: string; file_key?: string };
  media?: Array<{ id?: string; file_key?: string; thumbnail_file_key?: string; position: number }>;
  delete_ids?: string[];
}

export type PromptFilesResponse = ApiResponse<{
  cover: PromptFile | null;
  pdf: PromptFile | null;
  media: PromptFile[];
}>;

export async function updatePromptFiles(
  id: string,
  payload: UpdatePromptFilesPayload,
  files?: Record<string, File>
): Promise<PromptFilesResponse> {
  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));
  if (files) {
    for (const [key, file] of Object.entries(files)) {
      formData.append(key, file);
    }
  }
  const response = await apiClient.patch<PromptFilesResponse>(
    `/cms/prompts/${id}/files`,
    formData,
    {
      headers: { "Content-Type": undefined },
    }
  );
  return response.data;
}
