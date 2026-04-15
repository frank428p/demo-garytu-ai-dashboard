import apiClient from "@/lib/axios";
import type { ApiResponse, ApiMeta } from "@/@core/types/apiConfig";
import type { Label, GetLabelsParams, LabelFormData } from "@/@core/types/label";

export type LabelListResponse = ApiResponse<Label[]> & { meta: ApiMeta };
export type LabelResponse = ApiResponse<Label>;
export type DeleteLabelResponse = ApiResponse<null>;

export async function getLabels(params?: GetLabelsParams): Promise<LabelListResponse> {
  const response = await apiClient.get<LabelListResponse>("/cms/labels", { params });
  return response.data;
}

export async function getLabel(id: string): Promise<LabelResponse> {
  const response = await apiClient.get<LabelResponse>(`/cms/labels/${id}`);
  return response.data;
}

export async function createLabel(data: LabelFormData): Promise<LabelResponse> {
  const response = await apiClient.post<LabelResponse>("/cms/labels", data);
  return response.data;
}

export async function updateLabel(
  id: string,
  data: Partial<LabelFormData>
): Promise<LabelResponse> {
  const response = await apiClient.patch<LabelResponse>(`/cms/labels/${id}`, data);
  return response.data;
}

export async function deleteLabel(id: string): Promise<DeleteLabelResponse> {
  const response = await apiClient.delete<DeleteLabelResponse>(`/cms/labels/${id}`);
  return response.data;
}
