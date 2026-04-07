import apiClient from '@/lib/axios'
import type { ApiResponse, ApiMeta } from '@/@core/types/apiConfig'
import type { Prompt, GetPromptsParams } from '@/@core/types/prompt'

export type PromptListResponse = ApiResponse<Prompt[]> & { meta: ApiMeta }

export async function getPrompts(params?: GetPromptsParams): Promise<PromptListResponse> {
  const response = await apiClient.get<PromptListResponse>('/cms/prompts', { params })
  return response.data
}
